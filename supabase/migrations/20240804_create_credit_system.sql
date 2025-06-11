-- 创建积分交易类型枚举
CREATE TYPE credit_transaction_type AS ENUM (
  'PURCHASE',           -- 购买积分
  'SUBSCRIPTION',       -- 订阅获得
  'REFERRAL',           -- 推荐奖励
  'BONUS',              -- 奖励积分
  'ADMIN_ADJUSTMENT',   -- 管理员调整
  'IMAGE_GENERATION',   -- 图片生成消费
  'VIDEO_GENERATION',   -- 视频生成消费
  'REFUND',             -- 退款
  'EXPIRATION',         -- 积分过期
  'PROMOTIONAL'         -- 促销赠送
);

-- 创建交易状态枚举
CREATE TYPE transaction_status AS ENUM (
  'COMPLETED',
  'PENDING',
  'FAILED',
  'REFUNDED'
);

-- 创建订阅状态枚举
CREATE TYPE subscription_status AS ENUM (
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'INCOMPLETE',
  'INCOMPLETE_EXPIRED',
  'TRIALING'
);

-- 创建计费周期枚举
CREATE TYPE billing_period AS ENUM (
  'MONTHLY',
  'QUARTERLY',
  'YEARLY'
);

-- 创建用户积分表
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建积分交易记录表
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 正数为收入，负数为支出
  balance_after INTEGER NOT NULL,
  type credit_transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'COMPLETED',
  description TEXT,
  metadata JSONB,
  reference_id TEXT, -- 关联的订单ID、任务ID等
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建积分套餐表
CREATE TABLE credit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  is_subscription BOOLEAN NOT NULL DEFAULT false,
  billing_period billing_period,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建用户积分订阅表
CREATE TABLE credit_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES credit_plans(id),
  status subscription_status NOT NULL DEFAULT 'ACTIVE',
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建功能积分消耗定价表
CREATE TABLE feature_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_id TEXT NOT NULL UNIQUE, -- 'image_generation', 'video_generation', 'liveportrait_animation', 等
  feature_name TEXT NOT NULL,
  credits_cost INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建获取用户积分的函数
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS TABLE(balance INTEGER, lifetime_earned INTEGER, lifetime_spent INTEGER) AS $$
DECLARE
  v_credits user_credits;
BEGIN
  -- 尝试查找用户积分记录
  SELECT * INTO v_credits FROM user_credits WHERE user_id = p_user_id;
  
  -- 如果不存在，创建新记录
  IF v_credits IS NULL THEN
    INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
    VALUES (p_user_id, 0, 0, 0)
    RETURNING * INTO v_credits;
  END IF;
  
  RETURN QUERY SELECT v_credits.balance, v_credits.lifetime_earned, v_credits.lifetime_spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建添加积分的函数
CREATE OR REPLACE FUNCTION add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type credit_transaction_type,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, transaction_id UUID, new_balance INTEGER) AS $$
DECLARE
  v_credits user_credits;
  v_transaction credit_transactions;
  v_new_balance INTEGER;
BEGIN
  -- 检查金额是否有效
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, '添加的积分必须大于0', NULL::UUID, 0;
    RETURN;
  END IF;

  -- 开始事务
  BEGIN
    -- 锁定用户积分记录以防止并发更新
    SELECT * INTO v_credits FROM user_credits WHERE user_id = p_user_id FOR UPDATE;
    
    -- 如果用户记录不存在，创建一个新记录
    IF v_credits IS NULL THEN
      INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
      VALUES (p_user_id, 0, 0, 0)
      RETURNING * INTO v_credits;
    END IF;
    
    -- 计算新余额
    v_new_balance := v_credits.balance + p_amount;
    
    -- 更新用户积分
    UPDATE user_credits
    SET 
      balance = v_new_balance,
      lifetime_earned = lifetime_earned + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
    
    -- 创建交易记录
    INSERT INTO credit_transactions (
      user_id, 
      amount, 
      balance_after, 
      type, 
      status,
      description, 
      reference_id, 
      metadata
    )
    VALUES (
      p_user_id, 
      p_amount, 
      v_new_balance, 
      p_type, 
      'COMPLETED',
      p_description, 
      p_reference_id, 
      p_metadata
    )
    RETURNING * INTO v_transaction;
    
    -- 返回成功结果
    RETURN QUERY SELECT true, '积分添加成功', v_transaction.id, v_new_balance;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error adding credits: %', SQLERRM;
      RETURN QUERY SELECT false, SQLERRM, NULL::UUID, 0;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建扣除积分的函数
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type credit_transaction_type,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, transaction_id UUID, new_balance INTEGER) AS $$
DECLARE
  v_credits user_credits;
  v_transaction credit_transactions;
  v_new_balance INTEGER;
  v_deduction_amount INTEGER;
