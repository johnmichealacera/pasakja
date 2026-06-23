# PASAKJA Thesis — Revision Guide (Post-Implementation Updates)

This document lists **modification parts** for the submitted thesis (`thesis.txt`), based on application feedback that was implemented after the original write-up. Each section shows **where to edit** (chapter/section), **what to change**, and **ready-to-paste replacement or addition text**.

Use this as a revision worksheet: copy the proposed paragraphs into your Word document and update screenshots in the appendices where noted.

---

## Summary of Implemented Changes

| # | Feedback / Enhancement | Thesis impact |
|---|------------------------|---------------|
| 1 | Removed redundant **"Live"** badge on passenger My Trips (status badge retained) | Minor UI note in My Trips section |
| 2 | **Driver sees passenger live location** on navigate map during active trips | GPS, Driver Module, Database, Technical Background |
| 3 | **Pickup area search** (same searchable dropdown as destination) | Book a Ride section |
| 4 | **Trip time estimate** (pickup → destination) via OSRM routing | Book a Ride, My Trips, Driver Bookings, Navigation, Active Trip |
| 5 | **View counterparty profile** (passenger ↔ driver) | Passenger/Driver modules, Security |
| 6 | **Profile modal z-index** fixed above Leaflet map | Minor UI note (optional) |
| 7 | **Platform fee added to passenger** (15%); driver keeps full trip fare | Fare logic, Payments, Earnings, Admin Reports |
| 8 | **Passenger document verification** (ID upload, admin review) | Registration, Profile, Admin Passengers, Database |
| 9 | **Leaflet.js live map** already implemented (was listed as future work) | Technical Background, Limitations, Recommendations |

---

## ABSTRACT (Page iii)

### Replace the third paragraph (system description sentence) with:

> The system was built using Next.js (App Router), TypeScript, PostgreSQL, Prisma ORM, NextAuth, Tailwind CSS, and shadcn/ui, with Cloudinary for profile and verification document storage and PayMongo for GCash-based online payment integration. It serves three user roles — Passenger, Driver, and Administrator — each with a dedicated, access-controlled dashboard. Key features include GPS-assisted ride booking with searchable pickup and destination selection, automated fare computation by service zone with a transparent platform fee added to the passenger total, OSRM-based trip duration estimates, bidirectional real-time location sharing on an interactive Leaflet map, driver and passenger identity verification through document uploads, real-time booking status tracking, earnings monitoring, an emergency SOS alert system, counterparty profile viewing during active trips, and administrative reports and analytics.

### Add to Keywords (optional):

> route estimation, document verification, platform fee, Leaflet maps

---

## CHAPTER 1 — INTRODUCTION

### 1.1 Purpose and Description — Key Features (around lines 129–138)

**Add** the following bullets after *Driver Registration and Verification*:

- **Passenger Identity Verification:** Passengers may upload government-issued IDs and supporting documents during registration or from their profile for administrator review, improving accountability on both sides of a trip.
- **Transparent Platform Fee:** A configurable platform fee (15%) is added on top of the trip fare paid by the passenger; drivers receive the full base trip fare without deduction.
- **Trip Duration Estimates:** Estimated travel time and distance from pickup to destination are computed using an open routing service (OSRM) and displayed before and during bookings.
- **Counterparty Profile Access:** Passengers and drivers can view each other's basic profile information (name, photo, phone, role-specific details) during an active booking to confirm identity.
- **Bidirectional Live Location:** During active trips, passengers share live GPS coordinates with assigned drivers, who see an updated passenger marker on the navigation map alongside pickup and destination pins.

**Revise** the bullet *Real-Time Tracking* to:

- **Real-Time Tracking:** Passengers can track driver location during trips; drivers can also view the passenger's current location on the navigation map when a trip is active, using periodic GPS updates displayed on an interactive Leaflet map.

### 1.2 Scope of the Study (around lines 157–164)

**Add** under scope:

- **Passenger Verification Documents:** The system supports optional upload of passenger identity and supporting documents for administrative review, similar to the driver verification workflow.
- **Fare Transparency:** Fares are shown as a breakdown of trip fare, platform fee, and total amount payable by the passenger.
- **Route and Time Estimation:** The system provides estimated trip duration and distance between selected pickup and destination points.

### 1.3 Significance of the Study — Passengers (around line 176)

**Add** after the existing passenger benefits sentence:

> Additional features such as document verification, trip time estimates, fare breakdown with platform fee, and the ability to view the assigned driver's profile further improve trust, planning, and safety for commuters.

### 1.3 Significance of the Study — Drivers (around line 177)

**Add:**

> Drivers benefit from seeing the passenger's live location during pickup, viewing passenger profile details before or during a trip, and receiving the full base trip fare without platform fee deduction from their earnings.

