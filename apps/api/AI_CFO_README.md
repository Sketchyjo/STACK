# AI CFO - Powered by 0G Compute Network

## Overview

The AI CFO feature provides automated financial insights, weekly performance summaries, and personalized nudges using 0G's decentralized compute network. This implementation leverages 0G's state-of-the-art AI models running in Trusted Execution Environments (TEE) to deliver secure, verifiable financial analysis.

## Architecture

### Core Components

1. **AiCfoService** - Main service orchestrating AI interactions
2. **AiCfoMonitoringService** - Comprehensive monitoring, metrics, and alerting
3. **Configuration Management** - Centralized configuration with validation
4. **API Routes** - RESTful endpoints for AI CFO functionality
5. **0G Integration** - Direct integration with 0G Compute Network

### 0G Compute Network Integration

- **Models Used**:
  - `gpt-oss-120b` (Primary): State-of-the-art 70B parameter model for general AI tasks
  - `deepseek-r1-70b` (Fallback): Advanced reasoning model for complex problem solving

- **Providers**:
  - Primary: `0xf07240Efa67755B5311bc75784a061eDB47165Dd`
  - Fallback: `0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3`

- **Verification**: Both models run in TEE (TeeML) environments for verified computation

## Features

### 1. AI-Powered Financial Insights

Generate context-aware financial insights using 0G's AI models:

```typescript
// Generate insight with context
const result = await aiCfoService.generateInsight(
  "Analyze this portfolio for rebalancing opportunities",
  { portfolio: userPortfolioData },
  userId,
  { model: 'gpt-oss-120b', temperature: 0.7 }
);
```

**Key Capabilities**:
- Portfolio analysis and optimization
- Risk assessment and management
- Market opportunity identification
- Investment attribution analysis
- Cash flow optimization

### 2. Weekly Performance Summaries

Automated weekly reports generated every Monday at 8 AM:

```typescript
// Manual generation
const summary = await aiCfoService.generateWeeklyPerformanceSummary(userId);
```

**Report Sections**:
- Executive Summary
- Performance Metrics vs. Benchmarks
- Risk Analysis
- Goal Progress
- Next Week Focus Areas

### 3. Personalized Nudges

Daily personalized financial recommendations (9 AM daily):

```typescript
// Generate personalized nudges
const nudges = await aiCfoService.generatePersonalizedNudge(userId);
```

**Nudge Types**:
- `OPPORTUNITY` - Market or portfolio opportunities
- `WARNING` - Risk alerts and urgent actions
- `REMINDER` - Goal progress and deadlines
- `OPTIMIZATION` - Portfolio rebalancing suggestions

## API Endpoints

### Core AI Functionality

#### Generate Financial Insight
```http
POST /api/v1/ai-cfo/insight
Content-Type: application/json

{
  "prompt": "Analyze portfolio performance and suggest optimizations",
  "context": { /* financial data */ },
  "model": "gpt-oss-120b",
  "temperature": 0.7,
  "maxTokens": 500
}
```

#### Generate Weekly Summary
```http
POST /api/v1/ai-cfo/weekly-summary/{userId}
```

#### Generate Personalized Nudges
```http
POST /api/v1/ai-cfo/nudges/{userId}
```

### Service Management

#### Service Status
```http
GET /api/v1/ai-cfo/status
```

#### Health Check
```http
GET /api/v1/ai-cfo/health
POST /api/v1/ai-cfo/health-check
```

#### Monitoring Metrics
```http
GET /api/v1/ai-cfo/metrics
```

#### Available Models
```http
GET /api/v1/ai-cfo/models
```

### Admin Endpoints

#### Trigger Weekly Reports (All Users)
```http
POST /api/v1/ai-cfo/admin/trigger-weekly-reports
```

