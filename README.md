# DriveFlow

Smart Car Rental Management System — **frontend** (Vite + React) and **backend** (Express + Prisma + PostgreSQL).

## Structure

```
frontend/          React UI (Vite :5173)
backend/
  src/             Express API (TypeScript)
  prisma/          Schema + seed
deploy/            Caddy HTTPS reverse-proxy config
scripts/           Dev + DB backup helpers
Dockerfile         Production image (API serves frontend/dist)
docker-compose.yml Postgres + API (+ optional HTTPS profile)
```

## Local setup

```bash
npm run install:all
cp backend/.env.example backend/.env
# Set DATABASE_URL + generate JWT secrets (32+ chars each)
npm run db:push
npm run db:seed
npm run dev
```

UI: http://127.0.0.1:5173 · API: http://127.0.0.1:3002/api/v1/health

### Seed login

- Email: `admin@driveflow.com`
- Password: `Admin@123`

## API (`/api/v1`)

| Area | Notes |
|------|--------|
| Auth | register, login, logout, refresh, profile, change-password, forgot/reset-password |
| Vehicles / Customers / Bookings | JWT CRUD |
| Drivers / Payments / Payment methods / Invoices / Maintenance / Notifications | JWT CRUD |
| Analytics | `GET /analytics/summary` (dashboard charts + KPIs) |
| Health | public `GET /health` |

## Environment

**Backend** (`backend/.env`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres — local or cloud (Neon / Supabase / RDS) |
| `CORS_ORIGIN` | Comma-separated allowed browser origins |
| `APP_URL` | Public UI URL (password-reset links) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Min 32 chars — use `openssl rand -hex 48` |
| `VITE_API_URL` | Frontend only — empty in Vite proxy; set when API is on another origin |
| `SMTP_*` | Optional — without SMTP, reset links print to server logs |
| `TRUST_PROXY` | `true` behind Caddy/nginx |

**Frontend** (`frontend/.env`):

```
VITE_API_URL=
```

## Docker (Postgres + API + static UI)

```bash
cp .env.example .env
# set POSTGRES_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
docker compose up --build -d
```

App: http://127.0.0.1:3002

HTTPS (Caddy profile):

```bash
DOMAIN=yourdomain.com docker compose --profile https up --build -d
```

## Production build (without Docker)

```bash
npm run build --prefix frontend
npm run build --prefix backend
cd backend && NODE_ENV=production node dist/server.js --prod
```

## Backups

```bash
# Docker Postgres
./scripts/backup-db.sh

# Or any DATABASE_URL
DATABASE_URL="postgresql://..." ./scripts/backup-db.sh
```

Backups land in `backups/*.sql.gz` (gitignored).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run install:all` | Install backend + frontend |
| `npm run dev` | API + Vite together |
| `npm run db:push` | Sync Prisma schema |
| `npm run db:seed` | Super Admin + sample vehicles |
| `npm run build` | Build frontend |

## License

MIT — see [LICENSE](./LICENSE).