---

## CHAPTER 3 — TECHNICAL BACKGROUND

### 3.1 Media and Payment Integration — Cloudinary (around lines 257–258)

**Replace** with:

> Cloudinary is a cloud-based media management platform used in Pasakja for storing and serving user profile images and verification documents for both drivers and passengers. When a user uploads a profile photo or verification document (government ID, proof of address, selfie with ID, or other supporting file), the file is sent to Cloudinary's API (or stored locally in development), and a secure URL is saved in the database. This approach removes the need to store large files on the application server and provides reliable media delivery.

### 3.2 Add new subsection after Geolocation and GPS

#### Interactive Maps — Leaflet.js

> Pasakja integrates **Leaflet.js**, an open-source JavaScript mapping library, to render interactive trip maps on the booking, navigation, and trip-tracking interfaces. The map displays pickup and destination markers, the driver's live position, and—during active trips—the passenger's live position. Map tiles are loaded from OpenStreetMap-compatible providers. This replaces a static coordinate display with a visual, zoomable map that improves spatial awareness for drivers and passengers.

#### Route and Duration Estimation — OSRM

> Trip distance and estimated duration are computed through the **Open Source Routing Machine (OSRM)** public routing API. When pickup and destination coordinates are selected, the system requests a driving route and returns distance in kilometers and duration in minutes. These values are shown on the Book a Ride page, My Trips, the driver's booking and navigation pages, and the active-trip summary card, helping users plan trips before confirmation.

#### Platform Commission Model

> Pasakja applies a **15% platform fee** on top of the base trip fare. The passenger pays the sum of trip fare and platform fee; the driver earns the full base trip fare upon trip completion. Fare breakdown components (trip fare, platform fee, total) are displayed consistently across booking, trip history, and payment flows. Online payments through PayMongo charge the passenger total amount.

---

## CHAPTER 4 — METHODOLOGY

### 4.6 Database Design Summary (around lines 309–319)

**Add** to the entity list:

- **PassengerDocument** — verification files uploaded by passengers (type, URL, filename, timestamp)
- **PassengerLocation** — live GPS coordinates shared by passengers during active bookings
- **DriverDocument** — verification files uploaded by drivers (existing; ensure it remains listed)

**Revise** the Booking entity description to:

- **Booking** — ride request with pickup/dropoff coordinates and addresses, status, quoted base fare, passenger total fare (including platform fee), payment method, and payment status

### 4.3 System Architecture — add under Backend/API:

- Location APIs for driver and passenger live coordinates
- Maps API for OSRM route and duration estimation
- Document upload APIs for driver and passenger verification files
- Booking-scoped counterparty profile API for safe profile viewing during active trips

---

## CHAPTER 5 — RESULTS AND DISCUSSION

> **Note:** Update all related screenshots in the appendices after revising these sections.

---

### 5.1 Registration Interface (Figure 3, around lines 375–396)

**Add under Passenger Registration Fields:**

- Optional verification documents (Government-Issued ID, Proof of Address, Selfie with ID, Other) — uploaded at registration and stored for admin review

**Add under Business Rules:**

- Passenger verification documents are optional at registration; passengers may also upload or manage documents later from the Profile page
- Accepted file types: JPG, PNG, WebP, PDF (maximum 5 MB per file)

---

### 5.2 Book a Ride Interface (Figure 6, around lines 440–459)

**Replace Form Fields — Pickup location** with:

- **Pickup location** — searchable area/address dropdown (same interface as destination) **or** map picker; GPS may pre-fill the current location
- **Drop-off location** — searchable area/address dropdown **or** map picker

**Add** after Fare Estimation:

#### Trip Duration Estimation

- Estimated travel time (~X minutes) and distance (Y km) from pickup to destination are computed via OSRM and displayed on the map and fare summary card before booking confirmation
- Duration estimate is also shown on My Trips, the active-trip card, driver booking requests, and the driver navigation page

**Replace** Fare Estimation section with:

#### Fare Estimation and Breakdown

- **Trip fare (base)** is calculated from the active service zone: Base Fare + (Distance in km × Per-km Rate)
- **Platform fee (15%)** is added on top of the trip fare and shown separately
- **Passenger total** = Trip fare + Platform fee
- The full breakdown is displayed before confirmation and on trip records
- Drivers receive the **full trip fare**; the platform fee is not deducted from driver earnings

**Add** under Payment Flow (Online):

- PayMongo checkout charges the **passenger total** (trip fare + platform fee)

---

### 5.3 My Trips Interface (Figure 7, around lines 461–479)

**Add** to list columns / card details:

- Estimated trip duration and distance (when coordinates are available)
- Fare breakdown: trip fare, platform fee, and total
- **View Driver** button — opens a profile dialog with driver name, photo, phone, vehicle details (when a driver is assigned)

