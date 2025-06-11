-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  status TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS stripe_customers_user_id_idx ON public.stripe_customers ("userId");
CREATE INDEX IF NOT EXISTS stripe_subscriptions_user_id_idx ON public.stripe_subscriptions ("userId");
CREATE INDEX IF NOT EXISTS stripe_subscriptions_subscription_id_idx ON public.stripe_subscriptions ("subscriptionId");

-- Set up RLS (Row Level Security) policies
-- For stripe_customers table
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- 服务角色策略（允许service_role角色不受限制访问）
CREATE POLICY "Service role can do all operations on customers"
  ON public.stripe_customers
  USING (auth.role() = 'service_role'::text);

-- 用户策略
CREATE POLICY "Users can view their own customer data"
  ON public.stripe_customers FOR SELECT
  USING (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can insert their own customer data"
  ON public.stripe_customers FOR INSERT
  WITH CHECK (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can update their own customer data"
  ON public.stripe_customers FOR UPDATE
  USING (auth.uid()::TEXT = "userId");

-- For stripe_subscriptions table
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- 服务角色策略（允许service_role角色不受限制访问）
CREATE POLICY "Service role can do all operations on subscriptions"
  ON public.stripe_subscriptions
  USING (auth.role() = 'service_role'::text);

-- 用户策略
CREATE POLICY "Users can view their own subscriptions"
  ON public.stripe_subscriptions FOR SELECT
  USING (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can insert their own subscriptions"
  ON public.stripe_subscriptions FOR INSERT
  WITH CHECK (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can update their own subscriptions"
  ON public.stripe_subscriptions FOR UPDATE
  USING (auth.uid()::TEXT = "userId");

-- 注意：如果仍然遇到RLS权限问题，可以尝试以下方法之一：
-- 1. 临时禁用表的RLS（开发环境）：
--    ALTER TABLE public.stripe_customers DISABLE ROW LEVEL SECURITY;
--    ALTER TABLE public.stripe_subscriptions DISABLE ROW LEVEL SECURITY;
-- 
-- 2. 为服务器服务添加绕过RLS的能力：
--    ALTER TABLE public.stripe_customers FORCE ROW LEVEL SECURITY;
--    ALTER TABLE public.stripe_subscriptions FORCE ROW LEVEL SECURITY;
--    GRANT ALL ON public.stripe_customers TO service_role;
--    GRANT ALL ON public.stripe_subscriptions TO service_role; 