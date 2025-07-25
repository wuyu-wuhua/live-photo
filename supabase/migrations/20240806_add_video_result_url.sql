-- 添加video_result_url字段到image_edit_results表
ALTER TABLE image_edit_results 
ADD COLUMN IF NOT EXISTS video_result_url TEXT;

-- 添加注释
COMMENT ON COLUMN image_edit_results.video_result_url IS '视频生成结果的URL';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_image_edit_results_video_result_url 
ON image_edit_results(video_result_url) 
WHERE video_result_url IS NOT NULL; 