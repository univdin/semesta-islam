-- SEMESTA ISLAM — Supabase Storage Buckets & RLS
-- Governed by docs/08_SECURITY_COMPLIANCE.md §2.1.
--
-- Buckets (APPLIED 2026-08-03):
--   verification-docs  PRIVATE — KTP, ijazah, sanad PDFs (Signed URLs only, 15 min)
--   sanad-certificates PRIVATE — public-facing sanad PDFs (Signed URLs / badge only)
--   avatars            PUBLIC  — profile photos (small images)
--
-- Note: `public = false` buckets are only readable via authenticated signed URLs.
-- Because the app reads/writes documents through Prisma + signed URLs, anon REST
-- access stays locked (see rls-hardening.sql).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('verification-docs', 'verification-docs', false, 10485760,
   ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('sanad-certificates', 'sanad-certificates', false, 10485760,
   ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152,
   ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS: avatars are public-read; private doc buckets require row owner (auth.uid()).
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public avatars read" ON storage.objects;
CREATE POLICY "Public avatars read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Owner write docs" ON storage.objects;
CREATE POLICY "Owner write docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('verification-docs','sanad-certificates') AND owner_id = auth.uid());

DROP POLICY IF EXISTS "Owner read own docs" ON storage.objects;
CREATE POLICY "Owner read own docs"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('verification-docs','sanad-certificates') AND owner_id = auth.uid());
