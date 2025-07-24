import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase环境变量缺失，跳过认证检查');
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user
      && !request.nextUrl.pathname.startsWith('/auth')
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone();
      url.pathname = '/auth/sign-in';
      return NextResponse.redirect(url);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
  } catch (error) {
    console.error('认证检查失败:', error);
    // 如果认证检查失败，返回原始响应，不进行重定向
    return supabaseResponse;
  }
}
