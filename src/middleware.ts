import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/i18nConfig';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 跳过认证相关路径，避免干扰OAuth登录流程
  const authPaths = ['/auth', '/api/auth'];
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.includes(path),
  );

  if (isAuthPath) {
    // 对于认证相关路径，直接执行国际化中间件，不进行认证检查
    return intlMiddleware(request);
  }

  // 需要登录保护的路径
  const protectedPaths = ['/generate', '/gallery'];

  // 检查当前路径是否需要登录保护
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.includes(path),
  );
  if (isProtectedPath) {
    // 对于受保护的路径，先执行认证检查
    const authResponse = await updateSession(request);
    if (authResponse.status === 307 || authResponse.status === 302) {
      // 如果是重定向响应（未登录），直接返回
      return authResponse;
    }
  }

  // 执行国际化中间件
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // 匹配所有路径，除了API、静态文件等
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