#### Trigger Daily Nudges (All Users)
```http
POST /api/v1/ai-cfo/admin/trigger-daily-nudges
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# 0G Compute Network Configuration
ZG_EVM_RPC=https://evmrpc-testnet.0g.ai
ZG_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
ZG_KV_CLIENT_ADDR=http://3.101.147.150:6789
ZG_PRIVATE_KEY=your-0g-private-key-here
ZG_FLOW_CONTRACT_ADDRESS=your-flow-contract-address

# AI CFO Configuration
AI_CFO_DEFAULT_MODEL=gpt-oss-120b
AI_CFO_FALLBACK_MODEL=deepseek-r1-70b
AI_CFO_MIN_BALANCE=1.0
AI_CFO_TOPUP_THRESHOLD=0.1

# Scheduling (cron format)
AI_CFO_WEEKLY_REPORTS_SCHEDULE=0 8 * * 1
AI_CFO_DAILY_NUDGES_SCHEDULE=0 9 * * *

# Advanced Settings
AI_CFO_MAX_RETRIES=3
AI_CFO_REQUEST_TIMEOUT=30000
AI_CFO_ENABLE_MONITORING=true
AI_CFO_ENABLE_CACHING=true
```

### Feature Flags

Control which features are enabled:

```bash
AI_CFO_ENABLE_WEEKLY_REPORTS=true
AI_CFO_ENABLE_DAILY_NUDGES=true
AI_CFO_ENABLE_REALTIME_INSIGHTS=true
AI_CFO_ENABLE_MODEL_FALLBACK=true
AI_CFO_ENABLE_RESPONSE_VERIFICATION=true
```

## Monitoring & Observability

### Comprehensive Monitoring

The AI CFO system includes comprehensive monitoring:

- **Performance Metrics**: Request counts, response times, token usage
- **Error Tracking**: Detailed error categorization and alerting
- **Health Checks**: Automated system health verification
- **Resource Monitoring**: Account balance, service availability

### Metrics Collection

```typescript
// Automatic tracking on every request
aiCfoMonitoringService.trackRequest(
  userId,
  model,
  responseTime,
  success,
  tokensUsed,
  errorType?
);

// Error tracking
aiCfoMonitoringService.trackError(
  'ai_inference',
  errorMessage,
  context,
  userId
);
```

### Alert System

Automatic alerts for:
- Account balance low
- High error rates
- Performance degradation
- Service unavailability
- Model failures

### Scheduled Tasks

- **Health Checks**: Every 5 minutes
- **Account Balance**: Every 6 hours  
- **Metrics Collection**: Hourly
- **Cleanup**: Daily
- **Reports**: Daily summary reports

## Security & Privacy

### Data Encryption

- All user financial data encrypted using AES-256-GCM
- Separate encryption keys per user
- Automatic key rotation (configurable)

### 0G Storage Integration

- Secure storage of insights and reports in 0G decentralized network
- Encrypted metadata with user-specific keys
- Configurable retention policies

### Access Control

- JWT-based authentication
- User-specific data isolation
- Admin-only endpoints for bulk operations

## Error Handling & Resilience

### Fallback Mechanisms

1. **Model Fallback**: Automatic retry with secondary model on failure
2. **Retry Logic**: Configurable retry attempts with exponential backoff
3. **Circuit Breaker**: Prevent cascade failures
4. **Graceful Degradation**: Partial functionality on component failure

### Error Recovery

```typescript
// Automatic fallback example
if (primaryModelFails) {
  return generateInsight(prompt, context, userId, {
    model: fallbackModel
  });
}
```

## Usage Examples

### Basic Financial Insight

```typescript
import { aiCfoService } from './services/aiCfo.service';

// Generate portfolio analysis
const analysis = await aiCfoService.generateInsight(
  "Provide a detailed analysis of this portfolio's risk profile and suggest optimizations",
  {
    portfolio: {
      totalValue: 100000,
      positions: [
        { symbol: 'SPY', value: 60000, percentage: 60 },
        { symbol: 'BND', value: 30000, percentage: 30 },
        { symbol: 'VTI', value: 10000, percentage: 10 }
      ],
      cash: 5000
    },
    riskTolerance: 'moderate',
    timeHorizon: '10-15 years'
  },
  'user123'
);

if (analysis.success) {
  console.log('AI Analysis:', analysis.insight);
  console.log('Tokens used:', analysis.metadata.tokensUsed);
  console.log('Response time:', analysis.metadata.responseTime);
}
```

