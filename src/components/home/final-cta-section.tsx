'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';

type FinalCTASectionProps = {
  onFileUpload?: () => void;
};

export function FinalCTASection({ onFileUpload }: FinalCTASectionProps) {
  const t = useTranslations();

  const handleFileUpload = () => {
    if (onFileUpload) {
      onFileUpload();
    } else {
      // Default file upload logic
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) { /* empty */ }
      };
      input.click();
    }
  };

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
            className="px-8 py-4 text-lg font-semibold"
            color="secondary"
            onClick={handleFileUpload}
            size="lg"
          >
            {t('common.getStartNow')}
          </Button>
        </div>
      </div>
    </section>
  );
}
