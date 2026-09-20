# SkillSprint Backend

Express + MongoDB (Mongoose) + JWT + Supabase Storage + WaafiPay API backend for the SkillSprint LMS.

## Stack
- Node.js / Express
- MongoDB Atlas (Mongoose)
- JWT auth (bcrypt-hashed passwords)
- Supabase Storage (avatars, course covers, CMS banner) — public bucket, auto-created on first server boot
- WaafiPay `API_PURCHASE` (mobile wallet payments) — auto-enrolls the student on success
- Video protection: raw YouTube URLs are **never** returned in any JSON API response.
  A short-lived signed token is issued instead; redeeming it (`GET /api/stream/:token`)
  302-redirects the browser straight to the YouTube embed, checking enrollment again
  at redemption time.

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, Supabase keys
                        # (Waafi sandbox keys are already pre-filled in .env,
                        # payments run in mock mode by default)
npm run seed:admin -- --name "Admin" --email admin@skillsprint.com --password ChangeMe123!
npm run dev
```

Server runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

## Environment variables

See `.env.example`. Notable ones:
- `WAAFI_BASE_URL` — `http://sandbox.waafipay.net/asm` for testing, `https://api.waafipay.com/asm` for production. **Switch this before going live.**
- `STREAM_TOKEN_TTL_SECONDS` — how long a video access token is valid before the iframe must re-request one (default 60s).

## Setting up Supabase Storage

