# Pasakja — student tutorial (voice-over script & shot list)

Use this as your narration script and **shot list** when you record a screen walkthrough. Read lines in a calm, clear pace. Pause where **[PAUSE]** appears so cuts or captions fit.

**Suggested length:** 12–18 minutes (or split into 3 shorter videos: *Setup*, *Passenger*, *Driver & Admin*).

**Before recording:**
1. `npm run dev`
2. For a **clean demo**: `npm run db:cleanup` then `npm run db:seed` (restores accounts, zones, fares; clears old bookings)
3. Have demo logins from `README.md` ready

**Live demo URL:** https://pasakja.vercel.app/ (or `http://localhost:3000`)

---

## 0. Title card (0:00 – 0:20)

**On screen:** Title slide or Pasakja landing page (`/`).

**Say:**

> “Hello. This is a guide to **Pasakja**—our web-based **community transportation booking and dispatching system** for Socorro, Surigao del Norte.  
> I’ll show the **passenger**, **driver**, and **admin** roles and how to demo the latest features: **interactive map booking**, **live driver tracking**, and **one active ride at a time** rules. **[PAUSE]** Let’s start.”

---

## 1. What Pasakja does (0:20 – 1:15)

**On screen:** Scroll landing page; highlight feature cards.

**Say:**

> “Pasakja connects **passengers**, **drivers**, and **administrators** on one platform.  
> It’s built with **Next.js**, **PostgreSQL**, **Prisma**, and **NextAuth**. Booking uses a **Leaflet map** with **GPS pickup**, **destination search**, and **OSRM** route distance for **fare estimates**.  
> Payments: **cash** or **GCash** via **PayMongo test mode**—no real money with test keys. **[PAUSE]**  
> The map is locked to **Socorro**. Vehicle types include **Tricycle**, **Habal-habal**, and **Bao-bao**.”

---

## 2. Running locally (optional) (1:15 – 2:45)

**On screen:** Terminal — `npm install`, `.env` (blur secrets), `npm run db:generate`, `npm run db:push`, `npm run db:seed`, `npm run dev`. Show `npm run db:cleanup` briefly.

**Say:**

> “Developers need **Node 20+** and **PostgreSQL**. Copy **.env.example** to **.env** and set **DATABASE_URL**, **NEXTAUTH_SECRET**, and **NEXTAUTH_URL**.  
> Add **PayMongo test keys** for GCash demos. Run **seed** for demo accounts.  
> Before a fresh defense demo, run **db:cleanup** to clear old trips, then **seed** again. **[PAUSE]**  
> Never commit real secrets.”

*Skip for end-user-only videos.*

---

## 3. Sign in and roles (2:45 – 3:30)

**On screen:** `/login` → `passenger@demo.com` / `demo123`.

**Say:**

> “Everyone uses the same **login** page. Your **role** decides the dashboard: passenger, driver, or admin. **[PAUSE]**  
> I’ll start as a **passenger**.”

---

## 4. Passenger: book a ride (3:30 – 7:00)

**On screen:** `/passenger` → **Book a Ride** → map workflow end-to-end.

**Say:**

> “I open **Book a Ride**. If I already have a **pending or active** trip, the page **blocks** a second booking and sends me to **My Trips**—that’s intentional. **[PAUSE]**  
> On the **map**, I allow **GPS** for pickup. The pin **snaps to the nearest road**—clicks off-road are rejected.  
> I set my destination with the **place search** or by **clicking the map**. A **route line** appears and the **fare estimate** loads from **distance + zone rates**. **[PAUSE]**  
> I can optionally pick a **nearby online driver** so the request goes to them first.  
> I choose **Cash** or **GCash**, add notes if needed, and **Confirm Booking**. Status becomes **Pending**. **[PAUSE]**  
> If I try to book again, the system says I already have an active ride.”

**Show (if time):** GCash flow → redirect → `/passenger/payment/return`.

---

## 5. Passenger: live tracking & My Trips (7:00 – 8:15)

