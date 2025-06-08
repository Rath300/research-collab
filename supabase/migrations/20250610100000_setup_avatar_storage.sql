-- Create or update the avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- SELECT Policy
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'avatars' );

-- INSERT Policy
DROP POLICY IF EXISTS "Avatar uploads for authenticated users" ON storage.objects;
CREATE POLICY "Avatar uploads for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- UPDATE Policy
DROP POLICY IF EXISTS "Avatar updates for authenticated users" ON storage.objects;
CREATE POLICY "Avatar updates for authenticated users"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);


-- DELETE Policy
DROP POLICY IF EXISTS "Avatar deletes for authenticated users" ON storage.objects;
CREATE POLICY "Avatar deletes for authenticated users"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
); 