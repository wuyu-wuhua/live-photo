import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/i18nConfig';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // 匹配所有路径，除了API、静态文件等
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