**On screen:** `/passenger/trips` with an **Accepted** booking; show **LiveTrackingMap** and ETA.

**Say:**

> “In **My Trips**, active bookings are highlighted. While the driver is **Accepted**, I see a **live map** that updates the driver’s position about every ten seconds, plus an **ETA to pickup**. **[PAUSE]**  
> I can **cancel** only while **Pending** or **Accepted**—before pickup.  
> After the trip completes, I **rate the driver** here.”

---

## 6. Passenger: SOS (8:15 – 8:45)

**On screen:** `/passenger/sos`.

**Say:**

> “**Emergency SOS** is always in the sidebar. It sends **GPS coordinates** to admins. In class, only test it when your instructor says so.”

---

## 7. Driver: online, accept, one trip at a time (8:45 – 11:30)

**On screen:** Log out → `driver@demo.com` → online toggle → `/driver/bookings`.

**Say:**

> “As **driver**, I sign in. I must be **Verified** and **Online** to see requests. **[PAUSE]**  
> **Bookings** splits **Requested for You** and **Available Requests**. I **Accept** one trip. If I already have an active trip, **Accept is disabled**—drivers can only handle **one ride at a time**. **[PAUSE]**  
> I can **Decline** a passenger-requested booking to open it to everyone, or **Can’t Go** after accept to release it back to **Pending** without cancelling the passenger.  
> I progress: **Picked Up** → **Start Trip** → **Complete**. On complete, I earn the **net amount**—**85%** of fare; **15%** is the platform fee. **[PAUSE]**  
> **Navigate** shows the trip map; my GPS feeds the passenger’s live tracking.”

---

## 8. Admin: overview (11:30 – 14:00)

**On screen:** `admin@demo.com` → dashboard, drivers, fares, reports, SOS.

**Say:**

> “**Admin** sees platform stats: bookings, users, **platform revenue**, SOS count. **[PAUSE]**  
> **Driver Management**: verify, suspend, view **documents**.  
> **Fare & Zones**: base fare + per-km rate—used by OSRM distance at booking time.  
> **Reports**: monthly comparisons, top drivers, **remittance** status for platform fees.  
> **SOS**: resolve passenger alerts. **[PAUSE]**  
> Only admins see these modules.”

---

## 9. Close (14:00 – 15:00)

**On screen:** Landing page or thanks slide + README link.

**Say:**

> “That’s **Pasakja**: **map booking**, **live tracking**, **realistic one-ride rules**, and **admin oversight**.  
> For setup, **db:cleanup**, **seed**, and PayMongo test steps, see the **README**. Good luck with the capstone.”

**[END]**

---

## Defense demo companion

For panel presentations, open **`/defense-demo.html`** in the browser (or the hosted copy) — twelve scenes matching this walkthrough with RBAC callouts.

---

## Recording checklist

| Step | Note |
|------|------|
| Display | 1920×1080, browser zoom 100% |
| Pre-demo | `npm run db:cleanup` + `npm run db:seed` for clean state |
| Audio | Quiet room; normalize levels |
| PII | PayMongo **test** keys only |
| Secrets | Blur `.env` on screen |
| Captions | Fix role names, GCash, OSRM, Leaflet |

---

## Split into three short videos

1. **Running Pasakja locally** — Section 2  
2. **Passenger: map book + live tracking + SOS** — Sections 3–6  
3. **Driver & Admin** — Sections 7–8  

---

## YouTube description (template)

```
Pasakja capstone walkthrough — map booking, live tracking, driver dispatch, admin tools.

Live app: https://pasakja.vercel.app/
Demo logins: see README or login page hints (passenger@demo.com / driver@demo.com / admin@demo.com — demo123)

Chapters: Intro · Setup · Passenger book & track · SOS · Driver · Admin · Outro

#Pasakja #Capstone #Socorro #Next.js #Transportation
```

---

*Aligned with Pasakja as of the latest map, booking-guard, and commission updates.*
