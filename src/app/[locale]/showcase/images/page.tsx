'use client';
import { useTranslations } from 'next-intl';
import Masonry from 'react-masonry-css';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import type { ImageEditResult } from '@/types/database';
import GalleryCard from '@/components/gallery/GalleryCard';
import ImageDetailModal from '@/components/gallery/ImageDetailModal';
import { useShowcaseItems } from '@/hooks/useDatabase';
import '@/styles/masonry.css';
import { Button } from '@heroui/react';

export default function ShowcaseImagesPage() {
  const t = useTranslations('showcase');
  const router = useRouter();
  const [selected, setSelected] = useState<ImageEditResult | null>(null);
  // 获取所有用户同意展示的图片
  const { results, loading } = useShowcaseItems({
    page: 1,
    limit: 100,
    sortBy: 'created_at',
    sortOrder: 'desc',
    filters: { result_type: 'image' },
  });

  // 下载图片方法
  const handleDownload = async (url: string, filename?: string) => {
    if (!url) {
      return;
    }
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
  // 格式化时间
  const formatTime = (date: string) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">{t('title')}</h1>
      <div className="flex justify-center mb-8 gap-2">
        <Button color="primary" variant="solid" size="md" className="font-bold" disabled>
          {t('imageTab')}
        </Button>
        <Button color="default" variant="flat" size="md" onPress={() => router.push('/showcase/videos')}>
          {t('videoTab')}
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">加载中...</div>
      ) : (
        <div className="w-full">
          <div className="text-sm text-gray-500 mb-4">{t('foundImages', { count: results.length })}</div>
          <Masonry
            breakpointCols={4}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {results.map(result => (
              <GalleryCard
                key={result.id}
                result={result}
                onImageClick={() => setSelected(result)}
                onDownload={handleDownload}
                hideShowcaseButton
                hideDeleteButton
                hideStatusInfo
              />
            ))}
          </Masonry>
          <ImageDetailModal
            isOpen={!!selected}
            imageResult={selected}
            onClose={() => setSelected(null)}
            handleDownload={handleDownload}
            formatTime={formatTime}
          />
        </div>
      )}
    </div>
  );
}
