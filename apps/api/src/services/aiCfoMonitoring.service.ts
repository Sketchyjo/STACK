import { logger } from './logger.service';
import { aiCfoConfig } from '../config/aiCfo.config';
import { zeroGService } from './zeroGService';
import cron from 'node-cron';

/**
 * Monitoring and Error Handling Service for AI CFO
 * Provides comprehensive monitoring, metrics, alerts, and error handling
 */
export class AiCfoMonitoringService {
  private metrics: Map<string, any> = new Map();
  private alerts: Array<any> = [];
  private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  private errorCounts: Map<string, number> = new Map();
  private lastHealthCheck = 0;
  private isInitialized = false;

  // Performance metrics
  private performanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalResponseTime: 0,
    tokenUsage: 0,
    costAccumulated: 0,
    uniqueUsers: new Set<string>(),
    modelUsage: new Map<string, number>(),
    errorsByType: new Map<string, number>(),
    hourlyStats: new Map<string, any>()
  };

  // Alert thresholds
  private alertThresholds = {
    errorRate: 0.1, // 10% error rate
    responseTimeP95: 30000, // 30 seconds
    consecutiveFailures: aiCfoConfig.monitoring.alertFailureThreshold,
    lowBalance: aiCfoConfig.monitoring.alertLowBalance,
    highTokenUsage: 5000, // tokens per hour
    unusualActivity: 100 // requests per minute per user
  };

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring service
   */
  private async initializeMonitoring(): Promise<void> {
    try {
      if (aiCfoConfig.monitoring.enableHealthChecks) {
        this.scheduleHealthChecks();
      }

      if (aiCfoConfig.monitoring.enableMetrics) {
        this.scheduleMetricsCollection();
      }

      this.isInitialized = true;
      logger.info('AI CFO Monitoring Service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize AI CFO Monitoring Service:', error);
      throw error;
    }
  }

  /**
   * Schedule health checks
   */
  private scheduleHealthChecks(): void {
    // Regular health checks
    cron.schedule('*/5 * * * *', async () => { // Every 5 minutes
      await this.performHealthCheck();
    });

    // Account balance checks
    cron.schedule('0 */6 * * *', async () => { // Every 6 hours
      await this.checkAccountBalance();
    });

    // Metrics cleanup
    cron.schedule('0 0 * * *', () => { // Daily
      this.cleanupOldMetrics();
    });

    logger.info('AI CFO health check schedules initialized');
  }

  /**
   * Schedule metrics collection
   */
  private scheduleMetricsCollection(): void {
    // Collect hourly statistics
    cron.schedule('0 * * * *', () => { // Every hour
      this.collectHourlyMetrics();
    });

    // Generate daily reports
    cron.schedule('0 1 * * *', async () => { // Daily at 1 AM
      await this.generateDailyMetricsReport();
    });
  }

  /**
   * Track request metrics
   */
  trackRequest(
    userId: string | undefined, 
    model: string, 
    responseTime: number, 
    success: boolean, 
    tokensUsed: number = 0,
    errorType?: string
  ): void {
    try {
      this.performanceMetrics.totalRequests++;
      
      if (success) {
        this.performanceMetrics.successfulRequests++;
      } else {
        this.performanceMetrics.failedRequests++;
        if (errorType) {
          this.performanceMetrics.errorsByType.set(
            errorType,
            (this.performanceMetrics.errorsByType.get(errorType) || 0) + 1
          );
        }
      }

      // Track response time
      this.performanceMetrics.totalResponseTime += responseTime;
      this.performanceMetrics.averageResponseTime = 
        this.performanceMetrics.totalResponseTime / this.performanceMetrics.totalRequests;

      // Track token usage
      this.performanceMetrics.tokenUsage += tokensUsed;

      // Track unique users
      if (userId) {
        this.performanceMetrics.uniqueUsers.add(userId);
      }

      // Track model usage
      this.performanceMetrics.modelUsage.set(
        model,
        (this.performanceMetrics.modelUsage.get(model) || 0) + 1
      );

      // Check for alerts
      this.checkAlertConditions(userId, model, responseTime, success, errorType);

    } catch (error) {
      logger.error('Error tracking request metrics:', error);
    }
  }

  /**
   * Track error occurrence
   */
  trackError(
    errorType: string, 
    errorMessage: string, 
    context: any = {},
    userId?: string
  ): void {
    try {
      const errorKey = `${errorType}:${userId || 'system'}`;
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

      // Log error details
      logger.error('AI CFO Error tracked:', {
        type: errorType,
        message: errorMessage,
        context,
        userId,
        timestamp: new Date().toISOString(),
        count: this.errorCounts.get(errorKey)
      });

      // Check if error rate is too high
      if (this.errorCounts.get(errorKey)! >= this.alertThresholds.consecutiveFailures) {
        this.createAlert('high_error_rate', {
          errorType,
          errorMessage,
          userId,
          count: this.errorCounts.get(errorKey),
          context
        });
      }

    } catch (error) {
      logger.error('Error tracking error (meta-error):', error);
    }
  }

  /**
   * Clear error count for successful operations
   */
  clearErrorCount(errorType: string, userId?: string): void {
    const errorKey = `${errorType}:${userId || 'system'}`;
    this.errorCounts.delete(errorKey);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, any>;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    this.lastHealthCheck = Date.now();
    
    const checks: Record<string, any> = {};

    try {
      // Check 0G network status
      checks.zgNetwork = await this.checkZGNetworkHealth();

      // Check account balance
      checks.accountBalance = await this.checkAccountBalance();

      // Check service configuration
      checks.configuration = this.checkConfigurationHealth();

      // Check recent error rates
      checks.errorRates = this.checkErrorRates();

      // Check response times
      checks.performance = this.checkPerformanceMetrics();

      // Determine overall health status
      const unhealthyChecks = Object.values(checks).filter(check => check.status === 'unhealthy').length;
      const degradedChecks = Object.values(checks).filter(check => check.status === 'degraded').length;

      if (unhealthyChecks > 0) {
        this.healthStatus = 'unhealthy';
      } else if (degradedChecks > 0) {
        this.healthStatus = 'degraded';
      } else {
        this.healthStatus = 'healthy';
      }

      logger.info(`AI CFO Health Check completed: ${this.healthStatus}`, {
        checks: Object.fromEntries(
          Object.entries(checks).map(([key, value]) => [key, value.status])
        )
      });

      return {
        status: this.healthStatus,
        checks,
        timestamp
      };

    } catch (error) {
      logger.error('Health check failed:', error);
      this.healthStatus = 'unhealthy';
      
      return {
        status: 'unhealthy',
        checks: {
          healthCheckSystem: {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        timestamp
      };
    }
  }

  /**
   * Check 0G network health
   */
  private async checkZGNetworkHealth(): Promise<any> {
    try {
      const networkStatus = await zeroGService.getNetworkStatus();
      
      if (!networkStatus.success) {
        return {
          status: 'unhealthy',
          error: networkStatus.error,
          lastChecked: new Date().toISOString()
        };
      }

      return {
        status: 'healthy',
        details: networkStatus.status,
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Check account balance
   */
  private async checkAccountBalance(): Promise<any> {
    try {
      // This would check with the actual AI CFO service
      // For now, return a mock status
      const mockBalance = 2.5; // OG tokens

      if (mockBalance < this.alertThresholds.lowBalance) {
        this.createAlert('low_balance', {
          currentBalance: mockBalance,
          threshold: this.alertThresholds.lowBalance
        });

        return {
          status: 'degraded',
          balance: mockBalance,
          threshold: this.alertThresholds.lowBalance,
          message: 'Account balance is low'
        };
      }

      return {
        status: 'healthy',
        balance: mockBalance,
        threshold: this.alertThresholds.lowBalance
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check configuration health
   */
  private checkConfigurationHealth(): any {
    try {
      const requiredConfig = [
        aiCfoConfig.zg.evmRpc,
        aiCfoConfig.models.default,
        aiCfoConfig.models.providers[aiCfoConfig.models.default]
      ];

      const missingConfig = requiredConfig.filter(config => !config);

      if (missingConfig.length > 0) {
        return {
          status: 'unhealthy',
          error: 'Missing required configuration',
          missingCount: missingConfig.length
        };
      }

      return {
        status: 'healthy',
        configValidated: true
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check error rates
   */
  private checkErrorRates(): any {
    try {
      const totalRequests = this.performanceMetrics.totalRequests;
      const failedRequests = this.performanceMetrics.failedRequests;
      
      if (totalRequests === 0) {
        return {
          status: 'healthy',
          errorRate: 0,
          message: 'No requests processed yet'
        };
      }

      const errorRate = failedRequests / totalRequests;

      if (errorRate > this.alertThresholds.errorRate) {
        return {
          status: 'degraded',
          errorRate: Math.round(errorRate * 100) / 100,
          threshold: this.alertThresholds.errorRate,
          totalRequests,
          failedRequests
        };
      }

      return {
        status: 'healthy',
        errorRate: Math.round(errorRate * 100) / 100,
        totalRequests,
        failedRequests
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check performance metrics
   */
  private checkPerformanceMetrics(): any {
    try {
      const avgResponseTime = this.performanceMetrics.averageResponseTime;

      if (avgResponseTime > this.alertThresholds.responseTimeP95) {
        return {
          status: 'degraded',
          averageResponseTime: avgResponseTime,
          threshold: this.alertThresholds.responseTimeP95,
          message: 'Response times are elevated'
        };
      }

      return {
        status: 'healthy',
        averageResponseTime: avgResponseTime,
        totalRequests: this.performanceMetrics.totalRequests
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check alert conditions
   */
  private checkAlertConditions(
    userId: string | undefined,
    model: string,
    responseTime: number,
    success: boolean,
    errorType?: string
  ): void {
    try {
      // High response time alert
      if (responseTime > this.alertThresholds.responseTimeP95) {
        this.createAlert('high_response_time', {
          responseTime,
          threshold: this.alertThresholds.responseTimeP95,
          userId,
          model
        });
      }

      // Model-specific failure alert
      if (!success && errorType) {
        this.createAlert('model_failure', {
          model,
          errorType,
          userId,
          responseTime
        });
      }

    } catch (error) {
      logger.error('Error checking alert conditions:', error);
    }
  }

  /**
   * Create alert
   */
  private createAlert(type: string, data: any): void {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: this.getAlertSeverity(type),
      data,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    logger.warn(`AI CFO Alert created: ${type}`, alert);
  }

  /**
   * Get alert severity
   */
  private getAlertSeverity(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'low_balance': 'high',
      'high_error_rate': 'critical',
      'model_failure': 'medium',
      'high_response_time': 'medium',
      'configuration_error': 'high',
      'network_issue': 'high'
    };

    return severityMap[type] || 'medium';
  }

  /**
   * Collect hourly metrics
   */
  private collectHourlyMetrics(): void {
    const hour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH

    const hourlyData = {
      timestamp: hour,
      requests: this.performanceMetrics.totalRequests,
      successfulRequests: this.performanceMetrics.successfulRequests,
      failedRequests: this.performanceMetrics.failedRequests,
      averageResponseTime: this.performanceMetrics.averageResponseTime,
      tokenUsage: this.performanceMetrics.tokenUsage,
      uniqueUsers: this.performanceMetrics.uniqueUsers.size,
      modelUsage: Object.fromEntries(this.performanceMetrics.modelUsage),
      topErrors: Object.fromEntries(
        Array.from(this.performanceMetrics.errorsByType.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      )
    };

    this.performanceMetrics.hourlyStats.set(hour, hourlyData);

    // Keep only last 24 hours
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 13);
    for (const [hour] of this.performanceMetrics.hourlyStats) {
      if (hour < cutoffTime) {
        this.performanceMetrics.hourlyStats.delete(hour);
      }
    }

    logger.info(`Hourly metrics collected for ${hour}`, hourlyData);
  }

  /**
   * Generate daily metrics report
   */
  private async generateDailyMetricsReport(): Promise<void> {
    try {
      const report = {
        date: new Date().toISOString().slice(0, 10),
        summary: {
          totalRequests: this.performanceMetrics.totalRequests,
          successRate: this.performanceMetrics.totalRequests > 0 
            ? this.performanceMetrics.successfulRequests / this.performanceMetrics.totalRequests 
            : 0,
          averageResponseTime: this.performanceMetrics.averageResponseTime,
          tokenUsage: this.performanceMetrics.tokenUsage,
          uniqueUsers: this.performanceMetrics.uniqueUsers.size,
          alertsGenerated: this.alerts.length
        },
        modelUsage: Object.fromEntries(this.performanceMetrics.modelUsage),
        topErrors: Object.fromEntries(
          Array.from(this.performanceMetrics.errorsByType.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
        ),
        hourlyBreakdown: Array.from(this.performanceMetrics.hourlyStats.values()),
        recentAlerts: this.alerts.slice(-10)
      };

      // Store report (could be sent to monitoring service, saved to file, etc.)
      logger.info('Daily AI CFO metrics report generated', report);

      // Reset daily counters (optional)
      // this.resetDailyMetrics();

    } catch (error) {
      logger.error('Error generating daily metrics report:', error);
    }
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    try {
      // Clean up old alerts (keep last 30 days)
      const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
      this.alerts = this.alerts.filter(alert => 
        new Date(alert.timestamp).getTime() > cutoff
      );

      // Clean up old error counts
      this.errorCounts.clear();

      logger.info('Old metrics cleaned up');

    } catch (error) {
      logger.error('Error cleaning up metrics:', error);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): any {
    return {
      performance: {
        ...this.performanceMetrics,
        uniqueUsers: this.performanceMetrics.uniqueUsers.size,
        modelUsage: Object.fromEntries(this.performanceMetrics.modelUsage),
        errorsByType: Object.fromEntries(this.performanceMetrics.errorsByType)
      },
      health: {
        status: this.healthStatus,
        lastHealthCheck: new Date(this.lastHealthCheck).toISOString(),
        isInitialized: this.isInitialized
      },
      alerts: {
        total: this.alerts.length,
        recent: this.alerts.slice(-10),
        unresolved: this.alerts.filter(a => !a.resolved).length
      },
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
  }

  /**
   * Get service status
   */
  getStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    initialized: boolean;
    lastHealthCheck: string;
    alerts: number;
  } {
    return {
      status: this.healthStatus,
      initialized: this.isInitialized,
      lastHealthCheck: new Date(this.lastHealthCheck).toISOString(),
      alerts: this.alerts.filter(a => !a.resolved).length
    };
  }
}

// Export singleton instance
export const aiCfoMonitoringService = new AiCfoMonitoringService();