# Pasakja — student tutorial (voice-over script & shot list)

Use this as your narration script and **shot list** when you record a screen walkthrough. Read lines in a calm, clear pace. Pause where **[PAUSE]** appears so cuts or captions fit.

**Suggested length:** 10–15 minutes (or split into 3 shorter videos: *Setup*, *Passenger*, *Driver & Admin*).

**Before recording:** Start `npm run dev`, seed the database (`npm run db:seed`), and have the demo logins from `README.md` ready.

---

## 0. Title card (0:00 – 0:20)

**On screen:** Your title slide or the Pasakja landing page (`/`).

**Say:**

> “Hello. This is a short guide to **Pasakja**—our web-based **community transportation booking and dispatching system** for Socorro, Surigao del Norte.  
> I’ll show you the **three roles** in the app: **passenger**, **driver**, and **admin**, and what you need to know to use or demo the project. **[PAUSE]** Let’s start.”

---

## 1. What Pasakja does (0:20 – 1:00)

**On screen:** Scroll the landing page slightly; show project name and main idea.

**Say:**

> “Pasakja connects **passengers** who need a ride, **drivers** who provide transport, and **administrators** who oversee bookings, fares, and safety.  
> It’s built with **Next.js**, **PostgreSQL**, **Prisma**, and **NextAuth** for sign-in. The booking flow uses a **map** with pickup and destination, **fare estimates** from admin-configured zones, and optional **GCash** payments through **PayMongo** in **test mode** for class use—**no real money** when you use test keys. **[PAUSE]**  
> In class, always work inside the **map area** for Socorro; the app is set up for that region.”

---

## 2. If you will run the project locally (1:00 – 2:30) — optional segment

**On screen:** Terminal: clone path, `npm install`, copy `.env.example` to `.env` (blur secrets), `npm run db:generate`, `npm run db:push`, `npm run db:seed`, `npm run dev`. Do **not** show real API keys.

**Say:**

> “If you’re a developer on the team, you need **Node 20+** and **PostgreSQL**.  
> After cloning, run **npm install**, copy **.env.example** to **.env**, and set **DATABASE_URL**, **NEXTAUTH_SECRET**, and **NEXTAUTH_URL**.  
> For GCash demos, add **PayMongo test keys** from the PayMongo dashboard—still **test** keys only for coursework.  
> Then run **database generate**, **db push** or migrate, **seed** for demo accounts, and **npm run dev**.  
> The **README** lists **demo accounts**: admin, driver, and passenger, all with a shared demo password for exploration. **[PAUSE]**  
> Never commit real secrets; keep them only in your local **.env**.”

*Skip this section in a “end-user only” video.*

---

## 3. Sign in and roles (2:30 – 3:30)

**On screen:** Login page; log in as **passenger@demo.com** (password from README—say “the demo password in the README” on audio if you don’t want to say it aloud).

**Say:**

> “Everyone signs in through the same **login** page. Your **role**—passenger, driver, or admin—controls which dashboard you see. **[PAUSE]**  
> I’ll start as a **passenger**.”

---

## 4. Passenger: book a ride (3:30 – 6:00)

**On screen:** Passenger dashboard → **Book a ride** (or equivalent). Map: use **GPS** for pickup or place pin; set **destination** by clicking the map. Show **fare estimate** and **route** on map. Mention **road snapping** if a wrong click is rejected.

**Say:**

> “As a passenger, I open **book a ride**. The **map** is centered on our service area. I can use my **location** for pickup, then **tap the map** to set where I’m going.  
> If I click somewhere the system can’t treat as a road, it may **reject** the point and ask me to try again—that’s **road snapping** working. **[PAUSE]**  
> I see an **estimated fare** based on distance and the **admin’s fare settings**. I can choose **shared ride** if that option is available.  
> For payment, I can pick **cash** and pay the driver after the trip, or **GCash** for online pay in test mode—I’ll **confirm** and complete the flow my instructor expects for the demo. **[PAUSE]**  
> After booking, I can track status and open **my trips** for history and to **rate the driver** after completion.”

---

## 5. Passenger: SOS (6:00 – 6:45) — short

**On screen:** Passenger **SOS** or emergency page (as implemented).

**Say:**

> “There is an **SOS** or emergency feature for passengers. It can send **GPS coordinates** to administrators and shows **emergency contact** information.  
> Use this only in **serious** situations in real life; in class, follow your instructor’s rules for **testing** it.”

---

## 6. Driver: go online and handle trips (6:45 – 9:00)

**On screen:** Log out; log in as **driver@demo.com**. Show **online/offline** toggle, **bookings** list or requests, **accept** a trip, **status** updates (e.g. accepted → picked up → in progress → completed), **earnings** or trip history if time.

