import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * AI CFO Configuration powered by 0G Compute Network
 * Centralized configuration for all AI CFO related settings
 */
export const aiCfoConfig = {
  // 0G Network Configuration
  zg: {
    evmRpc: process.env.ZG_EVM_RPC || 'https://evmrpc-testnet.0g.ai',
    indexerRpc: process.env.ZG_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
    kvClientAddr: process.env.ZG_KV_CLIENT_ADDR || 'http://3.101.147.150:6789',
    privateKey: process.env.ZG_PRIVATE_KEY || '',
    flowContractAddress: process.env.ZG_FLOW_CONTRACT_ADDRESS || ''
  },

  // AI Model Configuration
  models: {
    default: (process.env.AI_CFO_DEFAULT_MODEL as 'gpt-oss-120b' | 'deepseek-r1-70b') || 'gpt-oss-120b',
    fallback: (process.env.AI_CFO_FALLBACK_MODEL as 'gpt-oss-120b' | 'deepseek-r1-70b') || 'deepseek-r1-70b',
    providers: {
      'gpt-oss-120b': '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
      'deepseek-r1-70b': '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3'
    } as const,
    defaultParams: {
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.9
    }
  },

  // Account Management
  account: {
    minimumBalance: parseFloat(process.env.AI_CFO_MIN_BALANCE || '1.0'), // OG tokens
    topUpThreshold: parseFloat(process.env.AI_CFO_TOPUP_THRESHOLD || '0.1'), // OG tokens
    topUpAmount: parseFloat(process.env.AI_CFO_TOPUP_AMOUNT || '5.0'), // OG tokens
    autoTopUp: process.env.AI_CFO_AUTO_TOPUP === 'true'
  },

  // Scheduling Configuration
  schedules: {
    weeklyReports: process.env.AI_CFO_WEEKLY_REPORTS_SCHEDULE || '0 8 * * 1', // Monday 8 AM
    dailyNudges: process.env.AI_CFO_DAILY_NUDGES_SCHEDULE || '0 9 * * *', // Daily 9 AM
    accountCheck: process.env.AI_CFO_ACCOUNT_CHECK_SCHEDULE || '0 */6 * * *', // Every 6 hours
    cleanup: process.env.AI_CFO_CLEANUP_SCHEDULE || '0 2 * * 0' // Sunday 2 AM
  },

  // Service Configuration
  service: {
    maxRetries: parseInt(process.env.AI_CFO_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.AI_CFO_RETRY_DELAY || '1000'), // milliseconds
    requestTimeout: parseInt(process.env.AI_CFO_REQUEST_TIMEOUT || '30000'), // 30 seconds
    batchSize: parseInt(process.env.AI_CFO_BATCH_SIZE || '10'), // For bulk operations
    enableCaching: process.env.AI_CFO_ENABLE_CACHING !== 'false',
    cacheExpiration: parseInt(process.env.AI_CFO_CACHE_EXPIRATION || '3600'), // 1 hour
  },

  // Insight Generation Settings
  insights: {
    maxPromptLength: parseInt(process.env.AI_CFO_MAX_PROMPT_LENGTH || '2000'),
    maxContextSize: parseInt(process.env.AI_CFO_MAX_CONTEXT_SIZE || '10000'), // characters
    enableContextCompression: process.env.AI_CFO_ENABLE_CONTEXT_COMPRESSION !== 'false',
    defaultModel: 'gpt-oss-120b' as const,
    fallbackModel: 'deepseek-r1-70b' as const,
    promptTemplates: {
      weeklyReport: `
        As an expert AI CFO, analyze the provided financial data and generate a comprehensive weekly performance report.
        
        Focus on:
        1. Portfolio performance vs benchmarks
        2. Risk metrics and portfolio health
        3. Cash flow analysis
        4. Investment attribution
        5. Actionable recommendations
        
        Structure your response as JSON with sections: executive_summary, performance_metrics, risk_analysis, recommendations, next_week_focus.
        Be concise but thorough, highlighting key insights and specific actions.
      `.trim(),
      
      personalizedNudge: `
        Generate 1-3 personalized financial nudges based on the user's current financial state.
        
        Consider:
        - Portfolio rebalancing opportunities
        - Cash allocation optimization  
        - Risk management alerts
        - Goal progress updates
        - Market opportunities
        
        Format as JSON array with: title, message, type (OPPORTUNITY/WARNING/REMINDER/OPTIMIZATION), priority (HIGH/MEDIUM/LOW), action_required, estimated_impact.
        Keep messages actionable and specific to the user's situation.
      `.trim(),
      
      generalInsight: `
        You are an expert AI CFO assistant. Provide concise, actionable financial insights based on the given data.
        Focus on key metrics, trends, and specific recommendations.
        Keep responses professional, data-driven, and immediately actionable.
      `.trim()
    }
  },

  // Storage Configuration
  storage: {
    streamIds: {
      insights: 'ai_insights',
      nudges: 'nudges',
      reports: 'reports',
      analytics: 'analytics_reports'
    },
    encryption: {
      enabled: true,
      keyRotationDays: parseInt(process.env.AI_CFO_KEY_ROTATION_DAYS || '90'),
      algorithm: 'aes-256-gcm'
    },
    retention: {
      insights: parseInt(process.env.AI_CFO_INSIGHTS_RETENTION_DAYS || '365'), // 1 year
      nudges: parseInt(process.env.AI_CFO_NUDGES_RETENTION_DAYS || '30'), // 30 days
      reports: parseInt(process.env.AI_CFO_REPORTS_RETENTION_DAYS || '2555'), // 7 years
      analytics: parseInt(process.env.AI_CFO_ANALYTICS_RETENTION_DAYS || '1825') // 5 years
    }
  },

  // Feature Flags
  features: {
    enableWeeklyReports: process.env.AI_CFO_ENABLE_WEEKLY_REPORTS !== 'false',
    enableDailyNudges: process.env.AI_CFO_ENABLE_DAILY_NUDGES !== 'false',
    enableRealTimeInsights: process.env.AI_CFO_ENABLE_REALTIME_INSIGHTS !== 'false',
    enableBatchProcessing: process.env.AI_CFO_ENABLE_BATCH_PROCESSING !== 'false',
    enableAdvancedAnalytics: process.env.AI_CFO_ENABLE_ADVANCED_ANALYTICS === 'true',
    enableModelFallback: process.env.AI_CFO_ENABLE_MODEL_FALLBACK !== 'false',
    enableResponseVerification: process.env.AI_CFO_ENABLE_RESPONSE_VERIFICATION !== 'false'
  },

  // Rate Limiting
  rateLimits: {
    insightsPerUser: parseInt(process.env.AI_CFO_INSIGHTS_PER_USER_PER_DAY || '50'),
    nudgesPerUser: parseInt(process.env.AI_CFO_NUDGES_PER_USER_PER_DAY || '5'),
    reportsPerUser: parseInt(process.env.AI_CFO_REPORTS_PER_USER_PER_WEEK || '1'),
    tokensPerUser: parseInt(process.env.AI_CFO_TOKENS_PER_USER_PER_DAY || '10000')
  },

  // Monitoring and Alerts
  monitoring: {
    enableHealthChecks: process.env.AI_CFO_ENABLE_HEALTH_CHECKS !== 'false',
    healthCheckInterval: parseInt(process.env.AI_CFO_HEALTH_CHECK_INTERVAL || '300000'), // 5 minutes
    alertLowBalance: parseFloat(process.env.AI_CFO_ALERT_LOW_BALANCE || '0.5'), // OG tokens
    alertFailureThreshold: parseInt(process.env.AI_CFO_ALERT_FAILURE_THRESHOLD || '5'), // consecutive failures
    enableMetrics: process.env.AI_CFO_ENABLE_METRICS !== 'false'
  },

  // Development/Debug Settings
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: process.env.AI_CFO_LOG_LEVEL || 'info',
    enableVerboseLogging: process.env.AI_CFO_VERBOSE_LOGGING === 'true',
    savePrompts: process.env.AI_CFO_SAVE_PROMPTS === 'true',
    mockAIResponses: process.env.AI_CFO_MOCK_RESPONSES === 'true'
  }
};