**Revise** active trip styling note:

- Active trips (Accepted, Picked Up, In Progress) are highlighted with a primary border and status badge; the separate **"Live"** outline label was removed to reduce visual clutter while retaining clear status indication

---

### 5.4 Active Trip Card on Book a Ride Page (NEW SUBSECTION — insert after My Trips or within Book a Ride)

#### Active Trip Summary (Book a Ride — Trip in Progress)

When a passenger already has an active booking, the Book a Ride page displays a summary card instead of the booking form, including:

- Pickup and destination addresses
- Current booking status
- Estimated trip duration and distance
- Fare breakdown (trip fare, platform fee, total)
- Options to finish viewing the current trip or navigate to My Trips

**Business rule:** A passenger may not create a new booking while another trip is active (Accepted, Picked Up, or In Progress).

---

### 5.5 Passenger Profile Interface (Figure 8, around lines 480–496)

**Add** new subsection:

#### Identity Verification Documents

Route: `/passenger/profile`

The passenger profile page includes an **Identity Verification** card where passengers can:

- Select document type: Government-Issued ID, Proof of Address, Selfie with ID, or Other
- Upload JPG, PNG, WebP, or PDF files (max 5 MB)
- View, open, or delete previously uploaded documents
- See upload date and document type for each file

Administrators review passenger documents from the Admin Passengers page (see Section 5.12).

---

### 5.6 Driver Bookings Interface (Figure 11, around lines 534–554)

**Add** to Booking Card Information:

- Estimated trip duration and distance
- Fare breakdown showing trip fare (driver earnings) and passenger total with platform fee
- **View Passenger** button — opens profile dialog with passenger name, photo, and phone

---

### 5.7 Navigation Interface (Figure 12, around lines 556–569)

**Replace** map description with:

- **Interactive TripMap (Leaflet.js)** displaying:
  - Pickup marker (booked pickup point)
  - Destination marker
  - Driver live position (updated periodically)
  - **Passenger live position** (amber marker, updated every 10 seconds during active trips)
- Trip duration estimate and fare breakdown summary
- **View Passenger** profile dialog accessible from the navigation page

**Add** technical note:

- Passenger live location is captured automatically in the passenger layout via `PassengerLocationSharer` while a trip is active; coordinates are stored in the `PassengerLocation` table and polled by the driver's map component

---

### 5.8 Driver Earnings Interface (Figure 13, around lines 571–583)

**Add** clarification under Summary Cards or as a note:

> Driver earnings reflect the **full base trip fare** per completed booking. The 15% platform fee is collected from the passenger total and is not deducted from the driver's recorded earning amount.

---

### 5.9 Admin Passenger Management (Figure 18, around lines 680–691)

**Replace** Passenger List Columns with:

- Profile image and name initials
- Full name
- Email address and phone number
- Total number of bookings
- Account registration date
- **Documents** button — opens a dialog listing uploaded verification documents with image/PDF preview and open-in-new-tab links

---

### 5.10 Admin Fare and Zone Management (Figure 19, around lines 693–711)

**Add** after Fare Calculation Logic:

#### Platform Fee (Passenger Total)

After the base trip fare is computed:

- **Platform fee** = 15% of trip fare
- **Passenger total** = Trip fare + Platform fee
- **Driver earning** = Trip fare (full amount)

This model ensures drivers are not charged the platform fee from their earnings; the fee is transparently added to what the passenger pays.

---

### 5.11 Evaluation — Functionality (around lines 762–770)

**Add** two evaluation criteria rows (adjust means after re-survey if applicable):

| Criteria | Mean | Verbal Description |
|----------|------|-------------------|
| The system displays accurate trip duration estimates and fare breakdowns | _TBD_ | _TBD_ |
| Passenger and driver document verification and profile viewing functions operate correctly | _TBD_ | _TBD_ |

---

### 5.12 Key Achievements (around lines 821–842)

**Add** under *Accountability and Transparency*:

- Passengers and drivers can verify each other's identity through profile viewing and document uploads
- Fare breakdown shows trip fare, platform fee, and total so passengers understand what they pay and drivers know what they earn

**Add** under *Operational Efficiency*:

- OSRM-based duration estimates help passengers and drivers plan pickup and arrival times
- Searchable pickup and destination selection reduces address entry errors compared to manual typing alone

**Revise** under *Safety and Emergency Response*:

- Bidirectional GPS sharing allows drivers to locate passengers who may not be exactly at the booked pickup pin

---

### 5.13 Comparison with Traditional Methods (around lines 862–873)

**Add** rows:

