# SkillSprint Frontend

Next.js 16 (App Router) + Tailwind CSS v4 + Framer Motion frontend for the SkillSprint LMS, built against the `skillsprint-backend` API.

## Stack
- Next.js (App Router, JS not TS)
- Tailwind CSS v4 (CSS-first config via `@theme` in `app/globals.css` — no `tailwind.config.js`)
- Framer Motion for micro-interactions
- Axios for API calls, `lucide-react` for icons
- Fonts loaded via CSS `@import` (Space Grotesk / Inter / JetBrains Mono) — kept out of `next/font` so builds never depend on network access to Google Fonts at build time

## Design system
- **Color**: `#FF6B00` warm orange (signal/primary), `#1A202C` dark slate (ink), plus a light "paper" and dark "night" background, and a mint accent reserved for success/"unlocked" states only.
- **Type**: Space Grotesk (headings), Inter (body), JetBrains Mono (prices, stats, transaction IDs).
- **Theme**: light/night toggle in the navbar, persisted to `localStorage`, class-based (`.dark` on `<html>`), respects `prefers-color-scheme` on first visit.
- **Signature interaction**: the gated video player (`components/GatedVideoPlayer.jsx`) — locked lessons show a pulsing lock button; unlocking is a real state change (a short-lived stream token issued by the backend), not a cosmetic toggle.

## Setup

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to your backend
npm run dev
```

Runs on `http://localhost:3000`. Requires the `skillsprint-backend` API running (see its own README) at the URL in `NEXT_PUBLIC_API_URL`.

## Environment variables
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API, including `/api`, e.g. `https://your-backend.onrender.com/api` |

## Structure
```
app/
  page.js                 Home (hero from CMS, featured courses)
  login/, register/       Auth
  courses/                Catalog (search/filter/sort)
  courses/[id]/           Course detail — gated player, enroll/pay
  profile/                Avatar, bio, target skills, password
  my-courses/             Enrolled courses
  admin/                  Admin shell (sidebar) + dashboard, courses CRUD,
                           CMS & discounts, enrollments, users
components/                Shared UI (Navbar, CourseCard, Modal, PaymentModal,
                           GatedVideoPlayer, ThemeToggle...)
components/admin/          Admin-only UI (sidebar, guard, course form modal)
context/                   AuthContext, ThemeContext
lib/api.js                 Axios instance with JWT auto-attach
```

## Auth
JWT stored in `localStorage` (`skillsprint_token`), attached to every request via an Axios interceptor. `AuthContext` restores the session on load via `GET /api/auth/me`.

## Payments (Waafi)
`components/PaymentModal.jsx` collects a mobile wallet number and calls
`POST /api/enrollments/purchase`. The backend charges synchronously via
WaafiPay and returns success/failure directly — the modal shows a live
"waiting for approval on your phone" state, then either an unlock
confirmation or the exact decline reason from Waafi (e.g. insufficient
balance) so the student can retry.

## Video protection
The player never receives a raw YouTube URL. It requests a short-lived
token from `POST /api/courses/:courseId/lessons/:lessonId/token`, then
loads `<backend origin>/api/stream/:token` in an iframe — the backend
redeems the token server-side and 302-redirects to the actual embed.
See the backend README for the honest limitation here (devtools Network
tab can still reveal the URL mid-playback, as with any YouTube embed).

## Uploading videos from a computer
In the admin course form (`components/admin/CourseFormModal.jsx`), each
lesson has both a "YouTube unlisted URL" field and an "Upload video from
computer" button. The upload button posts the file to
`POST /api/admin/videos/upload` with live progress, and auto-fills the
URL field once the backend finishes pushing it to YouTube — no separate
step needed. Requires the backend's YouTube setup (see its README); if
that's not configured yet, the upload button shows a clear error and the
URL field can still be filled in manually as before.

## Site CMS
`/admin/cms` covers hero content, the announcement bar, banner image,
contact info, social links, footer copyright text, homepage stats (e.g.
"500+ Students"), and the sitewide discount — all editable without a
deploy. The public `Footer` component and homepage stats bar pull this
live from `GET /api/settings` and hide any section left blank, so an
empty CMS doesn't produce broken-looking gaps.

## Deploying to Vercel
1. Push this project to a GitHub repo.
2. Import it in Vercel, framework preset "Next.js" (auto-detected).
3. Set `NEXT_PUBLIC_API_URL` in Vercel's Environment Variables to your deployed backend's URL (e.g. Render), including the `/api` suffix.
4. Deploy. Update the backend's `CLIENT_URL` env var to your Vercel domain so CORS allows it.

## Known placeholders / next steps
- New-course cover images are uploaded right after course creation (the
  backend requires a cover URL to create the course, so a placeholder is
  sent first, then replaced) — works, but a single combined create+upload
  endpoint would be smoother if you want to revisit it later.
- No image optimization via `next/image` — plain `<img>` tags are used
  throughout so Supabase Storage URLs don't need domain allow-listing; fine for
  launch, easy to swap in later if you want automatic resizing.