### Weekly Report Generation

```typescript
// Generate comprehensive weekly report
const weeklyReport = await aiCfoService.generateWeeklyPerformanceSummary('user123');

if (weeklyReport.success) {
  const { summary } = weeklyReport;
  
  console.log('Executive Summary:', summary.executive_summary);
  console.log('Performance:', summary.performance_metrics);
  console.log('Recommendations:', summary.recommendations);
}
```

### Personalized Nudges

```typescript
// Get personalized nudges
const nudgeResult = await aiCfoService.generatePersonalizedNudge('user123');

if (nudgeResult.success) {
  nudgeResult.nudge.nudges.forEach(nudge => {
    console.log(`${nudge.priority} ${nudge.type}: ${nudge.title}`);
    console.log(`Action: ${nudge.message}`);
    console.log(`Impact: ${nudge.estimated_impact}`);
  });
}
```

## Development & Testing

### Local Development Setup

1. **Install Dependencies**:
```bash
pnpm install
```

2. **Configure Environment**:
```bash
cp .env.example .env
# Edit .env with your 0G credentials
```

3. **Start Development Server**:
```bash
pnpm dev
```

### Testing AI CFO Features

```bash
# Test insight generation
curl -X POST http://localhost:3001/api/v1/ai-cfo/insight \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze this portfolio for diversification",
    "context": {"portfolio": "sample data"}
  }'

# Check service health
curl http://localhost:3001/api/v1/ai-cfo/health

# View metrics
curl http://localhost:3001/api/v1/ai-cfo/metrics
```

## Deployment Considerations

### Prerequisites

1. **0G Account Setup**:
   - Create 0G wallet with private key
   - Fund account with OG tokens (minimum 1 OG)
   - Acknowledge required service providers

2. **Environment Configuration**:
   - Set all required environment variables
   - Configure proper network endpoints
   - Set up monitoring thresholds

### Production Deployment

1. **Security Hardening**:
   - Use strong private keys
   - Enable all encryption features
   - Set appropriate rate limits

2. **Monitoring Setup**:
   - Configure alert thresholds
   - Set up log aggregation
   - Monitor account balances

3. **Scaling Considerations**:
   - Account for token usage scaling
   - Monitor response times
   - Plan for model availability

## Troubleshooting

### Common Issues

1. **Service Not Initialized**:
   - Check ZG_PRIVATE_KEY is set
   - Verify network connectivity
   - Check account balance

2. **AI Inference Failures**:
   - Check provider acknowledgment
   - Verify sufficient account funds
   - Review error logs for specific failures

3. **High Response Times**:
   - Monitor 0G network status
   - Check model availability
   - Review prompt complexity

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
AI_CFO_VERBOSE_LOGGING=true
AI_CFO_LOG_LEVEL=debug
AI_CFO_SAVE_PROMPTS=true
```

## Roadmap

### Planned Features

- [ ] Real-time market alerts integration
- [ ] Advanced portfolio optimization algorithms  
- [ ] Multi-language support for insights
- [ ] Custom model fine-tuning
- [ ] Integration with additional 0G services
- [ ] Advanced analytics and reporting
- [ ] Mobile app support
- [ ] Third-party data source integration

### Performance Optimizations

- [ ] Response caching for similar queries
- [ ] Batch processing for bulk operations
- [ ] Model selection optimization
- [ ] Context compression algorithms

---

## Support

For technical support or questions:

1. **Check Logs**: Review application logs for error details
2. **Monitor Health**: Use `/ai-cfo/health` endpoint
3. **Review Metrics**: Check `/ai-cfo/metrics` for performance data
4. **0G Documentation**: Refer to [0G Compute Documentation](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/sdk)

## License

This AI CFO implementation is part of the STACK platform and follows the same licensing terms.

---

*Powered by 0G Compute Network - Decentralized AI at Scale*