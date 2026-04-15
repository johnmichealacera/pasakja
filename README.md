# Pasakja

**A Web-Based Community Transportation Booking & Dispatching System**

A capstone project for IT graduating students at Socorro, Surigao del Norte.

---

## Overview

Pasakja connects **passengers**, **drivers**, and **administrators** through a centralized web platform that simplifies ride booking, dispatching, monitoring, and transportation management.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma v7 |
| Auth | NextAuth.js v5 |
| Runtime | Node.js |

## Features

### Passenger
- Register & login with role-based access
- **Map-based ride booking** with interactive Leaflet map (OpenStreetMap tiles)
  - GPS auto-pickup from device location
  - Click-to-set destination on map
  - **Road snapping** — pins snap to the nearest road via OSRM `/nearest`; clicks on mountains or areas without roads are rejected with a message
  - **Map bounds** locked to Socorro, Surigao del Norte (cannot pan to other areas)
  - Route polyline drawn on map between pickup and destination
- **Dynamic fare estimate** calculated server-side from route distance (OSRM) + admin-configured zone rates (base fare + per-km rate)
- **Two payment methods:**
  - **Cash** — pay the driver after the ride
  - **GCash** (online) — pre-pay at booking via [PayMongo](https://www.paymongo.com/) Payment Intent + GCash redirect; uses **test mode** by default (no real money)
- **Shared ride option** — toggle to share the ride with others going the same direction
- Real-time trip status tracking
- View trip history & rate drivers
- **SOS emergency alert** — sends real-time GPS coordinates to administrators; shows GPS status, emergency contacts (PNP, BFP, NDRRMC), and confirms when alert is sent
- Responsive layout: two-column on desktop (large map + controls sidebar), single column on mobile

### Driver
- Register with vehicle details (license, plate, model)
- Toggle online/offline availability
- View and accept nearby booking requests
- Update trip status (Accepted → Picked Up → In Progress → Completed)
- Mini-map on active trip cards with link to full navigation view
- View earnings & trip history
- GPS navigation guidance with route polyline
- Payment badges showing **Cash** or **GCash** per booking

### Admin
- Dashboard with system stats (revenue, bookings, drivers, passengers)
- Verify or suspend driver accounts
- View all bookings and passengers (with payment method labels)
- Manage fare zones and rates (base fare + per-km rate formula)
- Reports & analytics (monthly comparisons, top drivers)
- System settings (security, notifications, tech stack info)

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_SECRET, and (for GCash) PayMongo keys

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed with demo data
npm run db:seed

# Start development server
npm run dev
```

### Demo Accounts

After seeding, use these accounts to explore the system:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Driver | driver@demo.com | demo123 |
| Passenger | passenger@demo.com | demo123 |

---

## Project Structure

```
pasakja/
├── app/
│   ├── (auth)/          # Login & Register pages
│   ├── (dashboard)/     # Role-based dashboards
│   │   ├── passenger/   # Passenger portal
│   │   ├── driver/      # Driver portal
│   │   └── admin/       # Admin panel
│   ├── api/             # API routes (includes `paymongo/*`, `fares/estimate`, `maps/*`)
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Dashboard layout
│   ├── maps/            # MapPicker (booking) and TripMap (driver navigation)
│   ├── admin/           # Admin-specific components
│   └── driver/          # Driver-specific components
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── paymongo.ts      # PayMongo API helper (server-side)
│   └── auth.ts          # Auth re-exports
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Demo data seeder
├── types/               # TypeScript type definitions
└── auth.ts              # NextAuth.js configuration
```

---

## Database Schema

Key tables:
- **User** - base user (Passenger/Driver/Admin)
- **Passenger** - passenger profile
- **Driver** - driver profile with vehicle details
- **Booking** - ride booking record (`paymentMethod` CASH/ONLINE, `paymentStatus`, optional `paymongoPaymentIntentId`, `quotedFare`)
- **Trip** - trip timing and distance
- **Rating** - passenger ratings for drivers
- **Earning** - driver earnings records
- **Zone** / **Fare** - service zones with fare rates
- **Notification** - system notifications
- **SosAlert** - emergency alerts

---

## Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# PayMongo (GCash) — from https://dashboard.paymongo.com/developers
PAYMONGO_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY="pk_test_..."
# Optional locally: webhook signing secret if you register a webhook URL
PAYMONGO_WEBHOOK_SECRET=""
```

---

## GCash payments (PayMongo)

Online payments use **PayMongo** with **`payment_method_allowed: gcash`** only. Amounts are in **PHP** (centavos on the API; minimum charge follows PayMongo’s current rules, typically **₱20.00** minimum).

### How the flow works

1. Passenger selects **GCash**, sets pickup and destination, and sees a **server-calculated** estimated fare (`/api/maps/route` for distance, `/api/fares/estimate` for fare).
2. **`POST /api/paymongo/checkout`** creates a booking (`paymentMethod: ONLINE`, `paymentStatus: UNPAID`) and a PayMongo **Payment Intent**, then stores `paymongoPaymentIntentId`.
3. **`POST /api/paymongo/attach`** creates a GCash payment method, attaches it with a `return_url`, and returns the **redirect URL** to the GCash / PayMongo test checkout.
4. After payment, the user lands on **`/passenger/payment/return`**, which polls **`GET /api/paymongo/status`** until the Payment Intent is **succeeded**, then marks the booking **PAID** (same update can arrive via webhook).

### Testing in PayMongo test mode (recommended for capstone)

Test mode uses **`sk_test_` / `pk_test_` keys**. **No real money** leaves a GCash wallet.

1. Add your PayMongo **test** keys to `.env` (see above).
2. Run `npm run dev` and sign in as **passenger** (e.g. `passenger@demo.com` / `demo123` after seed).
3. Open **Book a ride**, set pickup and destination on the map, choose **GCash**, confirm the **estimated fare** appears.
4. Click **Pay with GCash & Book** — you should be redirected to PayMongo’s **test** GCash experience and then back to **`/passenger/payment/return`**.
5. Verify the booking under **My trips** and that payment completed as expected.

**Webhooks (optional locally):** The return page + status poll can mark a booking **PAID** without webhooks. For production-like behavior, expose your app with HTTPS (e.g. ngrok), register **`POST /api/paymongo/webhook`** in the PayMongo dashboard for **`payment.paid`**, and set **`PAYMONGO_WEBHOOK_SECRET`** to the webhook’s secret so signatures are verified.

### Testing with a real GCash account

- **Test keys (`sk_test_` / `pk_test_`):** PayMongo runs in **test mode**. Flows are simulated; you do **not** pay with real GCash balance in the way production does.
- **Real GCash charges** require PayMongo **live mode**: **`sk_live_` / `pk_live_`**, a **fully onboarded** PayMongo merchant account (KYC / compliance as PayMongo requires), and pointing your app’s env vars to **live** keys. Transactions then use **real money** and real fees—only do this when you intentionally go live, not for routine class demos.
- For a capstone demo, **stay on test keys** and document that production would switch to live keys after merchant approval.

---

*Pasakja — IT Capstone Project · Socorro, Surigao del Norte*
