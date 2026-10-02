# Flixer Shop API

A NestJS e-commerce backend that demonstrates Clean Architecture, Domain-Driven Design (DDD), CQRS, domain events, and ports/adapters. It manages customers, products, orders, and checkout payments while keeping business rules independent of HTTP, databases, email, and payment providers.

It supports MongoDB or PostgreSQL persistence at runtime. PostgreSQL uses Drizzle ORM and migrations; MongoDB uses the native MongoDB driver. Redis caches exchange rates and Monnify access tokens.

## Contents

- [Capabilities](#capabilities)
- [Requirements and quick start](#requirements-and-quick-start)
- [Configuration](#configuration)
- [Database workflow](#database-workflow)
- [Architecture](#architecture)
- [HTTP API](#http-api)
- [Order and payment lifecycle](#order-and-payment-lifecycle)
- [Scripts and verification](#scripts-and-verification)
- [Implementation notes](#implementation-notes)

## Capabilities

- Register, search, retrieve, and delete customers.
- Create, search, retrieve, and delete products.
- Place orders in a customer's preferred currency, converting product prices when necessary.
- Move orders through `pending → confirmed → shipped → delivered`, or cancel while pending/confirmed.
- Generate a tracking number when an order is shipped.
- Start checkout sessions with Stripe, Paystack, or Monnify.
- Process Stripe and Paystack payment webhooks, then automatically confirm the linked order after a successful payment.
- Send MJML-rendered email notifications for customer registration and order lifecycle events.
- Return consistent JSON success/error envelopes and globally validate/transform request data.

## Requirements and quick start

Prerequisites:

- Node.js 20 or later (the project compiles to ES2023)
- pnpm 10 or later
- Docker and Docker Compose for the provided local infrastructure

Install dependencies and start local services:

```bash
pnpm install
docker compose up -d
```

Create your local environment file from the committed shape reference, replacing every credential-like value with your own local or sandbox value:

```bash
cp .env.example .env
```

Set `DATABASE` to `postgres` or `mongodb`, complete the variables below, then start the API:

```bash
# Apply the provided PostgreSQL migration when DATABASE=postgres
pnpm db:migrate

# Run in watch mode at http://localhost:3000
pnpm start:dev
```

The supplied Compose stack exposes:

| Service    | Address           | Purpose                                         |
| ---------- | ----------------- | ----------------------------------------------- |
| PostgreSQL | `localhost:5432`  | Relational persistence for Drizzle repositories |
| MongoDB    | `localhost:27017` | Document persistence for Mongo repositories     |
| Redis      | `localhost:6379`  | Application cache                               |

Stop the local stack with `docker compose down`. Add `-v` only when deliberately deleting local database/cache volumes.

## Configuration

`.env.example` is a variable-shape reference, not a source of safe production credentials. Do not commit `.env`; rotate any credential that has been shared or used beyond a private local environment.

### Core and infrastructure

| Variable                     | Required               | Description                                                                                          |
| ---------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                   | No                     | Defaults to `development`; enables pretty/debug Pino logs in development.                            |
| `PORT`                       | No                     | HTTP port; defaults to `3000`.                                                                       |
| `APP_NAME`                   | For email branding     | Name passed to email templates.                                                                      |
| `FRONTEND_URL`               | For notification links | Base URL in registration, order-placed, and delivery emails.                                         |
| `CURRENCY`                   | Yes                    | Default three-letter product currency, for example `USD`.                                            |
| `DATABASE`                   | Yes                    | Repository selection: `postgres` or `mongodb`; defaults to `postgres`.                               |
| `REDIS_URL`                  | Yes                    | Redis connection URL, for example `redis://localhost:6379`.                                          |
| `MONGO_DB_URI`               | Yes at startup         | Mongo connection URI.                                                                                |
| `MONGO_DB_NAME`              | No                     | Mongo database name; defaults to `flixer_shop_db`.                                                   |
| `POSTGRESS_DB_URL`           | Yes at startup         | PostgreSQL URL for Drizzle and Drizzle Kit. The project intentionally uses the spelling `POSTGRESS`. |
| `SMTP_HOST`, `SMTP_PORT`     | Yes at startup         | SMTP host and port.                                                                                  |
| `SMTP_USER`, `SMTP_PASSWORD` | Yes at startup         | SMTP credentials.                                                                                    |
| `SMTP_FROM`                  | Yes at startup         | Sender address, optionally `Name <email@example.com>`.                                               |
| `SHIPPING_TEAM_EMAIL`        | On order confirmation  | Recipient of the order-ready-to-ship email.                                                          |

> **Startup behaviour:** Mongo and Drizzle are both registered globally even though repositories are selected with `DATABASE`. The current implementation therefore needs reachable MongoDB and PostgreSQL connections. Redis, SMTP, all payment-gateway constructor settings, and the exchange-rate API key are also constructed during bootstrap.

### Payment and exchange-rate integrations

| Integration      | Variables used by the code                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Stripe           | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`                     |
| Paystack         | `PAYSTACK_BASE_URL`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_SUCCESS_URL`                                          |
| Monnify          | `MONNIFY_API_KEY`, `MONNIFY_SECRET_KEY`, `MONNIFY_CONTRACT_CODE`, `MONNIFY_BASE_URL`, `MONNIFY_SUCCESS_URL` |
| ExchangeRate-API | `EXCHANGE_RATE_API_KEY`                                                                                     |

Use sandbox/test credentials for development. `MONNIFY_WEBHOOK_SECRET`, `MONNIFY_CALLBACK_URL`, and `SMTP_SECURE` occur in the example environment file but are not read by the current application code.

## Database workflow

The PostgreSQL schema lives in `src/shared/infrastructure/database/postgress/schema/`; generated migrations live in `drizzle/`.

```bash
# Generate a migration after changing the Drizzle schema
pnpm db:generate

# Apply generated migrations
pnpm db:migrate

# Synchronize schema directly (use carefully outside local development)
pnpm db:push

# Browse PostgreSQL with Drizzle Studio
pnpm db:studio
```

The initial migration creates `customers`, `products`, `orders`, `order_items`, and `payments`, plus order/payment status enums and foreign keys. MongoDB collections are created on first write; this repository does not define MongoDB indexes or migrations.

Money is stored internally in minor units (for example, `1099` for `10.99`) in both persistence implementations. API product prices are numbers; order monetary fields in response DTOs are strings to preserve exact decimal values.

## Architecture

Every business module follows the same inward-facing dependency direction:

```text
HTTP controller / DTO / mapper
            │
            ▼
 CQRS command or query handler
            │
            ▼
 Domain aggregate, entities, value objects, events, exceptions
            │
            ▼
 Port (repository, gateway, lookup, exchange rate)
            │
            ▼
 Adapter (Drizzle, MongoDB, Stripe, Paystack, Monnify, SMTP, Redis/HTTP)
```

| Module     | Aggregate / responsibility                                  | Key ports and adapters                                                                  |
| ---------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `customer` | Customer profile, email, preferences                        | Customer repository: MongoDB or Drizzle                                                 |
| `product`  | Catalog product, SKU, price, stock state                    | Product repository: MongoDB or Drizzle                                                  |
| `order`    | Order, items, shipping address, status                      | Order repository; customer/product lookups; exchange-rate adapter                       |
| `payment`  | Payment state and checkout                                  | Payment repository; Stripe, Paystack, Monnify registry; order-pricing/customer adapters |
| `shared`   | Base domain types, money/currency, database, logging, email | Global database, notification, logging modules                                          |

Commands mutate aggregates and commit domain events. Queries retrieve aggregates through repositories and map them to HTTP response DTOs. `OrderFulfillmentSaga` listens for successful payments and dispatches `ConfirmOrderCommand`.

## HTTP API

There is no global route prefix. The default base URL is `http://localhost:3000`. This codebase does not currently expose Swagger/OpenAPI documentation or authentication/authorization middleware.

### Response envelopes

Successful endpoints are wrapped by a global interceptor:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": []
}
```

Validation failures have this shape:

```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed"
  },
  "errors": {
    "fieldName": ["Validation message"]
  }
}
```

Unknown body/query properties are removed (`whitelist: true`). Query values are transformed only where their DTO declares a transformer. UUID route parameters must be valid UUIDs.

### Customers

| Method and path         | Body/query           | Status | Description                                         |
| ----------------------- | -------------------- | ------ | --------------------------------------------------- |
| `POST /customers`       | Registration body    | 201    | Registers a customer and sends a welcome email.     |
| `GET /customers`        | `isActive`, `search` | 200    | Lists customers; `isActive` accepts `true`/`false`. |
| `GET /customers/:id`    | —                    | 200    | Retrieves a customer.                               |
| `DELETE /customers/:id` | —                    | 204    | Deletes a customer.                                 |

```json
POST /customers
{
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "phone": "+14155552671",
  "preferences": { "currency": "USD" }
}
```

`email`, `firstName`, `lastName`, and `preferences.currency` are required. The domain normalizes/validates currency as a three-letter uppercase code. Duplicate email addresses are rejected.

### Products

| Method and path        | Body/query                         | Status | Description                                                          |
| ---------------------- | ---------------------------------- | ------ | -------------------------------------------------------------------- |
| `POST /products`       | Product body                       | 201    | Creates a product.                                                   |
| `GET /products`        | `isActive`, `minPrice`, `maxPrice` | 200    | Lists products, optionally filtered by active state and price range. |
| `GET /products/:id`    | —                                  | 200    | Retrieves a product.                                                 |
| `DELETE /products/:id` | —                                  | 204    | Deletes a product.                                                   |

```json
POST /products
{
  "name": "Mechanical Keyboard",
  "description": "Hot-swappable 75% keyboard",
  "sku": "KEY-75-BLK",
  "basePrice": 129.99,
  "stock": 20
}
```

`sku` must be 3–50 alphanumeric/dash characters and is unique; product names are also unique. `basePrice` and `stock` must be non-negative. Although the request DTO accepts `currency`, product creation currently uses server-side `CURRENCY`.

### Orders

| Method and path             | Body/query                                    | Status | Description                                                       |
| --------------------------- | --------------------------------------------- | ------ | ----------------------------------------------------------------- |
| `POST /orders`              | Order body                                    | 201    | Places a pending order.                                           |
| `GET /orders`               | `orderId`, `customerId`, `search`, `statuses` | 200    | Lists orders. `statuses` accepts a comma-separated list or array. |
| `GET /orders/:id`           | —                                             | 200    | Retrieves an order.                                               |
| `PATCH /orders/:id/confirm` | —                                             | 202    | Confirms a pending order.                                         |
| `PATCH /orders/:id/ship`    | —                                             | 202    | Ships a confirmed order and generates tracking.                   |
| `PATCH /orders/:id/deliver` | —                                             | 202    | Marks a shipped order delivered.                                  |
| `PATCH /orders/:id/cancel`  | `{ "reason": "..." }`                         | 202    | Cancels a pending or confirmed order.                             |

```json
POST /orders
{
  "customerId": "00000000-0000-4000-8000-000000000001",
  "items": [
    {
      "productId": "00000000-0000-4000-8000-000000000002",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Example Street",
    "city": "Lagos",
    "state": "Lagos",
    "zipCode": "100001",
    "country": "NG"
  }
}
```

`items` must contain at least one item and each quantity must be at least one. The order uses its customer's preference currency; products priced in another currency are converted through ExchangeRate-API and cached for one hour. `search` applies to order notes and tracking number.

Allowed transitions:

```text
pending ──► confirmed ──► shipped ──► delivered
   │            │
   └────────────┴──► cancelled
```

### Payments and webhooks

| Method and path                    | Body/headers                                             | Description                                                                                             |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `POST /payments`                   | `{ "orderId", "provider", "successUrl?", "cancelUrl?" }` | Starts checkout and returns payment ID plus checkout URL. Provider: `stripe`, `paystack`, or `monnify`. |
| `POST /payments/webhooks/stripe`   | Raw body and `stripe-signature`                          | Verifies and processes a Stripe event.                                                                  |
| `POST /payments/webhooks/paystack` | Raw body and `x-paystack-signature`                      | Verifies and processes a Paystack event.                                                                |

```json
POST /payments
{
  "orderId": "00000000-0000-4000-8000-000000000003",
  "provider": "stripe"
}
```

Example checkout response:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request successful",
  "data": {
    "paymentId": "...",
    "checkoutUrl": "https://checkout.example/..."
  }
}
```

The `successUrl` and `cancelUrl` request properties are validated but not consumed by the current gateways; redirect URLs come from provider environment variables. Monnify has webhook verification in its gateway adapter, but this version does not expose `POST /payments/webhooks/monnify`.

## Order and payment lifecycle

```text
Customer + Products
        │
        ▼
POST /orders
        │  snapshots product name and price in customer's currency
        ▼
pending order ──► order-placed customer email
        │
        ▼
POST /payments ──► payment processing + provider checkout URL
        │
        ▼
Verified Stripe/Paystack success webhook
        │
        ▼
payment succeeded ──► CQRS saga ──► order confirmed ──► shipping-team email
                                                  │
                           ship ──► customer email │ deliver ──► customer email
```

Orders may also be manually confirmed, shipped, delivered, or cancelled through their transition endpoints. Email templates live in `src/shared/infrastructure/notification/email/templates/` and are rendered from MJML before SMTP delivery.

## Scripts and verification

| Command            | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `pnpm start`       | Start Nest normally.                              |
| `pnpm start:dev`   | Start Nest in watch mode.                         |
| `pnpm start:debug` | Start Nest with Node inspector and watch mode.    |
| `pnpm build`       | Compile into `dist/`.                             |
| `pnpm lint`        | Run type-aware Oxlint.                            |
| `pnpm format`      | Format `src` and `test` TypeScript with Prettier. |
| `pnpm test`        | Run Vitest unit-test config.                      |
| `pnpm test:watch`  | Run Vitest in watch mode.                         |
| `pnpm test:cov`    | Run tests with V8 coverage.                       |
| `pnpm test:e2e`    | Run the separate Vitest e2e config.               |
| `pnpm db:generate` | Generate a Drizzle migration.                     |
| `pnpm db:migrate`  | Apply Drizzle migrations.                         |
| `pnpm db:push`     | Push schema directly.                             |
| `pnpm db:studio`   | Open Drizzle Studio.                              |

Verified for this README update:

```bash
pnpm build
```

The e2e test initializes the full `AppModule`, so it needs the same live infrastructure and environment configuration as the API. The source exposes no root (`GET /`) controller; update the old starter root-endpoint expectation in `test/app.e2e-spec.ts` as the test suite evolves.

## Implementation notes

- Domain events are handled in-process through `@nestjs/cqrs`; there is no outbox, message broker, retry queue, or asynchronous worker.
- Registration and order lifecycle notifications use SMTP synchronously in event handlers.
- Products store `stock` and a low-stock threshold, but placing an order does not currently reserve/decrement stock or reject insufficient stock.
- Order items persist product name and price snapshots, so later product changes do not alter existing order totals.
- Pagination, authentication, authorization, rate limiting, CORS configuration, health endpoints, and OpenAPI docs are not implemented here.
- Pino redacts `Authorization` and `Cookie` headers. The process timezone is UTC.