BEGIN
  -- 确保要扣除的金额为正数
  v_deduction_amount := ABS(p_amount);
  
  -- 开始事务
  BEGIN
    -- 锁定用户积分记录以防止并发更新
    SELECT * INTO v_credits FROM user_credits WHERE user_id = p_user_id FOR UPDATE;
    
    -- 如果用户记录不存在，创建一个新记录
    IF v_credits IS NULL THEN
      INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
      VALUES (p_user_id, 0, 0, 0)
      RETURNING * INTO v_credits;
    END IF;
    
    -- 检查余额是否足够
    IF v_credits.balance < v_deduction_amount THEN
      RETURN QUERY SELECT false, '积分余额不足', NULL::UUID, v_credits.balance;
      RETURN;
    END IF;
    
    -- 计算新余额
    v_new_balance := v_credits.balance - v_deduction_amount;
    
    -- 更新用户积分
    UPDATE user_credits
    SET 
      balance = v_new_balance,
      lifetime_spent = lifetime_spent + v_deduction_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
    
    -- 创建交易记录，使用负数表示支出
    INSERT INTO credit_transactions (
      user_id, 
      amount, 
      balance_after, 
      type, 
      status,
      description, 
      reference_id, 
      metadata
    )
    VALUES (
      p_user_id, 
      -v_deduction_amount, 
      v_new_balance, 
      p_type, 
      'COMPLETED',
      p_description, 
      p_reference_id, 
      p_metadata
    )
    RETURNING * INTO v_transaction;
    
    -- 返回成功结果
    RETURN QUERY SELECT true, '积分扣除成功', v_transaction.id, v_new_balance;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error deducting credits: %', SQLERRM;
      RETURN QUERY SELECT false, SQLERRM, NULL::UUID, 0;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建退还积分的函数
CREATE OR REPLACE FUNCTION refund_user_credits(
  p_transaction_id UUID,
  p_reason TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT, refund_transaction_id UUID, new_balance INTEGER) AS $$
DECLARE
  v_transaction credit_transactions;
  v_credits user_credits;
  v_refund_transaction credit_transactions;
  v_new_balance INTEGER;
  v_refund_amount INTEGER;
BEGIN
  -- 开始事务
  BEGIN
    -- 获取原始交易记录
    SELECT * INTO v_transaction FROM credit_transactions WHERE id = p_transaction_id FOR UPDATE;
    
    -- 检查交易是否存在
    IF v_transaction IS NULL THEN
      RETURN QUERY SELECT false, '找不到指定的交易记录', NULL::UUID, 0;
      RETURN;
    END IF;
    
    -- 检查交易是否已经退款
    IF v_transaction.status = 'REFUNDED' THEN
      RETURN QUERY SELECT false, '该交易已经退款', NULL::UUID, 0;
      RETURN;
    END IF;
    
    -- 只能退款消费记录
    IF v_transaction.amount > 0 THEN
      RETURN QUERY SELECT false, '只能退款消费记录', NULL::UUID, 0;
      RETURN;
    END IF;
    
    -- 计算退款金额（原消费的正值）
    v_refund_amount := ABS(v_transaction.amount);
    
    -- 锁定用户积分记录以防止并发更新
    SELECT * INTO v_credits FROM user_credits WHERE user_id = v_transaction.user_id FOR UPDATE;
    
    -- 检查用户记录是否存在
    IF v_credits IS NULL THEN
      RETURN QUERY SELECT false, '找不到用户积分记录', NULL::UUID, 0;
      RETURN;
    END IF;
    
    -- 计算新余额
    v_new_balance := v_credits.balance + v_refund_amount;
    
    -- 更新用户积分
    UPDATE user_credits
    SET 
      balance = v_new_balance,
      updated_at = now()
    WHERE user_id = v_transaction.user_id;
    
    -- 更新原交易状态为已退款
    UPDATE credit_transactions
    SET 
      status = 'REFUNDED',
      updated_at = now()
    WHERE id = p_transaction_id;
    
    -- 创建退款交易记录
    INSERT INTO credit_transactions (
      user_id, 
      amount, 
      balance_after, 
      type, 
      status,
      description, 
      reference_id, 
      metadata
    )
    VALUES (
      v_transaction.user_id, 
      v_refund_amount, 
      v_new_balance, 
      'REFUND',
      'COMPLETED',
      '退款: ' || COALESCE(p_reason, ''),
      p_transaction_id::TEXT, 
      jsonb_build_object('original_transaction_id', p_transaction_id, 'reason', p_reason)
    )
    RETURNING * INTO v_refund_transaction;
    
    -- 返回成功结果
    RETURN QUERY SELECT true, '积分退款成功', v_refund_transaction.id, v_new_balance;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error refunding credits: %', SQLERRM;
      RETURN QUERY SELECT false, SQLERRM, NULL::UUID, 0;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 启用行级安全策略
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_costs ENABLE ROW LEVEL SECURITY;

