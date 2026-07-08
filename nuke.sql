-- ============================================================
-- IPDS — NUKE EVERYTHING
-- Run this in Supabase SQL Editor to completely wipe the DB
-- ============================================================

-- ⚠️  WARNING: This DELETES ALL DATA AND STRUCTURE  ⚠️
-- ============================================================

-- Storage policies (must drop before tables)
drop policy if exists "Public read project-images" on storage.objects;
drop policy if exists "Public read site-updates" on storage.objects;
drop policy if exists "Auth upload project-images" on storage.objects;
drop policy if exists "Auth upload site-updates" on storage.objects;
drop policy if exists "Auth delete project-images" on storage.objects;
drop policy if exists "Auth delete site-updates" on storage.objects;

-- Tables (order matters due to foreign keys)
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS project_auth CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- ============================================================
-- DONE — DB is now empty
-- ============================================================
