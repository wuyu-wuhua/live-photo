-- 创建图像编辑功能枚举类型
CREATE TYPE image_edit_function AS ENUM (
  'stylization_all',
  'stylization_local',
  'description_edit',
  'description_edit_with_mask',
  'remove_watermark',
  'expand',
  'super_resolution',
  'colorization',
  'doodle',
  'control_cartoon_feature'
);

-- 创建任务状态枚举类型
CREATE TYPE task_status AS ENUM (
  'PENDING',
  'RUNNING',
  'SUCCEEDED',
  'FAILED'
);

-- 创建图像编辑结果表
CREATE TABLE image_edit_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  source_image_url TEXT NOT NULL,
  result_image_url TEXT[] NOT NULL,
  request_parameters JSONB,
  status task_status DEFAULT 'PENDING' NOT NULL,
  result_type TEXT DEFAULT 'image' NOT NULL, -- 'image' 或 'video'
  liveportrait_compatible BOOLEAN,
  liveportrait_detected_at TIMESTAMP WITH TIME ZONE,
  liveportrait_message TEXT,
  liveportrait_request_id TEXT,
  emoji_compatible BOOLEAN,
  emoji_detected_at TIMESTAMP WITH TIME ZONE,
  emoji_message TEXT,
  emoji_face_bbox TEXT,
  emoji_ext_bbox TEXT,
  emoji_request_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用行级安全策略
ALTER TABLE image_edit_results ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的记录
CREATE POLICY "Users can view own image edit results" ON image_edit_results
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own image edit results" ON image_edit_results
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own image edit results" ON image_edit_results
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own image edit results" ON image_edit_results
  FOR DELETE USING (auth.uid()::text = user_id);

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE image_edit_results;