**Say:**

> “Now as a **driver**, I sign in with the driver demo account. I can toggle **online** when I’m available. **[PAUSE]**  
> I see **booking requests** and can **accept** one. I move the trip through the **status** steps so the passenger sees progress.  
> The interface may show a **map** for navigation and whether payment is **cash** or **GCash**. **[PAUSE]**  
> I can review **earnings** and **past trips** from the driver area.”

---

## 7. Admin: overview (9:00 – 11:00)

**On screen:** Log in as **admin@demo.com**. Dashboard **stats**; **drivers** (verify/suspend); **bookings**; **fares** or zones; **reports**; **SOS** if you have alerts; **settings** briefly.

**Say:**

> “**Administrators** see a **dashboard** with system statistics—bookings, revenue, users. **[PAUSE]**  
> They can **verify or suspend** drivers, browse **all bookings** and **passengers**, and manage **fare zones** and rates that drive the **passenger’s fare estimate**. **[PAUSE]**  
> **Reports** help with monthly comparisons and top drivers. **Settings** may include security and notification options.  
> If a passenger sends an **SOS**, admins can see and act on those **alerts** here. **[PAUSE]**  
> This panel is for **trusted** staff only in a real deployment.”

---

## 8. Close (11:00 – 12:00)

**On screen:** Return to landing page or a simple “Thanks” slide with link to repo / README (no secrets).

**Say:**

> “That’s the core of **Pasakja**: book and pay as a **passenger**, fulfill trips as a **driver**, and **manage** the system as an **admin**.  
> For setup details, **environment variables**, and **PayMongo test** steps, use the project **README**.  
> If you get stuck, ask in class or in your group chat. **Good luck** with the capstone.”

**[END]**

---

## Recording checklist (for the instructor)

| Step | Note |
|------|------|
| Display | 1920×1080, browser zoom 100% |
| Audio | USB mic or headset; record in a quiet room; normalize levels in your editor |
| PII | Don’t read real card numbers; use test GCash + PayMongo test keys only |
| Secrets | Blur or skip `.env` in the video |
| Captions | Export SRT or use auto-captions and fix role names and “GCash / PayMongo” |
| Chapters | YouTube/Canvas chapter markers: Intro · Setup (opt.) · Passenger · Driver · Admin · Outro |

---

## Split into three short videos (alternative)

1. **“Running Pasakja locally”** — Section 2 + link to README.  
2. **“Passenger & SOS”** — Sections 3–5.  
3. **“Driver & Admin”** — Sections 6–7 + short 8.

Each target **4–5 minutes** for easier watching.

---

*Aligned with the Pasakja capstone as documented in the repository `README.md`.*

---

## YouTube: title, hook line, and description (copy-paste)

**Live app:** [https://pasakja.vercel.app/](https://pasakja.vercel.app/)

### Suggested titles (pick one)

1. **Pasakja Capstone Walkthrough: Book a Ride, Driver & Admin (Socorro, Surigao del Norte)** — clear, searchable, under ~70 characters for most displays.
2. **How to Use Pasakja — IT Capstone (Passenger, Driver, Admin Tour)** — student-friendly, “how to” intent.
3. **Pasakja Tutorial | Community Transport Booking for Students (Full Guide)** — broad; good if the audience is not only IT majors.

**Shorter A/B option:** `Pasakja App Tutorial 2026 | IT Capstone`

### “Caption” = first line of the video description (YouTube shows this in search and above “Show more”)

Use a single strong line before the break:

> Step-by-step walkthrough of **Pasakja**—passenger booking, driver trips, and admin tools—for our capstone. Try the live app and sample logins: **https://pasakja.vercel.app/** (check the **login form** for sample credentials).

### Full YouTube description (edit timestamps if your video length differs)

```
Step-by-step walkthrough of Pasakja (community transportation booking & dispatching) for our IT capstone—passenger, driver, and admin.

Try the live app here:
https://pasakja.vercel.app/

On the sign-in page, you can use the sample credentials shown in the login form to explore the system.

0:00 Intro — What is Pasakja?
0:xx Running locally (optional)
0:xx Passenger — book a ride, map, fare, payments
0:xx SOS (overview)
0:xx Driver — online, accept trips, status
0:xx Admin — dashboard, drivers, bookings, fares
0:xx Closing

#Pasakja #Capstone #Socorro #SurigaoDelNorte #WebDevelopment #ITProject

(Replace chapter times after upload or use YouTube’s automatic chapters.)
```

**Tags you can add in YouTube Studio:** `Pasakja`, `capstone`, `IT project`, `transportation`, `booking app`, `Next.js`, `Philippines`, `Socorro`, `student tutorial`.
