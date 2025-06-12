'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import NextLink from 'next/link';

export function FinalCTASection() {
  const t = useTranslations();

  return (
    <section
      className={`
        from-primary to-primary/80 py-20
        dark:bg-black
      `}
    >
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-center">
          <h2
            className={`
              text-3xl font-bold text-primary-foreground
              lg:text-4xl
              dark:text-white
            `}
          >
            {t('common.millionPhotosColorized')}
          </h2>
          <Button
            as={NextLink}
            className="px-8 py-4 text-lg font-semibold"
            color="secondary"
            href="/generate"
            size="lg"
          >
            {t('common.getStartNow')}
          </Button>
        </div>
      </div>
    </section>
  );
}
