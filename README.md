<div align="center">

# IPDS

**Modern ArchViz Showcase & Real Estate Redevelopment Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Proprietary_/_All_Rights_Reserved-red?style=for-the-badge)](./LICENSE)

<br />

A Next.js 14 showcase platform for **IPDS**, a Pune-based self-redevelopment consultancy. Features a public portfolio with project galleries, uncropped hero showcases, live updates, rich formatted story narratives, and a full-featured executive admin panel with Supabase backend.

### Admin password toggle

The admin dashboard includes a **Require admin password** switch. Protection is on by default. Turning it off allows anyone with the `/admin` link to enter and edit the panel. The choice is saved in the existing Supabase `site_content` table and applies across browsers and visits; no schema migration is needed. Configure `ADMIN_PASSWORD_HASH` (or `ADMIN_PASSWORD` for local development) before turning protection back on. Missing settings or database read errors keep password protection enabled.

</div>

---

## Features

### Public Site
- **Project Portfolio** — Ongoing and key projects with full details and story narratives
- **Project Pages** — Individual project pages with uncropped ultra-wide hero banner, transparent vignette fade, auto-scrolling gallery filmstrip, and short & long descriptions
- **Brochure & RERA Downloads** — Conditional download buttons for project PDF/Image brochures and RERA registration codes/QR certificates
- **Rich Text Formatting** — Live rendering of custom bold, italic, underline, font scaling, and color accents (Gold, Cyan, Emerald, Rose)
- **Transformation Showcase** — Before/after stages with media
- **Video Showcase** — YouTube embeds and uploaded videos
- **Testimonials** — Client feedback carousel
- **Dark Mode** — Theme-aware with `next-themes` and header theme toggle
- **Responsive Design** — Mobile-first Tailwind layout

### Admin Panel (`/admin`)
- **Password-protected** — Secure cookie-based authentication
- **Dashboard Overview** — Executive stat cards with NumberTicker animations, interactive project traffic distribution, and recent lead log
- **Unified 1-Click Save** — Top action bar save button syncing metadata, story text, brochure/RERA compliance, and gallery across all tabs
- **Interactive Drag-and-Drop** — Batch file uploader for gallery images and project thumbnails with live status tracking
- **Story & Narrative Workspace** — Consolidated Short Description and Long Description tab with rich formatting toolbars (B, I, U, font size, color presets)
- **Brochure & RERA Compliance** — Dedicated drag-and-drop dropzones for project brochures and RERA registration documents
- **Custom Glassmorphic Dropdowns** — Custom animated select components with Framer Motion and click-outside listeners
- **Animated Pill Navigation** — Framer Motion sliding pill tab indicator (`layoutId="activeTabPill"`)
- **Projects Management** — Create/edit/delete projects, drag-and-drop reordering for "Ongoing" and "Key" categories
- **Content Management** — Hero image, settings, intro, stats, videos, testimonials, transformation stages, contact details
- **Project Sharing** — Secure token-based share links for private projects

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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_PASSWORD_HASH=
```

---

## License

**Proprietary & Confidential — All Rights Reserved**

Copyright © 2024–2026 IPDS & Veil. No individual or organization is permitted to copy, reproduce, distribute, extract, or use any code, images, schemas, or media from this repository without prior written consent. See [`LICENSE`](./LICENSE) for full legal terms.

---

<p align="center">
  Built with 💙 Made by <a href="https://venusapp.in/">Veil</a>
</p>
