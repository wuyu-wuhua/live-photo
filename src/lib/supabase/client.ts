import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Supabase配置检查:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '未设置',
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase环境变量缺失:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '已设置' : '未设置',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '已设置' : '未设置',
    });
    throw new Error('缺少Supabase环境变量。请确保设置了NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
