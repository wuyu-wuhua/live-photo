'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import Masonry from 'react-masonry-css';
import GalleryCard from '@/components/gallery/GalleryCard';
import { useImageEditResults } from '@/hooks/useDatabase';
import '@/styles/masonry.css';

export default function ShowcaseVideosPage() {
  const t = useTranslations('showcase');
  const router = useRouter();
  // 只查is_showcase为true的视频
  const { results, loading, error } = useImageEditResults({
    page: 1,
    limit: 100,
    sortBy: 'created_at',
    sortOrder: 'desc',
    filters: { result_type: 'video', is_showcase: true },
  });

  // 下载视频方法
  const handleDownload = async (url: string, filename?: string) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || `live-photo-${new Date().getTime()}.${url.endsWith('.mp4') ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

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
      {loading ? (
        <div className="flex justify-center items-center py-12">加载中...</div>
      ) : error ? (
        <div className="flex justify-center items-center py-12 text-red-500">加载失败</div>
      ) : (
        <div className="w-full">
          <div className="text-sm text-gray-500 mb-4">共找到 {results.length} 个视频</div>
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
                onDownload={handleDownload}
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