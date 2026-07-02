# IPDS — Ideal Property Development Services

A Next.js 14 site for IPDS, a Pune-based redevelopment firm. Features a public showcase, project portfolio, and admin panel with Supabase backend.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **CMS/Database:** Supabase (PostgreSQL)
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `ADMIN_PASSWORD` | Admin panel password |
| `ADMIN_PASSWORD_HASH` | (optional) SHA-256 hash of admin password |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/            — Next.js App Router pages
components/    — React components
lib/           — Utilities and Supabase client
public/        — Static assets
styles/        — Global styles
schema.sql     — Database schema with seed data
```

## Database

Run `schema.sql` in Supabase SQL Editor to create all tables and seed data.
