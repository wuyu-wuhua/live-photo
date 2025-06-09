// 为了向后兼容，重新导出新的客户端创建函数
// 导出默认客户端实例
import { createClient } from './supabase/client';

export { createClient as createSupabaseClient } from './supabase/client';
export const supabase = createClient();
