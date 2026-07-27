# DriveFlow

Frontend-only **Smart Car Rental Management System** built from the reference screens in `Ui/Ux`.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn-style UI, Framer Motion, Lucide React, React Hook Form, Zod, TanStack Table, React Query, Recharts, Embla Carousel, next-themes.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002). Auth: `/login`, `/forgot-password`.

**Note:** If `http://localhost:3000` shows another app (e.g. Nova Tech), that port is already in use. DriveFlow uses **port 3002** by default. To free 3000, stop the other project's terminal or run `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force` (only if you intend to stop that app).

## Design source

All layout, spacing, sidebar, top bar, cards, tables, and module patterns follow the JPEG references under `Ui/Ux`, with **FleetPremium** branding replaced by **DriveFlow**.

## Routes

| Area | Paths |
|------|--------|
| Dashboard | `/` |
| Fleet | `/vehicles`, `/vehicles/[id]` |
| Customers | `/customers`, `/customers/[id]` |
| Bookings | `/bookings`, `/bookings/[id]`, `/bookings/create` |
| Payments | `/payments`, `/revenue`, `/invoices` |
| Ops | `/drivers`, `/maintenance`, `/notifications`, `/reports`, `/analytics` |
| Settings | `/settings`, `/support`, `/help` |
| Auth | `/login`, `/forgot-password` |

Mock data lives in `src/data/mock.ts`.
