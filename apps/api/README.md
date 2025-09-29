# STACK API - Multi-Chain Wallet Backend

A scalable backend service for user onboarding and multi-chain wallet management with Turnkey integration.

## Features

- **User Onboarding**: Secure user registration with KYC integration
- **Multi-Chain Wallets**: Support for Aptos, Solana, and EVM chains
- **Turnkey Integration**: Managed wallet creation and signing
- **Robust Security**: JWT authentication, rate limiting, and audit logging
- **Production Ready**: Comprehensive error handling, monitoring, and scaling considerations

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   STACK API     │    │   Turnkey API   │
│                 │    │                 │    │                 │
│ - Mobile App    │◄──►│ - Onboarding    │◄──►│ - Wallet Mgmt   │
│ - Web App       │    │ - Wallet Mgmt   │    │ - Key Custody   │
│                 │    │ - Auth & KYC    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │                 │
                       │ - User Data     │
                       │ - Wallets       │
                       │ - Audit Logs    │
                       └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+
- Turnkey account and API credentials

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**:
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run migrations
   pnpm prisma migrate deploy
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secure-jwt-secret` |
| `TURNKEY_ORG_ID` | Your Turnkey organization ID | `01234567-89ab-cdef-0123-456789abcdef` |
| `TURNKEY_API_KEY` | Turnkey API public key | `your-turnkey-public-key` |
| `TURNKEY_PRIVATE_KEY` | Turnkey API private key | `your-turnkey-private-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `RATE_LIMIT_MAX` | Requests per window | `100` |
| `FEATURE_WALLET_*_ENABLED` | Chain support flags | `true` |

## API Endpoints

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Onboarding

#### Start Onboarding
```http
POST /api/v1/onboarding/start
Content-Type: application/json

{
  \"emailOrPhone\": \"user@example.com\",
  \"referralCode\": \"ABC123\" // optional
}
```

**Response:**
```json
{
  \"success\": true,
  \"data\": {
    \"userId\": \"user_123\",
    \"onboardingStatus\": \"KYC_PENDING\",
    \"sessionJwt\": \"eyJ0eXAiOiJKV1Q...\"
  }
}
```

#### KYC Callback (Webhook)
```http
POST /api/v1/onboarding/kyc/callback
Content-Type: application/json

{
  \"userId\": \"user_123\",
  \"status\": \"PASSED\",
  \"providerId\": \"provider_ref\",
  \"details\": {}
}
```

### Wallet Management

#### Provision Wallets
```http
POST /api/v1/wallets/provision
Authorization: Bearer <token>
Content-Type: application/json

{
  \"chains\": [\"aptos\", \"solana\", \"evm\"] // optional, defaults to all enabled
}
```

**Response:**
```json
{
  \"success\": true,
  \"data\": {
    \"userId\": \"user_123\",
    \"wallets\": {
      \"aptos\": {
        \"address\": \"0x123...\",
        \"turnkey\": {
          \"walletId\": \"wallet_123\",
          \"accountId\": \"account_123\",
          \"addressType\": \"ADDRESS_TYPE_APTOS\"
        }
      },
      \"solana\": {
        \"address\": \"5Kb8...\",
        \"turnkey\": {
          \"walletId\": \"wallet_123\",
          \"accountId\": \"account_456\",
          \"addressType\": \"ADDRESS_TYPE_SOLANA\"
        }
      },
      \"evm\": {
        \"address\": \"0xabc...\",
        \"turnkey\": {
          \"walletId\": \"wallet_123\",
          \"accountId\": \"account_789\",
          \"addressType\": \"ADDRESS_TYPE_ETHEREUM\"
        }
      }
    }
  }
}
```

#### Get User Wallets
```http
GET /api/v1/wallets
Authorization: Bearer <token>
```

**Response:** Same format as provision endpoint

### Health & Monitoring

#### Service Health
```http
GET /api/v1/wallets/health
```

#### Wallet Statistics
```http
GET /api/v1/wallets/stats
```

## Database Schema

### Key Tables

