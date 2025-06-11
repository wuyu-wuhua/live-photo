'use client';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-6xl font-bold tracking-tighter text-primary">404</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </div>
      <Button>
        <Link href="/">{t('backToHome')}</Link>
      </Button>
    </div>
  );
}
