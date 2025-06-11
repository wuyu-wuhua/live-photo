-- 此迁移文件用于更新之前创建的stripe表的RLS策略
-- 假设20240801_create_polar_tables.sql已经执行过了

-- 为stripe_customers表添加服务角色策略
DROP POLICY IF EXISTS "Service role can do all operations on customers" ON public.stripe_customers;
CREATE POLICY "Service role can do all operations on customers"
  ON public.stripe_customers
  USING (auth.role() = 'service_role'::text);

-- 确保stripe_customers表有适当的INSERT策略
DROP POLICY IF EXISTS "Users can insert their own customer data" ON public.stripe_customers;
CREATE POLICY "Users can insert their own customer data"
  ON public.stripe_customers FOR INSERT
  WITH CHECK (auth.uid()::TEXT = "userId");

-- 确保stripe_customers表有适当的UPDATE策略
DROP POLICY IF EXISTS "Users can update their own customer data" ON public.stripe_customers;
CREATE POLICY "Users can update their own customer data"
  ON public.stripe_customers FOR UPDATE
  USING (auth.uid()::TEXT = "userId");

-- 为stripe_subscriptions表添加服务角色策略
DROP POLICY IF EXISTS "Service role can do all operations on subscriptions" ON public.stripe_subscriptions;
CREATE POLICY "Service role can do all operations on subscriptions"
  ON public.stripe_subscriptions
  USING (auth.role() = 'service_role'::text);

-- 确保stripe_subscriptions表有适当的INSERT策略
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.stripe_subscriptions;
CREATE POLICY "Users can insert their own subscriptions"
  ON public.stripe_subscriptions FOR INSERT
  WITH CHECK (auth.uid()::TEXT = "userId");

-- 确保stripe_subscriptions表有适当的UPDATE策略
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.stripe_subscriptions;
CREATE POLICY "Users can update their own subscriptions"
  ON public.stripe_subscriptions FOR UPDATE
  USING (auth.uid()::TEXT = "userId");

-- 为服务账户添加额外的权限
GRANT ALL ON public.stripe_customers TO service_role;
GRANT ALL ON public.stripe_subscriptions TO service_role;

-- 如果还存在RLS问题，可以通过以下注释的命令临时禁用RLS（仅在开发环境中使用）
-- ALTER TABLE public.stripe_customers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.stripe_subscriptions DISABLE ROW LEVEL SECURITY; 