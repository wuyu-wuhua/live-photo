'use client';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import GalleryCard from '@/components/gallery/GalleryCard';
import { useShowcaseItems } from '@/hooks/useDatabase';
import Masonry from 'react-masonry-css';
import '@/styles/masonry.css';

export default function ShowcaseVideosPage() {
  const t = useTranslations('showcase');
  const router = useRouter();
  // 获取所有用户同意展示的视频
  const { results, loading, error } = useShowcaseItems({
    page: 1,
    limit: 100,
    sortBy: 'created_at',
    sortOrder: 'desc',
    filters: { result_type: 'video' },
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">{t('title')}</h1>
      <div className="flex justify-center mb-8 gap-2">
        <Button color="default" variant="flat" size="md" onPress={() => router.push('/showcase/images')}>
          {t('imageTab')}
        </Button>
        <Button color="primary" variant="solid" size="md" className="font-bold" disabled>
          {t('videoTab')}
        </Button>
      </div>
      {loading
        ? (
          <div className="flex justify-center items-center py-12">加载中...</div>
        )
        : error
          ? (
            <div className="flex justify-center items-center py-12 text-red-500">{t('common.loadingFailed')}</div>
          )
          : (
            <div className="w-full">
              <div className="text-sm text-gray-500 mb-4">{t('foundVideos', { count: results.length })}</div>
              <Masonry
                breakpointCols={4}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
              >
                {results.map(result => (
                  <GalleryCard
                    key={result.id}
                    result={result}
                    onImageClick={() => {}}
                    onDownload={() => {}}
                    hideShowcaseButton
                    hideDeleteButton
                    hideStatusInfo
                    hideVideoControls
                  />
                ))}
              </Masonry>
            </div>
          )}
    </div>
  );
} 