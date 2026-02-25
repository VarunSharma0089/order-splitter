# 🏦 Order Splitter API

A RESTful API built with **NestJS + TypeScript** that acts as an order splitter for a robo-advisor partner. It accepts a model portfolio and investment amount, then calculates how many shares of each stock to buy or sell and when to execute the orders.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [Request Examples](#request-examples)
- [Swagger Documentation](#swagger-documentation)
- [Running Tests](#running-tests)
- [Dependencies](#dependencies)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS v10 |
| Language | TypeScript |
| API Docs | Swagger / OpenAPI |
| Validation | class-validator + class-transformer |
| Config | @nestjs/config + Joi |
| Rate Limiting | @nestjs/throttler |
| Testing | Jest + Supertest |

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher
- **npm** v9 or higher

Check your versions:

```bash
node --version
npm --version
```

---

## Installation

**Step 1 — Clone the repository:**

```bash
git clone https://github.com/your-username/order-splitter.git
cd order-splitter
```

**Step 2 — Install dependencies:**

```bash
npm install
```

---

## Environment Setup

**Step 1 — Create your `.env` file:**

```bash
cp .env.example .env
```

**Step 2 — Fill in your values:**

```dotenv
PORT=3000
API_KEY=test-key-123
SHARE_DECIMAL_PLACES=3
NODE_ENV=development
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the server runs on | `3000` |
| `API_KEY` | Secret key required in `x-api-key` header | Required |
| `SHARE_DECIMAL_PLACES` | Decimal precision for share quantities | `3` |
| `NODE_ENV` | Environment (`development` / `production` / `test`) | `development` |

> ⚠️ Never commit your `.env` file to git. It is already in `.gitignore`.

---

## Running the App

**Development mode (with hot reload):**

```bash
npm run start:dev
```

**Production build:**

```bash
npm run build
npm run start:prod
```

**Change decimal precision at runtime:**

```bash
SHARE_DECIMAL_PLACES=7 npm run start:dev
```

Once running, the server starts at:

```
http://localhost:3000
```

Swagger docs available at:

```
http://localhost:3000/api
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/orders` | ✅ x-api-key | Split a portfolio into stock orders |
| `GET` | `/orders` | ✅ x-api-key | Retrieve all historic orders |
| `GET` | `/health` | ❌ Public | Health check for load balancers |
| `GET` | `/api` | ❌ Public | Swagger interactive documentation |

**Authentication:** All protected endpoints require the `x-api-key` header matching the value in your `.env`.

---

## Request Examples

### POST /orders — Basic BUY order

Split $100 into AAPL (60%) and TSLA (40%) at fixed $100 price:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-key-123" \
  -d '{
    "portfolio": [
      { "ticker": "AAPL", "weight": 60 },
      { "ticker": "TSLA", "weight": 40 }
    ],
    "totalAmount": 100,
    "orderType": "BUY"
  }'
```

**Response:**

```json
{
  "id": "f3a7c2d1-4b8e-4f2a-9c1d-2e5f8a3b6c9d",
  "orderType": "BUY",
  "totalAmount": 100,
  "stocks": [
    { "ticker": "AAPL", "allocatedAmount": 60, "quantity": 0.6, "priceUsed": 100 },
    { "ticker": "TSLA", "allocatedAmount": 40, "quantity": 0.4, "priceUsed": 100 }
  ],
  "executeAt": "2026-02-26T14:30:00.000Z",
  "createdAt": "2026-02-25T06:00:34.321Z",
  "processingTimeMs": 2
}
```

---

### POST /orders — With partner market price override

Split $1000 using real market prices provided by the partner:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-key-123" \
  -d '{
    "portfolio": [
      { "ticker": "AAPL", "weight": 60, "marketPrice": 185.50 },
      { "ticker": "TSLA", "weight": 40, "marketPrice": 250.00 }
    ],
    "totalAmount": 1000,
    "orderType": "BUY"
  }'
```

**Response:**

```json
{
  "id": "a1b2c3d4-...",
  "orderType": "BUY",
  "totalAmount": 1000,
  "stocks": [
    { "ticker": "AAPL", "allocatedAmount": 600, "quantity": 3.234, "priceUsed": 185.5 },
    { "ticker": "TSLA", "allocatedAmount": 400, "quantity": 1.6,   "priceUsed": 250.0 }
  ],
  "executeAt": "2026-02-26T14:30:00.000Z",
  "createdAt": "2026-02-25T06:00:34.321Z",
  "processingTimeMs": 3
}
```

---

### POST /orders — SELL order

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-key-123" \
  -d '{
    "portfolio": [
      { "ticker": "AAPL", "weight": 50 },
      { "ticker": "TSLA", "weight": 30 },
      { "ticker": "MSFT", "weight": 20 }
    ],
    "totalAmount": 500,
    "orderType": "SELL"
  }'
```

---

### POST /orders — Single stock (weight must be 100)

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-key-123" \
  -d '{
    "portfolio": [
      { "ticker": "AAPL", "weight": 100, "marketPrice": 185.50 }
    ],
    "totalAmount": 100,
    "orderType": "BUY"
  }'
```

---

### GET /orders — Retrieve all historic orders

```bash
curl -X GET http://localhost:3000/orders \
  -H "x-api-key: test-key-123"
```

**Response:**

```json
[
  {
    "id": "f3a7c2d1-...",
    "orderType": "BUY",
    "totalAmount": 100,
    "stocks": [...],
    "executeAt": "2026-02-26T14:30:00.000Z",
    "createdAt": "2026-02-25T06:00:34.321Z",
    "processingTimeMs": 2
  }
]
```

---

### GET /health — Health check

```bash
curl -X GET http://localhost:3000/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-02-25T06:00:34.321Z",
  "uptime": 120.45
}
```

---

### Error Responses

**400 — Portfolio weights don't sum to 100:**

```json
{
  "statusCode": 400,
  "timestamp": "2026-02-25T06:00:34.321Z",
  "path": "/orders",
  "message": { "message": ["Portfolio weights must sum to 100"] }
}
```

**401 — Missing or invalid API key:**

```json
{
  "statusCode": 401,
  "timestamp": "2026-02-25T06:00:34.321Z",
  "path": "/orders",
  "message": "Invalid or missing API key"
}
```

**429 — Rate limit exceeded:**

```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```

---

## Swagger Documentation

1. Start the app: `npm run start:dev`
2. Open: `http://localhost:3000/api`
3. Click **Authorize 🔒** (top right)
4. Enter your API key (e.g. `test-key-123`)
5. Click **Authorize** → **Close**
6. Use **Try it out** on any endpoint to test interactively

> Swagger is only available when `NODE_ENV=development`.

---

## Running Tests

**Run unit tests:**

```bash
npm run test
```

**Run tests with coverage report:**

```bash
npm run test:cov
```

**Run end-to-end tests:**

```bash
npm run test:e2e
```

**Coverage thresholds** (configured in `package.json`):

| Metric | Threshold |
|---|---|
| Lines | 80% |
| Functions | 80% |
| Branches | 70% |
| Statements | 80% |

---

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@nestjs/core` | ^10.0.0 | NestJS core framework — dependency injection, modules, decorators |
| `@nestjs/common` | ^10.0.0 | Common NestJS utilities — controllers, services, guards, pipes |
| `@nestjs/platform-express` | ^10.0.0 | Express HTTP adapter for NestJS |
| `@nestjs/config` | ^3.0.0 | Environment variable management with typed config factory |
| `@nestjs/swagger` | ^7.0.0 | Swagger / OpenAPI documentation and interactive UI |
| `@nestjs/throttler` | ^5.0.0 | Rate limiting — prevents API abuse (100 req/min global) |
| `class-validator` | ^0.14.0 | Decorator-based DTO validation (e.g. `@IsNumber`, `@IsEnum`) |
| `class-transformer` | ^0.5.0 | Transforms plain JSON into typed DTO class instances |
| `joi` | ^17.0.0 | Schema validation for environment variables at app startup |
| `swagger-ui-express` | ^5.0.0 | Serves Swagger UI at `/api` route |
| `reflect-metadata` | ^0.1.13 | Required by NestJS for decorator metadata support |
| `rxjs` | ^7.8.0 | Reactive extensions — required internally by NestJS |

### Development Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@nestjs/testing` | ^10.0.0 | NestJS test utilities — `Test.createTestingModule()` |
| `@nestjs/cli` | ^10.0.0 | CLI for generating modules, services, controllers |
| `jest` | ^29.0.0 | Test runner and assertion library |
| `supertest` | ^6.0.0 | HTTP assertions for integration/e2e tests |
| `ts-jest` | ^29.0.0 | TypeScript preprocessor for Jest |
| `typescript` | ^5.0.0 | TypeScript compiler |
| `@types/express` | ^4.0.0 | TypeScript types for Express |
| `@types/jest` | ^29.0.0 | TypeScript types for Jest |
| `@types/supertest` | ^6.0.0 | TypeScript types for Supertest |
| `@types/node` | ^20.0.0 | TypeScript types for Node.js built-ins |

---

## Notes

- **Data persistence:** Orders are stored in-memory and are lost on application restart. This is intentional per the project specification.
- **Fixed stock price:** When no `marketPrice` is provided in the portfolio, a fixed price of **$100** is used per share.
- **Market schedule:** Orders are scheduled for the next weekday at **9:30 AM EST (14:30 UTC)**. Weekends are skipped automatically.
- **Decimal precision:** Share quantities are rounded to `SHARE_DECIMAL_PLACES` decimal places (default: 3). Change via environment variable without code changes.
