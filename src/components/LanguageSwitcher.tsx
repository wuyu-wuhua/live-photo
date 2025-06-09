'use client';

import { Button } from '@heroui/react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { type Locale, locales, setStoredLocale } from '@/i18n/i18nConfig';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      return;
    }

    startTransition(() => {
      // 保存到本地存储
      setStoredLocale(newLocale);

      // 设置Cookie（用于服务器端渲染）
      document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // 刷新页面以应用新语言
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      {locales.map(loc => (
        <Button
          key={loc}
          size="sm"
          variant={locale === loc ? 'solid' : 'bordered'}
          color={locale === loc ? 'primary' : 'default'}
          isLoading={isPending && locale !== loc}
          onPress={() => handleLocaleChange(loc)}
          className="min-w-16"
        >
          {loc.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
