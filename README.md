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
- Register & login
- Book rides with pickup and drop-off address
- Real-time trip status tracking
- View trip history & rate drivers
- SOS emergency alert button
- Shared ride option

### Driver
- Register with vehicle details
- Toggle online/offline availability
- View and accept nearby booking requests
- Update trip status (Accepted → Picked Up → In Progress → Completed)
- View earnings & trip history
- GPS navigation guidance

### Admin
- Dashboard with system stats (revenue, bookings, drivers, passengers)
- Verify or suspend driver accounts
- View all bookings and passengers
- Manage fare zones and rates
- Reports & analytics (monthly comparisons, top drivers)
- System settings

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
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

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
│   ├── api/             # API routes
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Dashboard layout
│   ├── admin/           # Admin-specific components
│   └── driver/          # Driver-specific components
├── lib/
│   ├── prisma.ts        # Prisma client
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
- **Booking** - ride booking record
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
```

---

*Pasakja — IT Capstone Project · Socorro, Surigao del Norte*
