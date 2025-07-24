import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 清理URL格式，确保没有多余的字符
  if (supabaseUrl) {
    // 移除可能的前缀字符（如 'd'）
    supabaseUrl = supabaseUrl.replace(/^[^h]*/, '');
    // 确保URL以 https:// 开头
    if (!supabaseUrl.startsWith('https://')) {
      supabaseUrl = `https://${supabaseUrl.replace(/^https?:\/\//, '')}`;
    }
  }

  // 在开发环境中，如果没有环境变量，返回一个模拟的客户端
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase环境变量缺失，使用模拟客户端');
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      rpc: () => Promise.resolve({ data: null, error: null }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        exchangeCodeForSession: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      },
    } as any;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
