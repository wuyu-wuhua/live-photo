-- 修复作品展示功能的 RLS 策略
-- 允许用户查看所有 is_showcase = true 的记录

-- 删除旧的查看策略
DROP POLICY IF EXISTS "Users can view own image edit results" ON image_edit_results;

-- 创建新的查看策略：用户可以查看自己的记录，也可以查看所有展示的记录
CREATE POLICY "Users can view own and showcase image edit results" ON image_edit_results
  FOR SELECT USING (
    auth.uid()::text = user_id OR 
    is_showcase = true
  );

-- 确保更新策略允许用户更新自己的记录（包括 is_showcase 字段）
DROP POLICY IF EXISTS "Users can update own image edit results" ON image_edit_results;

CREATE POLICY "Users can update own image edit results" ON image_edit_results
  FOR UPDATE USING (auth.uid()::text = user_id); 