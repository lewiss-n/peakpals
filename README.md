# Peak Pals Adventures website

Website and admin panel for **Peak Pals Adventures**: guided hikes, fitness bootcamps and virtual run challenges in and around Nairobi.

- **Public site:** home, events (with filters), event pages with booking, activities, memories (photo/video albums), merch shop with ordering, about, team building, privacy policy, terms.
- **Admin panel (`/admin`):** analytics dashboard, events, bookings (mark paid, cancel, CSV export), memories (drag-and-drop photo and video uploads), merch shop (add, edit and remove items; manage orders), team-building enquiries, newsletter subscribers, admin accounts.
- **Stack:** Next.js 15 (App Router) · React 19 · Tailwind CSS 4 · PostgreSQL 16 · Drizzle ORM · Docker.

---

## Quick start with Docker (recommended)

You need Docker Desktop (Windows/Mac) or Docker Engine (Linux).

```bash
cp .env.example .env
# Edit .env: set POSTGRES_PASSWORD, AUTH_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD
docker compose up -d --build
```

Open **http://localhost:3000**. The admin panel is at **http://localhost:3000/admin**; sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

On first start the app automatically:

1. creates the database tables (migrations),
2. creates the first admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`,
3. if `SEED_DEMO=true`, adds sample events and a "Trail Moments" album with the starter photos (only when the database is empty).

Generate a strong `AUTH_SECRET` with `openssl rand -base64 48`.

### Going live on a server with HTTPS

On a Linux VPS with a domain pointing at it:

```bash
# in .env
DOMAIN=peakpals.co.ke
SITE_URL=https://peakpals.co.ke
COOKIE_SECURE=true

docker compose --profile https up -d --build
```

This adds [Caddy](https://caddyserver.com), which gets and renews a free HTTPS certificate automatically. Ports 80 and 443 must be open. If you use your own reverse proxy (Nginx, Cloudflare Tunnel, etc.), skip the profile and proxy to port 3000. Forward the `Host` and `X-Forwarded-Proto` headers, and allow request bodies of at least 250 MB for video uploads.

### Updating

```bash
git pull   # or copy in the new files
docker compose up -d --build
```

Database migrations run automatically on start.

### Backups

Your data lives in two Docker volumes: `pgdata` (database) and `uploads` (photos and videos).

```bash
# database
docker compose exec -T db pg_dump -U peakpals peakpals > backup-$(date +%F).sql
# uploads
docker run --rm -v peak-pals_uploads:/data -v "$PWD":/backup alpine tar czf /backup/uploads-$(date +%F).tgz -C /data .
```

The volume name prefix comes from the folder name; check it with `docker volume ls`. Restore the database with `docker compose exec -T db psql -U peakpals peakpals < backup.sql`.

## Deploy a demo on Vercel

Everything works on Vercel: bookings, merch orders, the admin panel, analytics, and photo and video uploads. Uploads are stored in **Vercel Blob** and data in a **Neon Postgres** database, both free to start and both added from the Vercel dashboard.

1. **Put the project on GitHub** (a private repository is fine). The easiest way on Windows is [GitHub Desktop](https://desktop.github.com): *File → Add local repository* → choose the `peak-pals` folder → *Publish repository*. `.env` and uploads are ignored and won't be uploaded.
2. In [Vercel](https://vercel.com/new), click **Add New → Project** and import the repository.
3. Before clicking **Deploy**, open **Environment Variables** and paste in the contents of `vercel-env-variables.txt` (in the folder above `peak-pals`) (Vercel accepts a whole `.env` file pasted at once). You need `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `SEED_DEMO=true`.
4. Click **Deploy**. The first deployment **will stop** with "No database connected". This is expected.
5. In the project, open **Storage**:
   - **Create Database → Neon (Postgres)**, region **Frankfurt (eu-central-1)**, and connect it to the project.
   - **Create → Blob**, and connect it to the project.
6. Open **Deployments** and click **Redeploy** on the latest one.

During each build, `scripts/setup.ts` creates or updates the database tables, creates the admin account and, with `SEED_DEMO=true`, adds the demo events, merch and photo album. Open the deployment URL, and `/admin` to sign in.

Notes:
- The project runs in Vercel's Frankfurt region (`vercel.json`), next to the database, for the fastest response from Nairobi.
- When you go live, add your domain under **Settings → Domains**. Set `SEED_DEMO=false` once you've replaced the demo content.
- On Vercel, photos and videos upload straight from the browser to Blob storage (no 4.5 MB limit), then photos are resized automatically.