1. Create a free project at [supabase.com](https://supabase.com).
2. In the project dashboard, go to **Project Settings → API**. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **`service_role` secret key** (not the `anon` key — that one can't write files) → `SUPABASE_SERVICE_ROLE_KEY`
3. That's it — no manual bucket creation needed. On first boot, the server
   checks for a bucket named `skillsprint` (or whatever `SUPABASE_BUCKET`
   is set to) and creates it as **public** if it doesn't exist yet, so
   uploaded avatars/covers/banners are viewable without extra auth.
4. If bucket auto-creation ever fails (e.g. a very restrictive project
   policy), the server logs a warning at startup — just create a public
   bucket with that name manually in **Storage** in the dashboard.

The `service_role` key can read/write/delete any file in the project, so
keep it in `.env` only — it must never reach the frontend.

## Uploading videos from a computer

Admins can either paste a YouTube unlisted link (as before) **or** upload a
video file straight from their computer — the backend uploads it to
YouTube automatically (as unlisted) and fills in the link for them. This
needs a one-time setup connecting the app to a YouTube channel:

**1. Create Google Cloud OAuth credentials**
1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a new project (or use an existing one).
2. Go to **APIs & Services → Library**, search **YouTube Data API v3**, click **Enable**.
3. Go to **APIs & Services → OAuth consent screen**. Choose **External**, fill in the required fields (app name, your email). Under **Test users**, add the Google account that owns the YouTube channel you'll upload course videos to. (Staying in "Testing" mode is fine — no Google review needed for personal/internal use.)
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**. Application type: **Desktop app**. Copy the **Client ID** and **Client Secret**.

**2. Add them to `backend/.env`:**
```bash
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
```

**3. Get a refresh token (run this once, on your own computer):**
```bash
npm run youtube:auth
```
This opens a small local server and prints a Google login link — open it,
log in with the account from step 1.3, approve access, and the script
prints a `YOUTUBE_REFRESH_TOKEN` line to copy into `.env`.

**4. Restart the backend.** Video file uploads now work from the admin
course form ("Upload video from computer" next to the YouTube URL field).

**Without this set up**, video uploads return a clear error telling the
admin what's missing — the rest of the site works fine either way, since
pasting a YouTube link directly still works exactly as before.

**Practical limits to know about:**
- YouTube itself has no meaningful storage cap for this use case, so this
  solves the "will I run out of space" problem that direct file storage has.
- Large uploads take real time and bandwidth — a 500MB lecture recording
  on a slow connection can take several minutes. The upload button shows
  live progress.
- **Hosting timeouts matter here.** This server's own timeout is raised
  to 15 minutes for uploads, but many hosts (Render's free tier
  especially) impose their own shorter proxy/request timeout that this
  app can't override. If large uploads fail on your host, either upgrade
  to a plan with longer timeouts, or ask admins to keep individual video
  files under ~200MB (compress with something like HandBrake first).

## Important: video protection caveat

"Never expose the raw URL" is implemented as: the URL never appears in any JSON
response, is never stored in frontend state, and is never in the course
catalog/detail payloads. It is only ever sent once, server-side, as an HTTP
redirect `Location` header when a valid short-lived token is redeemed — so it
can't be lifted from the API or React devtools. A user who opens browser
devtools' Network tab while the video is actually playing can still see the
redirected YouTube URL (this is true of literally any YouTube-based player,
including the original spec's "Unlisted" approach) — for airtight DRM you'd
need a provider like Cloudflare Stream or Vimeo Pro with signed, domain-locked
embeds instead of YouTube.

## Auth model
- `POST /api/auth/register` → learner account by default
- `POST /api/auth/login`
- All protected routes: `Authorization: Bearer <token>`
- Roles: `learner`, `admin` (create additional admins by editing a user's role
  directly in MongoDB, or extend `seedAdmin.js`)

## API Reference

### Auth
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | Public | `{ name, email, password, phoneNumber? }` |
| POST | `/api/auth/login` | Public | `{ email, password }` |
| GET | `/api/auth/me` | Auth | current user |

### Users
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| PUT | `/api/users/profile` | Auth | `{ name?, bio?, phoneNumber?, targetSkills?, password? }` |
| PUT | `/api/users/avatar` | Auth | multipart, field `avatar` |

### Courses
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/courses?search=&category=&sort=price_asc\|price_desc` | Public | catalog, computed `effectivePrice` |
| GET | `/api/courses/:id` | Public (optional auth) | includes `isEnrolled` if logged in |
| POST | `/api/courses/:courseId/lessons/:lessonId/token` | Public/Auth | issues stream token (auth required unless `isPreviewFree`) |
| GET | `/api/courses/:id/admin` | Admin | includes raw `videoUrl` for editing |
| POST | `/api/courses` | Admin | create; `lessons: [{ title, videoUrl, duration, isPreviewFree }]` |
| PUT | `/api/courses/:id` | Admin | update any field incl. `price`, `discountPercent`, `discountActive` |
| DELETE | `/api/courses/:id` | Admin | |
| POST | `/api/courses/:id/cover` | Admin | multipart, field `cover` |

### Video streaming
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/stream/:token` | Public (token-gated) | 302 redirect to YouTube embed |

### Enrollments (Waafi payments)
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/enrollments/purchase` | Learner | `{ courseId, accountNo? }` — charges via Waafi, auto-enrolls on success |
| GET | `/api/enrollments/mine` | Learner | my active enrollments |
| GET | `/api/enrollments` | Admin | all enrollments (dashboard table) |
| PUT | `/api/enrollments/:id/revoke` | Admin | `{ reason?, refund? }` — refund attempts a Waafi reversal |

### Admin
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/admin/analytics` | Admin | revenue, active students, enrolled courses, pending... |
| GET | `/api/admin/users` | Admin | |
| GET / PUT | `/api/admin/settings` | Admin | hero title/subtitle, announcement bar |
| POST | `/api/admin/settings/banner` | Admin | multipart, field `banner` |
| PUT | `/api/admin/settings/discount` | Admin | `{ active, percent, label }` — sitewide discount |

### Public settings (for homepage CMS)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/settings` | Public |

## Pricing & discounts
- Every course has a base `price` (admin-set "salary") plus an optional
  per-course `discountPercent` + `discountActive` flag.
- `Settings.globalDiscount` lets the admin run a sitewide sale.
- Effective price rule: **a course's own active discount always overrides the
  global discount**; otherwise the global discount applies if active;
  otherwise full price.

## Payments (WaafiPay) — mock mode by default

`PAYMENT_MODE` in `.env` controls which payment provider is used:

- **`mock` (default)** — no real money moves, no network calls to WaafiPay.
  `services/mockPaymentService.js` runs the same validation the real
  gateway would (valid phone format, valid amount) and simulates an
  async charge with a short delay, so the frontend's "waiting for
  approval on your phone" state behaves identically to production.
  Useful test numbers (based on the phone number's last 4 digits, after
  normalization):
  - ends in `0000` → declines with "Insufficient balance in wallet"
  - ends in `1111` → declines with "Payment was not confirmed on the phone in time"
  - ends in `2222` → declines with "No wallet account found for this number"
  - anything else → approves instantly
- **`live`** — real WaafiPay `API_PURCHASE`/`API_REVERSAL` calls using the
  credentials in `.env`. Switch to this (and to production Waafi
  credentials + `WAAFI_BASE_URL=https://api.waafipay.com/asm`) before
  taking real payments.

Both providers share the same interface (`services/paymentService.js` is
the single import point the rest of the app uses), so switching modes
requires no code changes — just the env var.

In `live` mode: `POST /api/enrollments/purchase` calls WaafiPay's
`API_PURCHASE` synchronously (the customer approves via a USSD/PIN prompt
on their phone, and the call returns success/failure directly — no
webhook needed). In both modes: on success an `Enrollment` is created
immediately with `status: "approved"` (no manual admin review step);
on decline, the endpoint returns `402` with the provider's message so
the frontend can show it and let the student retry. Admin can `revoke`
an enrollment and optionally trigger a reversal via `PUT
/api/enrollments/:id/revoke` (works in both modes).



## Not yet wired (frontend milestone)
This delivers the backend only, per your request. Next step is the React
(Vercel) frontend consuming these endpoints — happy to start on that next.
