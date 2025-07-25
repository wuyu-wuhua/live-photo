-- 更新功能积分消耗定价
UPDATE feature_costs SET credits_cost = 1 WHERE feature_id IN (
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

-- 更新视频动画功能的积分消耗
UPDATE feature_costs SET credits_cost = 10 WHERE feature_id IN (
  'liveportrait_animation',
  'emoji_animation'
);

-- 更新积分套餐的价格和积分数量
UPDATE credit_plans SET 
  credits = 100,
  price = 9.99
WHERE name = '基础套餐';

UPDATE credit_plans SET 
  credits = 500,
  price = 29.99
WHERE name = '标准套餐';

UPDATE credit_plans SET 
  credits = 1000,
  price = 49.99
WHERE name = '高级套餐';

-- 如果套餐不存在，则插入新的套餐
INSERT INTO credit_plans (name, description, credits, price, currency, is_subscription, billing_period)
VALUES
  ('基础套餐', '适合轻度使用的用户', 100, 9.99, 'USD', false, NULL),
  ('标准套餐', '适合中度使用的用户', 500, 29.99, 'USD', false, NULL),
  ('高级套餐', '适合重度使用的用户', 1000, 49.99, 'USD', false, NULL)
ON CONFLICT (name) DO NOTHING; 