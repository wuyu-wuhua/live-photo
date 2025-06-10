import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 此路由处理Supabase身份验证回调
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    // 使用授权码交换会话
    await supabase.auth.exchangeCodeForSession(code);

    // 重定向到首页或仪表板
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // 如果没有code参数，重定向到登录页面
  return NextResponse.redirect(new URL('/auth', requestUrl.origin));
}
