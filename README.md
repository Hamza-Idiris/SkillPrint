<div align="center">

  <h1>⚡ SkillSprint — Full-Stack Learning Management System</h1>
  <p><b>A modern, high-performance LMS built with Next.js 14, Express, MongoDB Atlas, Supabase Storage, and WaafiPay Payment Integration.</b></p>

  <p>
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-database-seeding">Database Seeding</a> •
    <a href="#-environment-variables">Environment Variables</a> •
    <a href="#-deployment">Deployment</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 14" />
    <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </p>
</div>

---

## 🚀 Key Features

### 🎓 Student & Learning Experience
- 🔍 **Interactive Course Discovery**: Instant search, category filters, and price sorting (Ascending / Descending).
- 🏷️ **Course & Sitewide Discounts**: Dynamic calculation of course-level discounts (e.g. `-30% OFF`) and global promo sales with strike-through pricing.
- 📺 **Gated Video Player**: Secure streaming interface for lessons. Video sources (YouTube/Cloud) are protected server-side with video stream tokens.
- 🔓 **Free Lesson Previews**: Students can preview selected free lessons before purchasing.
- 📱 **Fully Responsive UI**: Mobile-first design crafted with Tailwind CSS, Framer Motion animations, and dark/light theme options.
- 👤 **Student Profile & Dashboard**: Track enrolled courses, update personal details, target skills, and upload custom avatars.

### 💳 Payments & Checkout
- 💸 **Dual Payment Modes**:
  - **Mock Payment Mode (Default)**: Zero network calls, perfect for instant testing, demos, and local development.
  - **WaafiPay Gateway Integration**: Live mobile money transactions via API purchase/reversal.
- ⌛ **Expiration & Access Tracking**: Automatic course subscription access control.

### 🛠️ Powerful Admin Suite & CMS
- 📊 **Analytics Dashboard**: Real-time stats on total revenue, student enrollment, active courses, expiring subscriptions, and revenue charts.
- 🎨 **No-Code Site CMS**: Live editor for website announcement banners, hero section copy, contact details, social links, stats counters, and site footer.
- 📚 **Course Management**: Complete CRUD operations for courses, module lessons, prices, discounts, and custom cover images.
- 🖼️ **Resilient Storage Architecture**: Integrated with **Supabase Storage** for cloud asset hosting with automatic **Local Disk Storage Fallback** if cloud endpoints are unconfigured or offline.
- 🎥 **YouTube Video Upload Integration**: Direct video file uploads to YouTube as unlisted videos straight from the admin dashboard via OAuth 2.0.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router & Server/Client Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Design Tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose ORM](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies / Auth headers & Bcrypt password hashing
- **File & Media Storage**: [Supabase Storage](https://supabase.com/storage) + Express Static Local Fallback
- **Payments**: WaafiPay API (Sandbox & Production) + Mock Payment Engine
- **Video API**: Google YouTube Data API v3

---

## 📁 Repository Architecture

```text
skillsprint-fullstack/
├── backend/                  # Express REST API Server
│   ├── config/               # Database, Supabase & YouTube configurations
│   ├── controllers/          # Business logic handlers (auth, courses, admin, payments)
│   ├── middleware/           # JWT Auth, Admin verification, Multer uploaders
│   ├── models/               # Mongoose Schemas (User, Course, Enrollment, Settings)
│   ├── routes/               # API Endpoint routes
│   ├── services/             # Storage, Payment (Mock & WaafiPay), YouTube services
│   ├── uploads/              # Local fallback directory for user uploads
│   └── utils/                # Seeder scripts & token utilities
│
└── frontend/                 # Next.js 14 Web Application
    ├── app/                  # Next.js App Router pages (admin, courses, profile, etc.)
    ├── components/           # Reusable UI components & Modals
    ├── context/              # React Context Providers (AuthContext, ThemeContext)
    └── lib/                  # Axios API client setup & helpers
```

---

## 💻 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **MongoDB Atlas Connection URI** (or local MongoDB database)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Hamza-Idiris/SkillPrint.git
cd SkillPrint
```

---

### Step 2: Configure & Start Backend

1. Navigate into `backend` and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your values (or use defaults for mock payments & local storage):
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skillsprint?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   PAYMENT_MODE=mock
   ```

4. Seed the database with sample courses & admin account (see below for details):
   ```bash
   npm run seed:admin
   npm run seed:courses
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   # API running at http://localhost:5000
   ```

---

### Step 3: Configure & Start Frontend

1. Open a new terminal, navigate into `frontend` and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create your `.env.local` configuration file:
   ```bash
   cp .env.local.example .env.local
   ```

3. Ensure `.env.local` points to your running backend API:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start the frontend Next.js development server:
   ```bash
   npm run dev
   # Web app running at http://localhost:3000
   ```

---

##  🌱 Database Seeding

SkillSprint comes with automated seed scripts to quickly populate your database with realistic content.

### Seed Admin User
```bash
# Seeding default admin account (admin@skillsprint.local / ChangeMe123!)
npm run seed:admin

# Or with custom credentials:
npm run seed:admin -- --name "Master Admin" --email admin@example.com --password MySecretPassword123!
```

### Seed 10 Full Sample Courses (Includes 3 Discounted Courses)
```bash
npm run seed:courses
```
This seeds 10 distinct, high-quality courses across **Web Development, AI & Machine Learning, Mobile Apps, UI/UX Design, DevOps, Cybersecurity, Data Science, TypeScript, and Graphic Design**.

#### Sample Discounted Courses Created:
- 🎨 **UI/UX Design Essentials**: ~~$79.99~~ → **$47.99** (`40% OFF`)
- 🤖 **Python & AI Engineering Masterclass**: ~~$149.99~~ → **$112.49** (`25% OFF`)
- 💻 **Full-Stack Web Development Bootcamp**: ~~$99.99~~ → **$69.99** (`30% OFF`)

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | API server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `MONGO_URI` | MongoDB Atlas Connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_secret_key` |
| `JWT_EXPIRES_IN` | Token expiration lifespan | `7d` |
| `PAYMENT_MODE` | Payment mode (`mock` or `live`) | `mock` |
| `SUPABASE_URL` | Supabase Cloud Storage URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | `eyJ...` |
| `SUPABASE_BUCKET` | Storage bucket name | `skillsprint` |
| `WAAFI_BASE_URL` | WaafiPay API Endpoint | `http://sandbox.waafipay.net/asm` |

---

## 🌐 Production Deployment Guide

| Component | Recommended Hosting | Configuration Notes |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | Set environment variable `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api` |
| **Backend** | [Render](https://render.com/) / [Railway](https://railway.app/) | Deploy `backend/` directory, set all `.env` variables, and set `CLIENT_URL` to Vercel domain |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) | Free M0 Cluster or Dedicated Tier |
| **Media Storage** | [Supabase Storage](https://supabase.com/) | Create a public bucket `skillsprint` or rely on local disk fallback |

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!  
This project is licensed under the **MIT License**.

---

<div align="center">
  <sub>Built with ❤️ by the SkillSprint Team.</sub>
</div>
