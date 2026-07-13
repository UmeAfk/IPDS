-- ============================================================
-- IPDS — Update project descriptions
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

UPDATE projects SET
  description = 'Housing redevelopment in Viman Nagar.',
  long_description = 'Archana Co-operative Housing Society, Viman Nagar, Pune, Maharashtra. A self-redevelopment project by an existing housing society in Viman Nagar, aimed at modernizing the property while preserving member ownership and community.'
WHERE title = 'Archana Co-operative Housing Society';

UPDATE projects SET
  description = 'Housing redevelopment in Aundh.',
  long_description = 'Parinita Co-operative Housing Society, Aundh, Pune, Maharashtra. A society-led redevelopment in Aundh, one of Pune''s well-established residential neighborhoods, focused on delivering upgraded homes to current members through self-redevelopment.'
WHERE title = 'Parinita Co-operative Housing Society';

UPDATE projects SET
  description = 'Housing redevelopment in Mayur Colony.',
  long_description = 'Varadwant CHS, Mayur Colony, Pune, Maharashtra. A cooperative housing society redevelopment in Mayur Colony, undertaken to rebuild aging structures into modern residences for existing members.'
WHERE title = 'Varadwant CHS';

UPDATE projects SET
  description = 'Housing redevelopment in Kothrud.',
  long_description = 'Jyoti Villa Co-operative Housing Society, Kothrud, Pune, Maharashtra. A self-redevelopment initiative in Kothrud, giving society members direct control over the rebuilding process and the resulting flats.'
WHERE title = 'Jyoti Villa Co-operative Housing Society';

UPDATE projects SET
  description = 'Housing redevelopment in PCMC.',
  long_description = 'Manoj CHS, Pimpri-Chinchwad Municipal Corporation (PCMC) area, Pune, Maharashtra. A cooperative housing society redevelopment within PCMC limits, replacing an older structure with a modern residential building for existing members.'
WHERE title = 'Manoj CHS';

UPDATE projects SET
  description = 'Housing redevelopment in Kothrud.',
  long_description = 'Daulat Co-operative Housing Society, Kothrud, Pune, Maharashtra. A society redevelopment project in Kothrud focused on rebuilding the existing structure into a modern residential complex for current members.'
WHERE title = 'Daulat Co-operative Housing Society';

UPDATE projects SET
  description = 'Premium society redevelopment.',
  long_description = 'Shree Sadhana Society, Pune, Maharashtra. A premium self-redevelopment project offering upgraded amenities and finishes for existing society members while retaining full ownership of the redeveloped property.'
WHERE title = 'Shree Sadhana Society';

UPDATE projects SET
  description = 'Housing redevelopment in Karve Nagar.',
  long_description = 'Dhawalgiri Park CHS, Karve Nagar, Pune, Maharashtra. A cooperative housing society redevelopment in Karve Nagar, rebuilding the existing property into modern residences for current members.'
WHERE title = 'Dhawalgiri Park CHS';

UPDATE projects SET
  description = 'Housing redevelopment in Nal-Stop.',
  long_description = 'Prasad Apartment, Nal Stop, Pune, Maharashtra. A residential redevelopment project near Nal Stop, one of Pune''s central and well-connected localities, undertaken to modernize the existing apartment building for its residents.'
WHERE title = 'Prasad Apartment';

UPDATE projects SET
  description = 'Housing redevelopment in Model Colony.',
  long_description = 'Tejal Co-operative Housing Society, Model Colony, Pune, Maharashtra. A self-redevelopment project in Model Colony, rebuilding the society''s existing structure into a modern residential complex for current members.'
WHERE title = 'Tejal Co-operative Housing Society';

-- ============================================================
-- DONE
-- ============================================================