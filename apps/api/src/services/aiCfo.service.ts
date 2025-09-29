import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { logger } from './logger.service';
import { zeroGService } from './zeroGService';
import { encryptionService } from './encryption.service';
import { aiCfoMonitoringService } from './aiCfoMonitoring.service';
import { aiCfoConfig } from '../config/aiCfo.config';
import cron from 'node-cron';

/**
 * AI CFO Service powered by 0G Compute Network
 * Provides automated financial insights, weekly performance summaries, and personalized nudges
 */
export class AiCfoService {
  private broker: any = null;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private isInitialized = false;
  
  // 0G Official Service Providers
  private readonly OFFICIAL_PROVIDERS = {
    'gpt-oss-120b': '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
    'deepseek-r1-70b': '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3'
  };

  // Service configuration (use centralized config)
  private readonly config = {
    defaultModel: aiCfoConfig.models.default,
    fallbackModel: aiCfoConfig.models.fallback,
    maxRetries: aiCfoConfig.service.maxRetries,
    retryDelay: aiCfoConfig.service.retryDelay,
    weeklyReportSchedule: aiCfoConfig.schedules.weeklyReports,
    dailyNudgeSchedule: aiCfoConfig.schedules.dailyNudges,
    accountTopUpThreshold: aiCfoConfig.account.topUpThreshold,
    minimumBalance: aiCfoConfig.account.minimumBalance,
  };

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(
      process.env.ZG_EVM_RPC || 'https://evmrpc-testnet.0g.ai'
    );

    // Initialize signer if private key is available
    if (process.env.ZG_PRIVATE_KEY) {
      this.signer = new ethers.Wallet(process.env.ZG_PRIVATE_KEY, this.provider);
    }

