# SkillSprint — Full Stack

```
skillsprint-fullstack/
  backend/    Express + MongoDB API (see backend/README.md)
  frontend/   Next.js app (see frontend/README.md)
```

## Quick start (local dev)

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, Supabase keys
                           # (Waafi sandbox keys are already pre-filled)
npm run seed:admin -- --name "Admin" --email admin@skillsprint.com --password ChangeMe123!
npm run dev                # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev                # http://localhost:3000
```

## What's in this build

- **Video lessons**: admins can either paste a YouTube unlisted link, or
  upload a video file straight from their computer — the backend pushes
  it to YouTube automatically as unlisted. See `backend/README.md` →
  "Uploading videos from a computer" for the one-time setup
  (`npm run youtube:auth`). Without that setup, pasting a link still
  works exactly as before.
- **Site CMS**: hero title/subtitle, announcement bar, banner image,
  contact email/phone/address, social links (Facebook/Instagram/X/WhatsApp),
  footer copyright text, and a homepage stats bar (e.g. "500+ Students")
  are all editable from `/admin/cms` — no code changes needed to update them.
- **Payments**: mock mode by default (see below), real WaafiPay ready to
  switch on when you're live.
- **Storage**: Supabase Storage for images (avatars, course covers, banner).

## Payments are currently in mock mode

`backend/.env` has `PAYMENT_MODE=mock` — enrollments go through full
validation and a realistic approve/decline flow, but no real money moves
and no calls reach WaafiPay. This is the right setting for development,
demos, and showing this to people before launch. Switch to
`PAYMENT_MODE=live` (with production Waafi credentials) only when you're
ready to take real payments — see `backend/README.md` for the test
phone numbers that trigger different mock outcomes.

## Hosting: is Atlas free + Vercel free enough?

**MongoDB Atlas (free M0 cluster) — yes, this is fine.** 512 MB storage,
shared RAM/vCPU, no time limit. SkillSprint's data (users, courses,
enrollments) is small text — images live in Supabase Storage, not Mongo — so
you won't hit the storage ceiling until real scale. The only real
tradeoff: no automated backups on the free tier.

**Vercel (free Hobby plan) — technically no, once you take real payments.**
Vercel's Hobby tier is contractually restricted to personal,
non-commercial projects. A site charging via Waafi is commercial, so a
real launch needs **Vercel Pro ($20/month/seat)**. Hobby is genuinely
fine while you're building and testing, though — no time limit, no
credit card needed, same infrastructure.

**One more thing worth planning for: the backend.** This repo doesn't
deploy to Vercel (Vercel doesn't run long-lived Express servers well) —
you'd host `backend/` on something like Render, Railway, or Fly.io.
Render's free tier spins the server down after ~15 min idle, so a
student's first request after a quiet period can be slow or time out —
fine for a demo, risky once you're taking real payments. Render's
cheapest paid tier (~$7/month) removes that.

**Realistic budget for a live launch:** Atlas free + Render ~$7/mo +
Vercel Pro $20/mo ≈ **$27/month**. Free-free-free is fine for
development, testing, and showing people a demo.

## Deployment order
1. Deploy `backend/` to Render (or similar). Set its env vars, get its URL.
2. Deploy `frontend/` to Vercel. Set `NEXT_PUBLIC_API_URL` to the backend URL + `/api`.
3. Update the backend's `CLIENT_URL` env var to the Vercel domain (for CORS).
4. Switch `WAAFI_BASE_URL` in the backend from sandbox to production, and get fresh Waafi production credentials before taking real payments.