| Traditional Method | Pasakja System | Improvement |
|--------------------|----------------|-------------|
| No passenger identity check | Passenger document upload and admin review | Safer, accountable passenger onboarding |
| Driver fee taken from earnings | Platform fee added to passenger total; driver keeps full fare | Fairer driver income model |
| Guesswork on travel time | OSRM-based duration and distance estimate | Better trip planning |
| Cannot see who is picking you up | View driver/passenger profile during booking | Improved trust and safety |

---

### 5.14 Limitations and Future Enhancements (around lines 875–884)

**REMOVE** from future enhancements (now implemented):

1. ~~Live Map Rendering — Integrate Leaflet.js~~ → **Implemented** using Leaflet.js with live driver and passenger markers
7. ~~Route Optimization — Integrate a routing API~~ → **Partially implemented** via OSRM for distance/duration estimates (turn-by-turn in-app navigation remains future work)

**REVISE** item 7 to:

> **Turn-by-Turn Navigation** — Extend the OSRM integration to provide step-by-step voice or visual turn-by-turn directions inside the driver navigation interface (current implementation provides route distance, duration, and map markers only).

**ADD** new future enhancements:

- **Passenger verification workflow** — Add formal verification status (Pending / Verified) for passengers, similar to driver status, with booking restrictions for unverified accounts if required by policy
- **Automated document review** — OCR or AI-assisted validation of uploaded IDs to reduce manual admin workload
- **Hosted OSRM instance** — Replace the public OSRM endpoint with a self-hosted routing server for production reliability and rate-limit control

---

### 5.15 Conclusion (Chapter 5, around lines 886–893)

**Add** to key strengths list:

> …bidirectional live location sharing on Leaflet maps, OSRM trip duration estimates, transparent platform fee on passenger bookings, passenger identity document verification, and counterparty profile viewing during active trips.

---

## CHAPTER 6 — SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS

### 6.1 Summary (around lines 901–903)

**Add** to the technology integrations sentence:

> …Leaflet.js for interactive maps, OSRM for route-based duration estimation, and document upload workflows for both driver and passenger verification.

### 6.2 Conclusions — add point 7:

> 7. Adding the platform fee to the passenger total—rather than deducting from driver earnings—supports a fairer revenue model and clearer fare transparency for all parties.

> 8. Passenger document verification and counterparty profile viewing extend the safety and accountability mechanisms originally designed for drivers to the full two-sided marketplace.

### 6.3 Recommendations (around lines 914–922)

**Remove or revise:**

- ~~Real-Time Map Integration: Integrate Leaflet.js~~ → Revise to: **Enhance map features** — add turn-by-turn navigation, custom map styling, and offline tile caching on top of the existing Leaflet implementation.

**Add:**

- **Formalize passenger verification status** — extend admin tools to approve or flag passenger documents with a visible verification badge
- **Re-evaluate ISO 9126 scores** — include new features (duration estimates, fare breakdown, document upload, live passenger location) in a follow-up usability survey

---

## APPENDICES — Screenshot Checklist

Update or add screenshots for:

| Screen | Route | What to capture |
|--------|-------|-----------------|
| Book a Ride — pickup search | `/passenger/book` | Pickup dropdown + map + duration chip + fare breakdown |
| My Trips — active trip | `/passenger/trips` | Status, duration, fare breakdown, View Driver |
| Active trip card | `/passenger/book` (with active booking) | In-progress summary with duration and fare |
| Passenger profile — documents | `/passenger/profile` | Identity Verification upload card |
| Register — passenger docs | `/register` | Passenger tab with optional document uploads |
| Driver navigate — passenger marker | `/driver/navigate` | Leaflet map with passenger + driver markers |
| Driver bookings | `/driver/bookings` | Duration estimate + View Passenger |
| Admin passengers — documents | `/admin/passengers` | Documents dialog with ID preview |
| Fare breakdown (any trip view) | various | Trip fare / Platform fee / Total |

---

## RELATED FILE — Defense Q&A Update

`PASAKJA-defense-QA.md` **Question 4 (GPS tracking)** still states that live map tracking is a future enhancement. Update that answer to reflect:

- Leaflet.js is implemented
- Driver and passenger live markers are shown during active trips
- OSRM provides duration/distance estimates
- Turn-by-turn navigation remains a future enhancement

**Question 3 (Fare calculation)** should also mention the 15% platform fee added to the passenger total and that drivers receive the full base fare.

---

## Quick Reference — Fare Formula (for panel defense)

```
Trip fare (base)  = Base Fare + (Distance km × Per-km Rate)
Platform fee      = Trip fare × 15%
Passenger total   = Trip fare + Platform fee
Driver earning    = Trip fare (full base amount)
```

---

*Document prepared to align the submitted thesis with the current Pasakja implementation (June 2026).*
