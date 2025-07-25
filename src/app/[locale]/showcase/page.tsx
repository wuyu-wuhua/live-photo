'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function ShowcasePage() {
  const t = useTranslations('showcase');
  const router = useRouter();

  // 默认跳转到图片内页
  useEffect(() => {
    router.replace('/showcase/images');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      <div className="flex justify-center gap-4 mb-8">
        <Button color="primary" variant="solid" onPress={() => router.push('/showcase/images')}>
          {t('imageTab')}
        </Button>
        <Button color="default" variant="bordered" onPress={() => router.push('/showcase/videos')}>
          {t('videoTab')}
        </Button>
      </div>
      <p className="text-lg text-default-500">{t('subtitle')}</p>
    </div>
  );
}
