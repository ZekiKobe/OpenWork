# OpenWork

OpenWork is a freelance marketplace and community platform. Clients can post jobs and hire talent; freelancers can create gigs, apply to jobs, manage contracts, and showcase portfolios. The app also includes community posts, points, messaging, reviews, notifications, and optional wallet/escrow payments via Stripe.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5, TypeScript, Sequelize |
| Database | MySQL 8 |
| Realtime | Socket.IO (notifications and messages) |
| Payments | Stripe Checkout (optional) |
| Auth | JWT, Google OAuth, email verification |

## Default ports

| Service | Port |
|---------|------|
| Frontend (dev) | 5173 |
| Backend API | 3001 |
| MySQL | 3306 |
| Frontend (production compose) | 80 |

## Local setup

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (recommended), or a local MySQL instance

### 1. Clone and configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and secrets. For local development, defaults in `.env.example` are sufficient to get started.

Key variables:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — MySQL connection
- `JWT_SECRET` — signing key for access tokens (use a long random value in production)
- `FRONTEND_URL` — allowed CORS origin (default `http://localhost:5173`)
- `VITE_API_URL` — frontend API base URL (default `http://localhost:3001/api`)
- `PAYMENTS_ENABLED`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — optional Stripe integration
- `SMTP_*`, `EMAIL_FROM` — optional email for verification and password reset
- `GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID` — optional Google sign-in

### 2. Run with Docker Compose

```bash
docker compose up --build
```

This starts MySQL, the backend (with hot reload), and the frontend dev server.

- Frontend: http://localhost:5173
- Backend health: http://localhost:3001/health

### 3. Run without Docker

Start MySQL, then:

```bash
# Backend
cd backend
npm install
npm run db:setup    # create DB, migrate, seed (or run steps individually)
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Database migrations

From the `backend` directory:

```bash
npm run migrate              # apply pending migrations
npm run migrate:status       # show migration state
npm run migrate:undo         # undo last migration
npm run migrate:undo:all     # undo all migrations
npm run seed                 # run seeders
npm run db:setup             # create DB + migrate + seed
```

Other useful scripts:

```bash
npm run db:create
npm run db:reset
npm run build
npm test
```

## Production deployment

Use `docker-compose.prod.yml` with strong secrets in `.env`:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Production compose:

- Builds optimized backend and frontend images (`Dockerfile.prod`)
- Runs MySQL without exposing the database port publicly
- Persists uploads in a Docker volume
- Serves the frontend on port 80 by default
- Optional `proxy` service (nginx) is available via profile `with-proxy`:

```bash
docker compose -f docker-compose.prod.yml --profile with-proxy up -d
```

Before deploying:

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (32+ characters)
3. Set `FRONTEND_URL` and `VITE_API_URL` to your public URLs
4. Configure SMTP for transactional email
5. Run migrations against the production database
6. Enable Stripe only when keys and webhooks are configured

## Testing

Backend unit tests (Jest, no live database required):

```bash
cd backend
npm test
```

CI runs backend build + tests and frontend lint + build on push/PR.

## Project structure

```
OpenWork/
├── backend/          # Express API, Sequelize models, migrations
├── frontend/         # React SPA
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── init-db.sql
```

## Features (current)

- User registration with freelancer/client roles
- Gigs, jobs, proposals, contracts, and milestones
- Direct messaging between users
- Real-time notifications and message delivery (Socket.IO)
- Community posts, likes, comments, and points
- Reviews and portfolios
- Wallet, escrow payments, and withdrawals (when Stripe is enabled)
- Admin/moderation tools
- File uploads (local or S3 when configured)

## License

See repository license file if present.
