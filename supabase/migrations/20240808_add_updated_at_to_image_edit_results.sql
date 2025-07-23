-- 添加updated_at字段到image_edit_results表
ALTER TABLE image_edit_results 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 创建触发器来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_image_edit_results_updated_at ON image_edit_results;
CREATE TRIGGER update_image_edit_results_updated_at
    BEFORE UPDATE ON image_edit_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON COLUMN image_edit_results.updated_at IS '记录最后更新时间'; 