'use client';

import type { ImageEditResult, QueryParams } from '@/types/database';
import { Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Pagination, Spinner, useDisclosure } from '@heroui/react';
import { Images } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Masonry from 'react-masonry-css';
import GalleryCard from '@/components/gallery/GalleryCard';
import ImageDetailModal from '@/components/gallery/ImageDetailModal';
import { VideoParameterPanel } from '@/components/video-generate/VideoParameterPanel';
import { useImageEditResults } from '@/hooks/useDatabase';

import '@/styles/masonry.css';

// const Xgplayer: any = dynamic(() => import('xgplayer-react'), { ssr: false });

type GalleryPageState = {
  currentPage: number;
  pageSize: number;
  statusFilter: string;
  typeFilter: string; // 'all', 'image', 'video'
};

// 格式化时间函数
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

// 处理下载图片或视频
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
    console.error('下载失败', error);
    // Fallback to window.open if download fails
    window.open(url, '_blank');
  }
};

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const [state, setState] = useState<GalleryPageState>({
    currentPage: 1,
    pageSize: 24, // 增加了默认显示数量，更适合瀑布流
    statusFilter: 'all',
    typeFilter: 'all',
  });

  // 选中的图片结果
  const [selectedResult, setSelectedResult] = useState<ImageEditResult | null>(null);

  // 模态框控制
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Drawer控制
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [selectedVideoType, setSelectedVideoType] = useState<'emoji' | 'liveportrait'>('emoji');
  const [selectedImageForVideo, setSelectedImageForVideo] = useState<ImageEditResult | null>(null);

  // 视频生成参数状态
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [drivenId, setDrivenId] = useState<string>('mengwa_kaixin');
  const [isGenerating] = useState(false);
  const [generateError] = useState<string | null>(null);

  // 构建查询参数
  const queryParams: QueryParams = {
    page: state.currentPage,
    limit: state.pageSize,
    sortBy: 'created_at',
    sortOrder: 'desc',
    filters: {
      ...(state.statusFilter !== 'all' ? { status: state.statusFilter as any } : {}),
      ...(state.typeFilter !== 'all' ? { result_type: state.typeFilter } : {}),
    },
  };

  const { results, pagination, loading, error, refetch } = useImageEditResults(queryParams);

  // 处理图片点击，打开详情模态框
  const handleImageClick = (result: ImageEditResult) => {
    setSelectedResult(result);
    onOpen();
  };

  // 处理视频生成按钮点击
  const handleVideoGeneration = (result: ImageEditResult, type: 'emoji' | 'liveportrait') => {
    setSelectedImageForVideo(result);
    setSelectedVideoType(type);
    onDrawerOpen();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* 标题和过滤器 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">{t('title')}</h1>

          <div className="flex flex-wrap gap-2">
            {/* 状态过滤器 */}
            <select
              className="px-3 py-1 border rounded-md bg-white dark:bg-gray-800"
              value={state.statusFilter}
              onChange={e => setState({ ...state, statusFilter: e.target.value, currentPage: 1 })}
            >
              <option value="all">{t('filters.allStatus')}</option>
              <option value="SUCCEEDED">{t('filters.succeeded')}</option>
              <option value="RUNNING">{t('filters.processing')}</option>
              <option value="PENDING">{t('filters.waiting')}</option>
              <option value="FAILED">{t('filters.failed')}</option>
            </select>

            {/* 类型过滤器 */}
            <select
              className="px-3 py-1 border rounded-md bg-white dark:bg-gray-800"
              value={state.typeFilter}
              onChange={e => setState({ ...state, typeFilter: e.target.value, currentPage: 1 })}
            >
              <option value="all">{t('filters.allTypes')}</option>
              <option value="image">{t('filters.image')}</option>
              <option value="video">{t('filters.video')}</option>
            </select>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-700">
            {t('errorLoadingResults')}
          </div>
        )}

        {/* 无结果状态 */}
        {!loading && !error && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Images className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">{t('noResults')}</h3>
            <p className="text-gray-500 max-w-md">{t('noResultsDescription')}</p>
          </div>
        )}

        {/* 结果网格 */}
        {!loading && results.length > 0 && (
          <Masonry
            breakpointCols={{
              default: 4,
              1536: 4,
              1280: 3,
              1024: 3,
              768: 2,
              640: 1,
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {results.map(result => (
              <GalleryCard
                key={result.id}
                result={result}
                onImageClick={handleImageClick}
                onDownload={handleDownload}
                onVideoGeneration={handleVideoGeneration}
              />
            ))}
          </Masonry>
        )}

        {/* 分页控制 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={pagination.totalPages}
              initialPage={state.currentPage}
              onChange={page => setState({ ...state, currentPage: page })}
            />
          </div>
        )}
      </div>

      {/* 图片详情模态框 */}
      {selectedResult && (
        <ImageDetailModal
          isOpen={isOpen}
          onClose={onClose}
          imageResult={selectedResult}
          handleDownload={handleDownload}
          formatTime={formatTime}
        />
      )}

      {/* 视频生成抽屉 */}
      <Drawer isOpen={isDrawerOpen} onClose={onDrawerClose} placement="right">
        <DrawerContent>
          <DrawerHeader className="border-b">
            {selectedVideoType === 'emoji' ? t('generateEmojiVideo') : t('generateLipsyncVideo')}
          </DrawerHeader>
          <DrawerBody>
            {selectedImageForVideo && (
              <VideoParameterPanel
                imageData={selectedImageForVideo}
                isLoading={false}
                isGenerating={isGenerating}
                error={generateError}
                videoType={selectedVideoType}
                audioUrl={audioUrl}
                drivenId={drivenId}
                onVideoTypeChange={setSelectedVideoType}
                onAudioUrlChange={setAudioUrl}
                onDrivenIdChange={setDrivenId}
                onGenerate={() => {
                  // 这里可以添加生成逻辑，或者保持为空
                }}
                onClose={onDrawerClose}
                onSuccess={() => {
                  onDrawerClose();
                  refetch();
                }}
              />
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button color="danger" variant="light" onPress={onDrawerClose}>
              {t('cancel')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
