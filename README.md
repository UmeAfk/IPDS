# IPDS — Ideal Property Development Services

![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-2-3FCF8E?logo=supabase)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?logo=framer)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green)

A Next.js 14 showcase site for **IPDS**, a Pune-based self-redevelopment consultancy. Features a public portfolio with project galleries, live updates, and a full-featured admin panel with Supabase backend.

---

## Features

### Public Site
- **Project Portfolio** — Ongoing and key projects with full details
- **Project Pages** — Individual project pages with galleries, narrative sections, live video updates
- **Transformation Showcase** — Before/after stages with media
- **Video Showcase** — YouTube embeds and uploaded videos
- **Testimonials** — Client feedback carousel
- **Dark Mode** — Theme-aware with `next-themes`
- **Responsive Design** — Mobile-first Tailwind layout

### Admin Panel (`/admin`)
- **Password-protected** — Secure cookie-based authentication
- **Dashboard** — Visitor stats, enquiry management, CSV export
- **Projects Management** — Create/edit/delete projects, drag-and-drop reorder with separate "Ongoing" and "Key" sections
- **Content Management** — Hero image, settings, intro, stats, videos, testimonials, transformation stages, contact details
- **Project Sharing** — Secure token-based share links for private projects
- **Font Customization** — Display, body, and monospace font selection
- **Live Updates** — Add video/image updates to projects

### Security
- Cookie-based admin auth with SHA-256 password hash
- Rate-limited login attempts
- Secure share links with expiring tokens
- Private project content protected behind OTP/password

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS with `tailwindcss-animate` |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage (project images, site updates) |
| **Animations** | Framer Motion, Anime.js |
| **Icons** | Lucide React |
| **Email** | Resend |
| **Auth** | Cookie-based (SHA-256 hashed password) |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Resend API key (for email)

### Installation

```bash
git clone <repo-url>
cd ipds
npm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local`:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon public key |
| `ADMIN_PASSWORD` | Dev | Admin password (plain text, local dev) |
| `ADMIN_PASSWORD_HASH` | Production | SHA-256 hex of admin password |
| `RESEND_API_KEY` | No | Resend API key for contact form email |

To generate a password hash:

```bash
node -e "const {createHash}=require('crypto'); console.log(createHash('sha256').update('YourPasswordHere').digest('hex'))"
```

### Database Setup

1. Run `nuke.sql` in your Supabase SQL Editor to clean the database
2. Run `schema.sql` to create all tables, storage buckets, indexes, and seed data

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
Admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run dev:clean` | Clean `.next` cache and start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
ipds/
├── app/
│   ├── (site)/              # Public pages
│   │   └── page.tsx         # Homepage (server component)
│   ├── admin/               # Admin login + dashboard
│   │   ├── page.tsx         # Auth gate + redirect
│   │   └── layout.tsx
│   ├── p/                   # Private project pages (token access)
│   ├── projects/            # Public project detail pages
│   └── api/
│       ├── admin-auth/      # Login endpoint
│       ├── admin-check/     # Session check
│       ├── admin-logout/    # Logout endpoint
│       ├── send-email/      # Contact form email
│       ├── send-otp/        # OTP generation
│       └── projects/        # Project API (by slug)
├── components/
│   ├── admin/               # Admin dashboard components
│   │   ├── AdminDashboard.tsx
│   │   ├── ContentTab.tsx
│   │   └── EditProjectModal.tsx
│   ├── Hero.tsx
│   ├── Navbar.tsx
│   ├── FeaturedProjects.tsx
│   ├── OngoingProjects.tsx
│   ├── AboutIntro.tsx
│   ├── ServicesCards.tsx
│   ├── Achievements.tsx
│   ├── TransformationShowcase.tsx
│   ├── VideoShowcase.tsx
│   ├── Testimonials.tsx
│   ├── Contact.tsx
│   ├── Footer.tsx
│   └── FontApplier.tsx
├── lib/
│   ├── supabase.ts          # Supabase client + all data functions
│   └── slugify.ts           # URL slug utility
├── styles/
│   └── globals.css          # Tailwind + custom styles
├── nuke.sql                 # Drop everything (run first)
├── schema.sql               # Full database schema + seed data
└── .env.local.example
```

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `projects` | All projects with metadata, gallery, narrative |
| `project_auth` | OTP/password/token access control |
| `site_content` | All CMS content (hero, settings, intro, stats, testimonials, videos, transformation, contact) |
| `visitors` | Page view tracking |
| `enquiries` | Contact form submissions |

### Storage Buckets

| Bucket | Purpose |
|---|---|
| `project-images` | Project gallery images and thumbnails |
| `site-updates` | Hero images, video thumbnails, transformation media |

---

## Admin Panel

Access at `/admin`. Features:

- **Overview tab** — Visitor statistics, visitor count per project
- **Visitors tab** — Detailed visitor log with CSV export
- **Projects tab** — Split into "Ongoing Projects" and "Key Projects" with drag-and-drop reordering, edit, hide/show, copy secure share links
- **Enquiries tab** — Contact form submissions with CSV export
- **Content tab** — Edit hero image URL, testimonials, stats, transformation stages, videos, contact details, meta description, fonts

### Drag-and-Drop Reordering

Projects can be reordered by dragging cards within their section. Sort order is stored in the `sort_order` column with category-based offsets:

- **Ongoing projects**: `sort_order` 0–999
- **Key projects**: `sort_order` 1000–1999

This ensures both categories maintain independent ordering without collisions.

---

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD_HASH` (SHA-256 of admin password)
4. Deploy

### Required Vercel Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_PASSWORD_HASH=sha256hex...
```

---

## License

MIT
