# Crypto Card API

A production-ready NestJS backend API for managing crypto cards, wallets, and transactions. Built for the STRK crypto card platform.

## Features

### Authentication & Authorization
- JWT-based authentication with access & refresh tokens
- Role-based access control (ADMIN, USER roles)
- Secure password hashing with bcrypt
- Protected routes with guards and decorators

### Card Management
- Issue virtual/physical crypto cards
- Card activation, blocking, and status management
- Spending limits and real-time tracking
- Multi-currency support (USD, EUR, GBP, etc.)
- Card lifecycle management

### Crypto Wallet Integration
- Multi-cryptocurrency support (BTC, ETH, USDT, USDC, BNB)
- Wallet creation and balance tracking
- Deposit and withdrawal operations
- Real-time balance updates
- Secure wallet address generation

### Transaction Management
- Complete transaction history
- Real-time transaction status tracking
- Transaction statistics and analytics
- Filter by type, status, and date range
- Audit trail for compliance

### Health Monitoring
- Database health checks
- Memory and disk monitoring
- Ready for Kubernetes/Docker deployments
- Production-ready health endpoints

### Security & Performance
- Rate limiting and throttling
- Request validation with DTOs
- SQL injection protection
- XSS protection
- CORS configuration
- Comprehensive logging with Winston
- Environment-based configuration

## Project Structure

```
crypto-card-api/
├── src/
│   ├── modules/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── wallets/        # Crypto wallet operations
│   │   ├── cards/          # Card issuance & management
│   │   ├── transactions/   # Transaction tracking
│   │   └── health/         # Health check endpoints
│   ├── common/
│   │   ├── decorators/     # Custom decorators
│   │   ├── guards/         # Auth guards
│   │   └── enums/          # Shared enums
│   ├── config/             # Configuration files
│   └── main.ts             # Application entry point
├── .env                    # Environment variables
├── docker-compose.yml      # Docker setup
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crypto-card-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Database**

Make sure PostgreSQL is running and create the database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crypto_card_db;
```

4. **Configure Environment**

The `.env` file is already configured with:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_DATABASE=crypto_card_db
```

5. **Run the application**

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at:
- **API Base URL**: `http://localhost:3000/api/v1`
- **Swagger Docs**: `http://localhost:3000/api/docs`

## API Documentation

### Interactive API Documentation

Visit `http://localhost:3000/api/docs` for interactive Swagger documentation.

### Key Endpoints

#### Authentication
```
POST   /api/v1/auth/register        # Register new user
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/refresh         # Refresh access token
POST   /api/v1/auth/logout          # Logout
GET    /api/v1/auth/profile         # Get current user profile
```

#### Users
```
GET    /api/v1/users                # Get all users (Admin)
GET    /api/v1/users/:id            # Get user by ID
DELETE /api/v1/users/:id            # Delete user (Admin)
```

#### Wallets
```
POST   /api/v1/wallets              # Create new wallet
GET    /api/v1/wallets              # Get user wallets
GET    /api/v1/wallets/:id          # Get wallet details
POST   /api/v1/wallets/:id/deposit  # Deposit crypto
POST   /api/v1/wallets/:id/withdraw # Withdraw crypto
DELETE /api/v1/wallets/:id          # Delete wallet
```

#### Cards
```
POST   /api/v1/cards                # Request new card
GET    /api/v1/cards                # Get user cards
GET    /api/v1/cards/:id            # Get card details
PATCH  /api/v1/cards/:id            # Update card settings
POST   /api/v1/cards/:id/activate   # Activate card
POST   /api/v1/cards/:id/block      # Block card
DELETE /api/v1/cards/:id            # Delete card
```

#### Transactions
```
GET    /api/v1/transactions         # Get all transactions
GET    /api/v1/transactions/stats   # Get transaction stats
GET    /api/v1/transactions/:id     # Get transaction details
```

#### Health
```
GET    /api/v1/health               # Health check endpoint
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker Deployment

Use the provided `docker-compose.yml` to run the entire stack:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Database Schema

### Main Entities

**Users**
- id (UUID, PK)
- email (unique)
- password (hashed)
- firstName, lastName
- role (USER | ADMIN)
- isActive
- refreshToken
- lastLoginAt
- timestamps

**Wallets**
- id (UUID, PK)
- userId (FK → users)
- cryptoType (BTC | ETH | USDT | USDC | BNB)
- balance (decimal)
- address (unique)
- isActive
- timestamps

**Cards**
- id (UUID, PK)
- userId (FK → users)
- cardNumber (unique, masked)
- cardHolderName
- cardType (VIRTUAL | PHYSICAL)
- status (PENDING | ACTIVE | BLOCKED | EXPIRED)
- expiryDate
- spendingLimit, currentSpending
- currency
- timestamps

**Transactions**
- id (UUID, PK)
- walletId (FK → wallets)
- type (DEPOSIT | WITHDRAWAL | TRANSFER | CARD_PAYMENT)
- amount (decimal)
- currency
- status (PENDING | COMPLETED | FAILED)
- reference, txHash
- timestamps

## Security Features

- Password hashing with bcrypt (cost factor: 10)
- JWT token-based authentication
- Refresh token rotation
- Rate limiting (10 requests per minute)
- Input validation with class-validator
- SQL injection protection via TypeORM
- XSS protection
- CORS configuration
- Environment variable security
- Role-based access control

## Best Practices

- Clean architecture with modular design and separation of concerns
- Full type safety with TypeScript throughout the codebase
- Auto-generated API documentation with Swagger
- Request and response validation with DTOs
- Centralized error handling
- Structured logging with Winston
- Database migrations with TypeORM
- Comprehensive test suite with Jest
- Docker containerization
- Code quality enforced with ESLint and Prettier

## Enterprise Features

- Multi-tenant ready architecture
- Scalable microservice-ready design
- Production-grade logging and monitoring
- Database connection pooling
- Request throttling and rate limiting
- Health check endpoints for orchestration
- Environment-based configuration
- TypeORM migration system

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Validation**: class-validator + class-transformer
- **Security**: Helmet, bcrypt, rate-limiting
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier

## Performance

- Connection pooling for database
- Efficient query optimization with TypeORM
- Caching ready (Redis integration available)
- Rate limiting to prevent abuse
- Lazy loading for relations

## Configuration

All configuration is environment-based. Key settings in `.env`:

- `PORT`: API port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DB_*`: Database connection settings
- `JWT_SECRET`: JWT signing key
- `JWT_EXPIRATION`: Token expiration time
- `THROTTLE_TTL`: Rate limit window
- `THROTTLE_LIMIT`: Max requests per window

## Deployment Notes

This is a demonstration project built for STRK. For production use:

1. Update JWT secrets
2. Configure proper CORS origins
3. Setup Redis for caching
4. Add comprehensive tests
5. Configure CI/CD pipelines
6. Setup monitoring (e.g., Prometheus, Grafana)
7. Add API versioning strategy

## License

MIT

## Author

**Kalkidan**  
Full-Stack TypeScript Developer  
Specialized in NestJS, React, Next.js, and scalable web applications

---

Built for STRK - Hong Kong Crypto Card Platform