    this.initializeService();
  }

  /**
   * Initialize the 0G Compute broker and schedule automated tasks
   */
  private async initializeService(): Promise<void> {
    try {
      if (!this.signer) {
        logger.warn('AI CFO Service: No private key provided, service will have limited functionality');
        return;
      }

      // Create 0G Compute Network broker
      this.broker = await createZGComputeNetworkBroker(this.signer);
      
      // Check and fund account if needed
      await this.ensureSufficientFunds();
      
      // Acknowledge default providers
      await this.acknowledgeProviders();
      
      this.isInitialized = true;
      logger.info('AI CFO Service initialized successfully');

      // Schedule automated tasks
      this.scheduleAutomatedTasks();
      
    } catch (error) {
      logger.error('Failed to initialize AI CFO Service:', error);
      throw new Error('AI CFO Service initialization failed');
    }
  }

  /**
   * Ensure sufficient funds in the account for AI inference
   */
  private async ensureSufficientFunds(): Promise<void> {
    try {
      const account = await this.broker.ledger.getLedger();
      const balance = parseFloat(ethers.formatEther(account.totalBalance));
      
      logger.info(`AI CFO Service account balance: ${balance} OG tokens`);
      
      if (balance < this.config.accountTopUpThreshold) {
        logger.info(`Balance low, adding ${this.config.minimumBalance} OG tokens`);
        await this.broker.ledger.addLedger(this.config.minimumBalance);
        logger.info('Account funded successfully');
      }
    } catch (error) {
      logger.error('Error checking/funding account:', error);
      throw error;
    }
  }

  /**
   * Acknowledge official providers for AI inference
   */
  private async acknowledgeProviders(): Promise<void> {
    try {
      for (const [model, address] of Object.entries(this.OFFICIAL_PROVIDERS)) {
        try {
          await this.broker.inference.acknowledgeProviderSigner(address);
          logger.info(`Acknowledged provider for ${model}: ${address}`);
        } catch (error) {
          logger.warn(`Failed to acknowledge provider ${model}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error acknowledging providers:', error);
    }
  }

  /**
   * Schedule automated tasks for weekly reports and daily nudges
   */
  private scheduleAutomatedTasks(): void {
    // Schedule weekly performance summaries
    cron.schedule(this.config.weeklyReportSchedule, async () => {
      logger.info('Running scheduled weekly performance summary generation');
      await this.generateWeeklyReportsForAllUsers();
    });

    // Schedule daily personalized nudges
    cron.schedule(this.config.dailyNudgeSchedule, async () => {
      logger.info('Running scheduled daily nudge generation');
      await this.generateDailyNudgesForActiveUsers();
    });

    logger.info('AI CFO automated tasks scheduled');
  }

  /**
   * Generate AI-powered financial insights using 0G Compute
   */
  async generateInsight(
    prompt: string,
    context?: any,
    userId?: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<{
    success: boolean;
    insight?: string;
    model?: string;
    error?: string;
    metadata?: {
      tokensUsed: number;
      cost: string;
      responseTime: number;
    };
  }> {
    if (!this.isInitialized || !this.broker) {
      return {
        success: false,
        error: 'AI CFO Service not initialized'
      };
    }

    const startTime = Date.now();
    const model = options.model || this.config.defaultModel;
    const providerAddress = this.OFFICIAL_PROVIDERS[model as keyof typeof this.OFFICIAL_PROVIDERS];

    if (!providerAddress) {
      return {
        success: false,
        error: `Unknown model: ${model}`
      };
    }

    try {
      // Construct the AI prompt with context
      let fullPrompt = prompt;
      if (context) {
        fullPrompt = `Context: ${JSON.stringify(context, null, 2)}\n\nPrompt: ${prompt}`;
      }

      const messages = [
        {
          role: 'system',
          content: `You are an expert AI CFO assistant. Provide concise, actionable financial insights based on the given data. Focus on key metrics, trends, and specific recommendations. Keep responses professional and data-driven.`
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ];

      // Get service metadata and auth headers
      const { endpoint, model: serviceModel } = await this.broker.inference.getServiceMetadata(providerAddress);
      const headers = await this.broker.inference.getRequestHeaders(
        providerAddress, 
        JSON.stringify(messages)
      );

      // Make the inference request
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          messages,
          model: serviceModel,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 500
        })
      });

      if (!response.ok) {
        throw new Error(`AI inference failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const insight = data.choices[0]?.message?.content;
      const chatID = data.id;

      if (!insight) {
        throw new Error('No insight generated from AI model');
      }

      // Verify response if it's a verifiable service
      try {
        const isValid = await this.broker.inference.processResponse(
          providerAddress,
          insight,
          chatID
        );
        if (isValid === false) {
          logger.warn('AI response verification failed');
        }
      } catch (verifyError) {
        logger.warn('Response verification error:', verifyError);
      }

      const responseTime = Date.now() - startTime;

      // Store the insight if user ID provided
      if (userId) {
        try {
          await this.storeAIInsight(userId, {
            prompt,
            insight,
            model,
            timestamp: Date.now(),
            context: context ? 'provided' : 'none',
            responseTime,
            chatID
          });
        } catch (storeError) {
          logger.warn('Failed to store AI insight:', storeError);
        }
      }

      logger.info(`AI insight generated successfully in ${responseTime}ms using ${model}`);
      
      // Track successful request in monitoring service
      aiCfoMonitoringService.trackRequest(
        userId,
        model,
        responseTime,
        true,
        data.usage?.total_tokens || 0
      );
      
      // Clear any previous error counts for successful operation
      if (userId) {
        aiCfoMonitoringService.clearErrorCount('ai_inference', userId);
      }

      return {
        success: true,
        insight,
        model,
        metadata: {
          tokensUsed: data.usage?.total_tokens || 0,
          cost: '0', // Would calculate based on token usage and pricing
          responseTime
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown AI generation error';
      const responseTime = Date.now() - startTime;
      
      logger.error('AI insight generation failed:', error);
      
      // Track failed request in monitoring service
      aiCfoMonitoringService.trackRequest(
        userId,
        model,
        responseTime,
        false,
        0,
        'ai_inference_error'
      );
      
      // Track specific error
      aiCfoMonitoringService.trackError(
        'ai_inference',
        errorMessage,
        { model, prompt: prompt.substring(0, 100), responseTime },
        userId
      );
      
      // Try fallback model if available
      if (model !== this.config.fallbackModel) {
        logger.info(`Retrying with fallback model: ${this.config.fallbackModel}`);
        return this.generateInsight(prompt, context, userId, {
          ...options,
          model: this.config.fallbackModel
        });
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate weekly performance summary for a user
   */
  async generateWeeklyPerformanceSummary(userId: string): Promise<{
    success: boolean;
    summary?: any;
    error?: string;
  }> {
    try {
      // Get user's financial data from the past week
      const weeklyData = await this.getUserWeeklyFinancialData(userId);
      
      if (!weeklyData.success || !weeklyData.data) {
        return {
          success: false,
          error: 'Unable to retrieve weekly financial data'
        };
      }

      const prompt = `
        Generate a comprehensive weekly financial performance summary for this user.
        
        Key areas to analyze:
        1. Portfolio performance vs benchmarks
        2. Investment gains/losses and attribution
        3. Risk metrics and portfolio health
        4. Cash flow and liquidity analysis
        5. Goal progress and recommendations
        
        Format as structured JSON with sections: executive_summary, performance_metrics, risk_analysis, recommendations, next_week_focus.
      `;

      const insightResult = await this.generateInsight(
        prompt,
        weeklyData.data,
        userId,
        { model: this.config.defaultModel, maxTokens: 1000 }
      );

      if (!insightResult.success) {
        return {
          success: false,
          error: insightResult.error
        };
      }

      let summary;
      try {
        // Try to parse JSON response
        summary = JSON.parse(insightResult.insight!);
      } catch (parseError) {
        // Fallback to text summary
        summary = {
          executive_summary: insightResult.insight,
          generated_at: new Date().toISOString(),
          type: 'weekly_performance_summary'
        };
      }

      // Store summary in 0G storage
      await zeroGService.storeAnalyticsReport({
        reportId: `weekly_${userId}_${Date.now()}`,
        userId,
        type: 'WEEKLY_PERFORMANCE',
        title: 'Weekly Performance Summary',
        description: 'AI-generated weekly financial performance analysis',
        generated_at: Date.now(),
        data: summary,
        metadata: {
          model: insightResult.model,
          responseTime: insightResult.metadata?.responseTime,
          dataPoints: Object.keys(weeklyData.data).length
        }
      });

      logger.info(`Weekly performance summary generated for user ${userId}`);

      return {
        success: true,
        summary
      };

    } catch (error) {
      logger.error(`Error generating weekly summary for user ${userId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate personalized financial nudge for a user
   */
  async generatePersonalizedNudge(userId: string): Promise<{
    success: boolean;
    nudge?: any;
    error?: string;
  }> {
    try {
      // Get user's current financial state and recent activity
      const userData = await this.getUserCurrentFinancialState(userId);
      
      if (!userData.success || !userData.data) {
        return {
          success: false,
          error: 'Unable to retrieve user financial data'
        };
      }

      const prompt = `
        Generate a personalized financial nudge for this user based on their current financial state and recent activity.
        
        Consider:
        1. Portfolio rebalancing opportunities
        2. Cash allocation suggestions
        3. Risk management alerts
        4. Goal progress updates
        5. Market opportunities relevant to their holdings
        6. Upcoming financial events or deadlines
        
        Generate 1-3 specific, actionable nudges. Format as JSON array with fields: title, message, type, priority, action_required, estimated_impact.
        Types: OPPORTUNITY, WARNING, REMINDER, OPTIMIZATION
        Priority: HIGH, MEDIUM, LOW
      `;

      const insightResult = await this.generateInsight(
        prompt,
        userData.data,
        userId,
        { temperature: 0.8, maxTokens: 600 }
      );

      if (!insightResult.success) {
        return {
          success: false,
          error: insightResult.error
        };
      }

      let nudges;
      try {
        nudges = JSON.parse(insightResult.insight!);
        if (!Array.isArray(nudges)) {
          nudges = [nudges];
        }
      } catch (parseError) {
        // Fallback to single text nudge
        nudges = [{
          title: 'Financial Insight',
          message: insightResult.insight,
          type: 'GENERAL',
          priority: 'MEDIUM',
          action_required: false
        }];
      }

      // Add metadata to each nudge
      const enrichedNudges = nudges.map((nudge: any, index: number) => ({
        ...nudge,
        id: `nudge_${userId}_${Date.now()}_${index}`,
        userId,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        model: insightResult.model,
        viewed: false
      }));

      // Store nudges
      for (const nudge of enrichedNudges) {
        await this.storePersonalizedNudge(userId, nudge);
      }

      logger.info(`Generated ${enrichedNudges.length} personalized nudges for user ${userId}`);

      return {
        success: true,
        nudge: {
          nudges: enrichedNudges,
          generated_at: new Date().toISOString(),
          count: enrichedNudges.length
        }
      };

    } catch (error) {
      logger.error(`Error generating personalized nudge for user ${userId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's weekly financial data (mock implementation)
   */
  private async getUserWeeklyFinancialData(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    // This would integrate with your actual user data service
    // For now, return mock data structure
    return {
      success: true,
      data: {
        userId,
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        },
        portfolio: {
          totalValue: 50000,
          weeklyChange: 2.5,
          positions: [],
          cash: 5000
        },
        transactions: [],
        performance: {
          returns: 2.5,
          volatility: 12.5,
          sharpeRatio: 0.8
        },
        goals: []
      }
    };
  }

  /**
   * Get user's current financial state (mock implementation)
   */
  private async getUserCurrentFinancialState(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    // This would integrate with your actual user data service
    return {
      success: true,
      data: {
        userId,
        currentValue: 50000,
        cashPosition: 5000,
        recentTransactions: [],
        goals: [],
        riskProfile: 'MODERATE',
        lastActivity: new Date().toISOString()
      }
    };
  }

  /**
   * Store AI insight in 0G storage
   */
  private async storeAIInsight(userId: string, insight: any): Promise<void> {
    try {
      const encryptedInsight = await encryptionService.encryptJSON(insight, `insights:${userId}`);
      const key = `ai_insight:${userId}:${insight.timestamp}`;
      
      await zeroGService.storeKeyValue('ai_insights', key, encryptedInsight);
    } catch (error) {
      logger.error('Failed to store AI insight:', error);
    }
  }

  /**
   * Store personalized nudge
   */
  private async storePersonalizedNudge(userId: string, nudge: any): Promise<void> {
    try {
      const encryptedNudge = await encryptionService.encryptJSON(nudge, `nudges:${userId}`);
      const key = `nudge:${userId}:${nudge.id}`;
      
      await zeroGService.storeKeyValue('nudges', key, encryptedNudge);
    } catch (error) {
      logger.error('Failed to store personalized nudge:', error);
    }
  }

  /**
   * Generate weekly reports for all active users
   */
  private async generateWeeklyReportsForAllUsers(): Promise<void> {
    try {
      // This would get active users from your database
      const activeUsers = await this.getActiveUsers();
      
      for (const userId of activeUsers) {
        try {
          await this.generateWeeklyPerformanceSummary(userId);
        } catch (error) {
          logger.error(`Failed to generate weekly report for user ${userId}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error generating weekly reports for all users:', error);
    }
  }

  /**
   * Generate daily nudges for active users
   */
  private async generateDailyNudgesForActiveUsers(): Promise<void> {
    try {
      const activeUsers = await this.getActiveUsers();
      
      for (const userId of activeUsers) {
        try {
          await this.generatePersonalizedNudge(userId);
        } catch (error) {
          logger.error(`Failed to generate nudge for user ${userId}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error generating daily nudges:', error);
    }
  }

  /**
   * Get list of active users (mock implementation)
   */
  private async getActiveUsers(): Promise<string[]> {
    // This would query your database for active users
    // Return mock data for now
    return ['user1', 'user2', 'user3'];
  }

  /**
   * Get service status and health
   */
  async getServiceStatus(): Promise<{
    success: boolean;
    status?: any;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Service not initialized'
        };
      }

      const account = await this.broker.ledger.getLedger();
      const services = await this.broker.inference.listService();
      
      return {
        success: true,
        status: {
          initialized: this.isInitialized,
          balance: ethers.formatEther(account.totalBalance) + ' OG',
          availableServices: services.length,
          defaultModel: this.config.defaultModel,
          scheduledTasks: {
            weeklyReports: this.config.weeklyReportSchedule,
            dailyNudges: this.config.dailyNudgeSchedule
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown status error'
      };
    }
  }
}

// Export singleton instance
export const aiCfoService = new AiCfoService();