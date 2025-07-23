'use client';

import { Button } from '@heroui/react';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { type Locale, locales, setStoredLocale } from '@/i18n/i18nConfig';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 只支持中英文互切
  const nextLocale: Locale = locale === 'zh' ? 'en' : 'zh';

  const handleLocaleChange = () => {
    startTransition(() => {
      setStoredLocale(nextLocale);
      document.cookie = `preferred-locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    });
  };

  return (
        <Button
      isIconOnly
      variant="light"
      color="default"
      onClick={handleLocaleChange}
      isLoading={isPending}
      className="w-10 h-10 flex items-center justify-center bg-transparent hover:bg-gray-100/10 dark:hover:bg-white/10 rounded-full shadow-none border-none"
      title={locale === 'zh' ? '切换为英文' : 'Switch to Chinese'}
    >
      <Languages className="w-5 h-5" />
        </Button>
  );
}

export default LanguageSwitcher;
