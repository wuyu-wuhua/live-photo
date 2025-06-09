import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, type Locale, LOCALE_STORAGE_KEY, locales } from './i18nConfig';

// 从请求头获取语言偏好
async function getLocaleFromHeaders(): Promise<Locale> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (acceptLanguage) {
    const firstLang = acceptLanguage.split(',')[0];
    if (firstLang) {
      const preferredLang = firstLang.split('-')[0];
      if (preferredLang && locales.includes(preferredLang as Locale)) {
        return preferredLang as Locale;
      }
    }
  }

  return defaultLocale;
}

// 从Cookie获取语言设置
async function getLocaleFromCookie(): Promise<Locale | null> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_STORAGE_KEY);

  if (localeCookie && locales.includes(localeCookie.value as Locale)) {
    return localeCookie.value as Locale;
  }

  return null;
}

export default getRequestConfig(async () => {
  // 优先使用Cookie中的设置，其次使用浏览器语言偏好
  const locale = (await getLocaleFromCookie()) || (await getLocaleFromHeaders());

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