/**
 * Validate configuration on startup
 */
export function validateAiCfoConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required 0G configuration
  if (!aiCfoConfig.zg.privateKey && process.env.NODE_ENV === 'production') {
    errors.push('ZG_PRIVATE_KEY is required for production deployment');
  }

  // Validate model configuration
  if (!Object.keys(aiCfoConfig.models.providers).includes(aiCfoConfig.models.default)) {
    errors.push(`Invalid default model: ${aiCfoConfig.models.default}`);
  }

  if (!Object.keys(aiCfoConfig.models.providers).includes(aiCfoConfig.models.fallback)) {
    errors.push(`Invalid fallback model: ${aiCfoConfig.models.fallback}`);
  }

  // Validate numeric ranges
  if (aiCfoConfig.account.minimumBalance < 0) {
    errors.push('Minimum balance must be >= 0');
  }

  if (aiCfoConfig.account.topUpThreshold >= aiCfoConfig.account.minimumBalance) {
    errors.push('Top-up threshold must be less than minimum balance');
  }

  if (aiCfoConfig.service.maxRetries < 1) {
    errors.push('Max retries must be >= 1');
  }

  if (aiCfoConfig.service.requestTimeout < 1000) {
    errors.push('Request timeout must be >= 1000ms');
  }

  // Validate cron schedules (basic check)
  const cronRegex = /^(\S+\s+){4}\S+$/;
  if (!cronRegex.test(aiCfoConfig.schedules.weeklyReports)) {
    errors.push('Invalid weekly reports cron schedule format');
  }

  if (!cronRegex.test(aiCfoConfig.schedules.dailyNudges)) {
    errors.push('Invalid daily nudges cron schedule format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get configuration summary for status endpoints
 */
export function getConfigSummary() {
  const validation = validateAiCfoConfig();
  
  return {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    validation,
    features: aiCfoConfig.features,
    models: {
      default: aiCfoConfig.models.default,
      fallback: aiCfoConfig.models.fallback,
      available: Object.keys(aiCfoConfig.models.providers)
    },
    schedules: aiCfoConfig.schedules,
    zg: {
      evmRpc: aiCfoConfig.zg.evmRpc,
      hasPrivateKey: !!aiCfoConfig.zg.privateKey,
      hasFlowContract: !!aiCfoConfig.zg.flowContractAddress
    }
  };
}

export default aiCfoConfig;