- **users**: User accounts with KYC status
- **wallets**: Multi-chain wallet addresses and Turnkey metadata  
- **audit_logs**: Comprehensive audit trail for compliance
- **feature_flags**: Runtime feature toggles

### Wallet Table Structure
```sql
CREATE TABLE wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  chain chain_type NOT NULL,
  address TEXT NOT NULL,
  turnkey_wallet_id TEXT NOT NULL,
  turnkey_account_id TEXT NOT NULL,
  address_type TEXT NOT NULL,
  status wallet_status DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, chain)
);
```

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  \"success\": true,
  \"data\": { ... },
  \"message\": \"Optional success message\"
}
```

**Error Response:**
```json
{
  \"success\": false,
  \"error\": \"Human readable error message\",
  \"code\": \"MACHINE_READABLE_CODE\",
  \"correlationId\": \"req_123456\",
  \"details\": [ // Optional validation errors
    {
      \"field\": \"fieldName\",
      \"message\": \"Field specific error\"
    }
  ]
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Authentication required
- `KYC_REQUIRED`: KYC completion needed
- `USER_NOT_FOUND`: User doesn't exist
- `TURNKEY_CLIENT_ERROR`: Turnkey API client error
- `TURNKEY_SERVER_ERROR`: Turnkey API server error
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- KYC-gated wallet operations
- Request correlation IDs for audit trails

### Rate Limiting
- Configurable per-endpoint rate limits
- IP-based throttling
- Graceful degradation under load

### Audit Logging
- All wallet operations logged to database
- Structured logging with correlation IDs
- Compliance-ready audit trails

### Data Protection
- No private keys stored on servers
- Turnkey handles all cryptographic operations
- Sensitive data masked in logs

## Monitoring & Observability

### Structured Logging
- JSON formatted logs
- Correlation IDs across requests
- Performance metrics and timing

### Health Checks
- Database connectivity checks
- Turnkey API health verification
- Service dependency monitoring

### Metrics
- Request/response times
- Error rates by endpoint
- Wallet creation success rates
- Chain-specific statistics

## Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test:integration
```

### Test Structure
- Service layer unit tests with mocked dependencies
- API endpoint integration tests
- Database operation tests
- Turnkey integration tests (sandbox)

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Turnkey production credentials
- [ ] SSL/TLS certificates
- [ ] Monitoring and alerting
- [ ] Log aggregation
- [ ] Backup strategy

### Docker Deployment
```bash
# Build image
docker build -t stack-api .

# Run container
docker run -p 3001:3001 --env-file .env stack-api
```

### Scaling Considerations

- **Horizontal scaling**: Stateless design supports multiple instances
- **Database pooling**: Configure connection limits appropriately
- **Caching**: Redis integration for session and rate limiting
- **Load balancing**: Sticky sessions not required

## Development

### Code Structure
```
src/
├── config/           # Environment configuration
├── services/         # Business logic layer
│   ├── auth.service.ts
│   ├── wallet.service.ts
│   ├── turnkey.service.ts
│   ├── audit.service.ts
│   └── logger.service.ts
├── middleware/       # Request/response middleware
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── routes/           # API endpoint definitions
│   ├── onboarding.routes.ts
│   └── wallet.routes.ts
└── index.ts          # Application entry point
```

### Development Workflow
1. Feature branches from `main`
2. Unit tests for all new code
3. Integration tests for API changes
4. Code review and approval
5. Automated deployment pipeline

### Code Quality
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Zod for runtime validation
- Comprehensive error handling

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

**Turnkey API Errors**
- Verify organization ID and credentials
- Check network connectivity to api.turnkey.com
- Review audit logs for detailed error information

**KYC Integration Issues**
- Validate webhook signatures
- Check KYC provider documentation
- Review callback payload format

### Debug Mode
```bash
LOG_LEVEL=debug pnpm dev
```

## Support & Contributing

### Getting Help
- Review this documentation
- Check GitHub issues
- Contact development team

### Contributing
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

This project is proprietary software. All rights reserved.

---

**Security Note**: Never commit real API keys, secrets, or production environment variables to version control. Use the `.env.example` file as a template and keep actual secrets secure.