---

## Before launch: things to fill in

| Where | What |
|---|---|
| `src/lib/site.ts` | Email, phone, WhatsApp number, M-Pesa Paybill number and social media links (currently placeholders). |
| `src/app/(site)/privacy/page.tsx` and `terms/page.tsx` | Retention periods, refund policy and liability wording in `[brackets]`. Have an advocate review both pages. |
| Sample events (`SEED_DEMO=true`) | The seven demo events use realistic Kenyan trails, but **prices, meeting points and instructors are placeholders**. Edit or delete them in the admin panel, or start with `SEED_DEMO=false` for an empty calendar. |
| Sample merch (`SEED_DEMO=true`) | Six starter items (tee, hoodie, cap, bottle, buff, tote) with **placeholder prices** and branded illustrations instead of photos. Edit, add photos or remove them in **Admin → Merch shop**. |
| Photos | Replace or add albums in **Admin → Memories** with real photos from your events. Add cover photos to events in **Admin → Events**. |

---

## Using the admin panel

- **Dashboard:** visitors, page views, bookings, conversion rate, confirmed and pending revenue, traffic chart, top pages, traffic sources, devices, browsers, and how full each upcoming event is. Switch between the last 7, 30 and 90 days.
- **Events:** create, edit, unpublish or delete events. Set activity type, difficulty (Easy / Moderate / Difficult), location type (Near Nairobi / Out of Nairobi / Virtual), price in KES, number of spots, trail stats, what's included, what to bring, and a cover photo.
- **Bookings:** every booking gets a reference (e.g. `PP-3F9A1C`). When the M-Pesa payment arrives, click **Mark paid**. Cancelling a booking frees up its spots. Expand a booking to see participants, ages, guardian details for under-18s and photo consent. **Export CSV** produces a list for guides on the day.
- **Memories:** create an album, then drag in photos (JPG/PNG/WebP up to 25 MB, auto-resized to WebP) and videos (MP4/WebM/MOV up to 200 MB). Add captions and descriptions, pick the cover, link the album to an event.
- **Merch shop:** add, edit and remove items: name, category, price, sizes, colours, photos (the first is the main one; reorder with the arrows), in stock / sold out, featured (shown first and on the home page) and visible. Items without photos show a branded illustration. The **Orders** tab lists every order with its reference (e.g. `PM-4C2A9E`), delivery choice and address. Move each order from **Mark paid** to **Mark delivered**, or cancel it. Export orders as CSV.
- **Enquiries:** team-building requests, with New / Contacted / Closed status.
- **Subscribers:** newsletter sign-ups, with CSV export.
- **Settings:** change your password and add more admin accounts.

### Booking rules built in

- Participants must be **13 or older**.
- If anyone in a booking is under 18, a parent or guardian's name, phone and consent are required.
- Data protection consent and terms acceptance are required. Photo/video consent is optional and stored per booking.
- Spots can't be overbooked, even when two people book at the same moment.

### Analytics and privacy

Analytics are first-party (no Google Analytics). No IP addresses are stored. Visitors whose browser sends Do Not Track or Global Privacy Control are not counted, and bots are filtered out. A random visitor ID cookie is used to count unique visitors.

---

## Local development (without Docker)

Requires Node.js 22 and PostgreSQL 16.

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev
```

### Changing the database schema

Edit `src/lib/db/schema.ts`, then run `npm run db:generate` to create a new SQL migration in `drizzle/`. It is applied automatically on the next start.

## Project structure

```
src/
  app/(site)/        public pages
  app/admin/         admin login and panel
  app/api/           tracking, uploads, CSV export, health check
  app/media/         serves uploaded photos and videos
  components/        UI components (admin/ for the panel)
  lib/db/            schema and database client
  lib/actions/       server actions (bookings, forms, admin)
  lib/bootstrap.ts   migrations, first admin and demo data on start
  lib/site.ts        business details
drizzle/             SQL migrations
public/brand/        logo files (SVG)
public/images/       site photos
seed/images/         starter album photos
```

## Brand

Colours, fonts and logo usage follow the Peak Pals brand guidelines: Forest `#355A35`, Sunset Orange `#E85D04`, Savanna Gold `#FFBA08`, Sand `#FBD569`, Canvas Cream `#F7EFCA`, Acacia Olive `#899536`, Earth Brown `#8C3703`, Night Forest `#1F3320` for text. Fonts are Quicksand (headings), Nunito Sans (body) and Caveat (handwritten accents), all self-hosted.
