-- 确保 live-photos 存储桶存在
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('live-photos', 'live-photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

-- 创建公开访问策略
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'live-photos');

-- 创建上传策略（允许认证用户上传）
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'live-photos' 
  AND auth.role() = 'authenticated'
);

-- 创建更新策略（允许用户更新自己的文件）
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'live-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 创建删除策略（允许用户删除自己的文件）
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'live-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
); 