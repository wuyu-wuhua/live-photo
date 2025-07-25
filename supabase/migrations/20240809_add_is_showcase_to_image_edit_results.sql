-- 为作品展示功能添加 is_showcase 字段
ALTER TABLE image_edit_results 
ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN NOT NULL DEFAULT false;
 
COMMENT ON COLUMN image_edit_results.is_showcase IS '是否展示到作品展示页（true=展示，false=不展示）'; 