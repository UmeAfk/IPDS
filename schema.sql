-- ============================================================
-- IPDS — Full Database Schema
-- Run this in Supabase SQL Editor to reset and recreate all tables
-- ============================================================

-- ── Projects Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  long_description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  image_url_dark TEXT DEFAULT '',
  image_url_light TEXT DEFAULT '',
  stream_url TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Residential',
  location TEXT DEFAULT '',
  year TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  access_type TEXT DEFAULT 'public',
  access_password TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  category TEXT DEFAULT 'key',
  story TEXT DEFAULT '',
  has_live_updates BOOLEAN DEFAULT false,
  narrative_sections JSONB DEFAULT '[]',
  gallery_updates JSONB DEFAULT '[]',
  brochure_url TEXT DEFAULT '',
  rera_url TEXT DEFAULT '',
  show_brochure BOOLEAN DEFAULT false,
  show_rera BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Project Auth Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_auth (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT,
  code TEXT,
  token TEXT,
  expires_at TIMESTAMPTZ,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Site Content Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  body TEXT,
  media_url TEXT,
  media_type TEXT,
  thumbnail_url TEXT,
  author_name TEXT,
  author_role TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Visitors Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  contact TEXT,
  project TEXT,
  project_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- ── Enquiries Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  contact TEXT,
  project TEXT,
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_active ON site_content(is_active);
CREATE INDEX IF NOT EXISTS idx_site_content_sort ON site_content(sort_order);
CREATE INDEX IF NOT EXISTS idx_project_auth_token ON project_auth(token);
CREATE INDEX IF NOT EXISTS idx_visitors_timestamp ON visitors(timestamp);
CREATE INDEX IF NOT EXISTS idx_enquiries_timestamp ON enquiries(timestamp);

-- ============================================================
-- SEED DATA — Introductory Content
-- ============================================================

-- Intro
INSERT INTO site_content (section, title, body, sort_order, is_active) VALUES
('intro', 'Redefining Redevelopment', 'IPDS helps societies become their own developer, while providing the technical, legal, financial, and project management expertise required to successfully execute a redevelopment project.', 0, true);

-- Stats
INSERT INTO site_content (section, title, subtitle, sort_order, is_active) VALUES
('stats', 'Projects Delivered', '50+', 0, true),
('stats', 'Happy Clients', '100+', 1, true),
('stats', 'Years of Excellence', '8+', 2, true),
('stats', 'Projects in Pipeline', '150+', 3, true);

-- Testimonials
INSERT INTO site_content (section, author_name, author_role, body, sort_order, is_active) VALUES
('testimonial', 'Ramesh Patil', 'Secretary, Jyoti Villa CHS', 'IPDS guided us through every step of our society redevelopment. The transparency and execution quality were outstanding.', 0, true),
('testimonial', 'Sunita Desai', 'Chairman, Shree Sadhana Society', 'We had zero experience with redevelopment. IPDS made it seamless — from legal clarity to final handover.', 1, true),
('testimonial', 'Anil Joshi', 'Member, Prasad Apartment', 'The team at IPDS truly understands what society members need. They turned our old building into a dream home.', 2, true);

-- Transformation stages
INSERT INTO site_content (section, title, body, media_url, sort_order, is_active) VALUES
('transformation', 'Pune''s 1st Self Redevelopment Hemanti Transformation', 'Old Building', '/images/Old Building.png', 0, true),
('transformation', NULL, 'Design Stage', '/images/Design Stage.png', 1, true),
('transformation', NULL, 'Executed Without Differing to Design', '/images/Executed Without Differeing to design.png', 2, true);

-- ============================================================
-- SEED DATA — Key Projects (Portfolio)
-- ============================================================

INSERT INTO projects (title, description, location, long_description, image_url, type, category, status, sort_order, is_active) VALUES
('State Bank Nagar', 'Residential project in Kothrud, Pune with 1500 residential units.', 'Kothrud, Pune', 'State Bank Nagar, Alkapuri Society, Kothrud, Pune, Maharashtra 411038 (DIGIPIN: 4FP-4CK-PL63). A large-scale residential redevelopment project featuring 1500 residential units in the heart of Kothrud.', '/images/JyotiVilla.jpg', 'Residential', 'key', 'published', 0, true),
('Affordable Housing for Gujarat Housing Board', 'Affordable housing project in Sola-Gota, Ahmedabad, Gujarat.', 'Ahmedabad, Gujarat', 'Construction of 124 Shops at Sola & 12 at Gota: Construction of multistoried RCC framed structure residential flats including all infrastructure work at Sola-Gota, Ahmedabad, Gujarat.', '/images/ShreeSadhna.jpg', 'Residential', 'key', 'published', 1, true),
('Abhiruchi Mall & Multiplex', 'Commercial mall and multiplex on Sinhagad Road, Pune.', 'Sinhagad Road, Pune', 'S.No. 59 1C, Sinhgad Rd, Bhide Baug, Wadgaon Budruk, Vadgaon Budruk, Pune, Maharashtra 411041. A commercial mall and multiplex development on Sinhagad Road.', '/images/JyotiVillaNight.jpg', 'Commercial', 'key', 'published', 2, true),
('Vision One', 'Commercial project in Tathawade, Pune near Wakad.', 'Tathawade, Pune', 'Bhumkar Chowk Rd, near GINGER PUNE, Wakad, Pune, Pimpri-Chinchwad, Maharashtra 411033. A commercial project in the rapidly growing Tathawade-Wakad corridor.', '/images/ShreeSadhnaNight.jpg', 'Commercial', 'key', 'published', 3, true),
('Kapil Zenith IT Complex', 'IT complex in Bavdhan, Pune.', 'Bavdhan, Pune', 'Vaidehi Enclave, Bavdhan, Pune, Maharashtra 411021. An IT complex in the Bavdhan area of Pune.', '/images/JyotiVilla.jpg', 'Commercial', 'key', 'published', 4, true),
('Maharshi Karve Stree Shikshan Sanstha', 'Institutional campus in Ambegaon, Pune for women''s education.', 'Ambegaon, Pune', 'Sr. 13/1/2, Narhe-Ambegaon, Opposite Vision English Medium School, Pune - 411041. An educational institutional campus for Maharshi Karve Stree Shikshan Sanstha.', '/images/ShreeSadhna.jpg', 'Institutional', 'key', 'published', 5, true),
('Abhinav School Extension', 'School extension in Erandawane, Pune.', 'Erandawane, Pune', '102/103, Off Paud Phata Road, behind Dashbhuja Ganapati Temple, Bharatkunj - 2, Erandwane, Pune, Maharashtra 411038. Extension of Abhinav School in Erandawane.', '/images/JyotiVillaNight.jpg', 'Institutional', 'key', 'published', 6, true),
('Huzurpaga Girls Junior College', 'Girls junior college in Narayan Peth, Pune.', 'Narayan Peth, Pune', '9, 68, Laxmi Road, Narayan Peth, Pune, Maharashtra 411030. A girls junior college located on Laxmi Road in the historic Narayan Peth area.', '/images/ShreeSadhnaNight.jpg', 'Institutional', 'key', 'published', 7, true),
('Shreemant Dagadusheth Halwai Ganpati Mandir', 'Renowned Ganpati temple in Budhwar Peth, Pune.', 'Budhwar Peth, Pune', 'Ganpati Bhavan, 250, Chhatrapati Shivaji Maharaj Rd, Mehunpura, Sadashiv Peth, Pune, Maharashtra 411002. The iconic and renowned Shreemant Dagadusheth Halwai Ganpati Mandir in Budhwar Peth.', '/images/JyotiVilla.jpg', 'Temple', 'key', 'published', 8, true);

-- ============================================================
-- SEED DATA — Ongoing Projects
-- ============================================================

INSERT INTO projects (title, description, location, type, category, status, sort_order, is_active) VALUES
('Manoj CHS', 'Housing redevelopment in PCMC.', 'PCMC', 'Residential', 'ongoing', 'published', 0, true),
('Daulat Co-operative Housing Society', 'Housing redevelopment in Kothrud.', 'Kothrud', 'Residential', 'ongoing', 'published', 1, true),
('Dhawalgiri Park CHS', 'Housing redevelopment in Karve Nagar.', 'Karve Nagar', 'Residential', 'ongoing', 'published', 2, true),
('Varadwant CHS', 'Housing redevelopment in Mayur Colony.', 'Mayur Colony', 'Residential', 'ongoing', 'published', 3, true),
('Shree Sadhana Society', 'Premium society redevelopment.', 'Mumbai', 'Residential', 'ongoing', 'published', 4, true),
('Archana Co-operative Housing Society', 'Housing redevelopment in Viman Nagar.', 'Viman Nagar', 'Residential', 'ongoing', 'published', 5, true),
('Jyoti Villa Co-operative Housing Society', 'Housing redevelopment in Kothrud.', 'Kothrud', 'Residential', 'ongoing', 'published', 6, true),
('Tejal Co-operative Housing Society', 'Housing redevelopment in Model Colony.', 'Model Colony', 'Residential', 'ongoing', 'published', 7, true),
('Parinita Co-operative Housing Society', 'Housing redevelopment in Aundh.', 'Aundh', 'Residential', 'ongoing', 'published', 8, true),
('Prasad Apartment', 'Housing redevelopment in Nal-Stop.', 'Nal-Stop', 'Residential', 'ongoing', 'published', 9, true);