-- 用户积分表的RLS策略
CREATE POLICY "用户只能查看自己的积分" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "只有服务角色可以插入用户积分" ON user_credits
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "只有服务角色可以更新用户积分" ON user_credits
  FOR UPDATE USING (auth.role() = 'service_role');

-- 积分交易记录表的RLS策略
CREATE POLICY "用户只能查看自己的交易记录" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "只有服务角色可以插入交易记录" ON credit_transactions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "只有服务角色可以更新交易记录" ON credit_transactions
  FOR UPDATE USING (auth.role() = 'service_role');

-- 积分套餐表的RLS策略
CREATE POLICY "所有人可以查看积分套餐" ON credit_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "只有管理员可以管理积分套餐" ON credit_plans
  FOR ALL USING (auth.role() = 'service_role');

-- 用户积分订阅表的RLS策略
CREATE POLICY "用户只能查看自己的订阅" ON credit_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "只有服务角色可以插入订阅" ON credit_subscriptions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "只有服务角色可以更新订阅" ON credit_subscriptions
  FOR UPDATE USING (auth.role() = 'service_role');

-- 功能积分消耗定价表的RLS策略
CREATE POLICY "所有人可以查看功能价格" ON feature_costs
  FOR SELECT USING (is_active = true);

CREATE POLICY "只有管理员可以管理功能价格" ON feature_costs
  FOR ALL USING (auth.role() = 'service_role');

-- 创建索引提高查询性能
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX idx_credit_subscriptions_user_id ON credit_subscriptions(user_id);
CREATE INDEX idx_credit_subscriptions_status ON credit_subscriptions(status);

-- 初始化一些功能价格数据
INSERT INTO feature_costs (feature_id, feature_name, credits_cost)
VALUES
  ('stylization_all', '全图风格化', 5),
  ('stylization_local', '局部风格化', 6),
  ('description_edit', '描述编辑', 8),
  ('description_edit_with_mask', '蒙版描述编辑', 10),
  ('remove_watermark', '去水印', 3),
  ('expand', '图像扩展', 4),
  ('super_resolution', '超分辨率', 7),
  ('colorization', '上色', 6),
  ('doodle', '涂鸦', 5),
  ('control_cartoon_feature', '卡通特征控制', 7),
  ('liveportrait_animation', '口型匹配动画', 15),
  ('emoji_animation', '表情动画', 12);

-- 初始化一些默认的积分套餐
INSERT INTO credit_plans (name, description, credits, price, currency, is_subscription, billing_period)
VALUES
  ('基础套餐', '适合轻度使用的用户', 100, 19, 'CNY', false, NULL),
  ('标准套餐', '适合中度使用的用户', 500, 79, 'CNY', false, NULL),
  ('高级套餐', '适合重度使用的用户', 1200, 159, 'CNY', false, NULL),
  ('月度订阅', '每月自动充值，更加优惠', 1000, 99, 'CNY', true, 'MONTHLY');

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE user_credits;
ALTER PUBLICATION supabase_realtime ADD TABLE credit_transactions;
