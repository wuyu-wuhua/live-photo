'use client';

import type { ImageEditResult, QueryParams } from '@/types/database';
import { Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Pagination, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox } from '@heroui/react';
import { toast } from 'sonner';
import { Images, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import GalleryCard from '@/components/gallery/GalleryCard';
import ImageDetailModal from '@/components/gallery/ImageDetailModal';
import { VideoParameterPanel } from '@/components/video-generate/VideoParameterPanel';
import { useImageEditResults } from '@/hooks/useDatabase';
import { useRouter, usePathname } from 'next/navigation';
import VideoDetailModal from '@/components/gallery/VideoDetailModal';

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
  const router = useRouter();
  const pathname = usePathname();

  // 根据路由决定typeFilter
  let typeFilter: 'all' | 'image' | 'video' = 'all';
  if (pathname.endsWith('/images')) typeFilter = 'image';
  if (pathname.endsWith('/videos')) typeFilter = 'video';

  const [state, setState] = useState<GalleryPageState>({
    currentPage: 1,
    pageSize: 24, // 增加了默认显示数量，更适合瀑布流
    statusFilter: 'all',
    typeFilter,
  });

  // 选中的图片/视频结果
  const [selectedResult, setSelectedResult] = useState<ImageEditResult | null>(null);
  const [selectedVideoResult, setSelectedVideoResult] = useState<ImageEditResult | null>(null);

  // 模态框控制
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Drawer控制
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [selectedVideoType, setSelectedVideoType] = useState<'emoji' | 'liveportrait'>('emoji');
  const [selectedImageForVideo, setSelectedImageForVideo] = useState<ImageEditResult | null>(null);

  // 删除确认模态框控制
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [imageToDelete, setImageToDelete] = useState<ImageEditResult | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 多选状态
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

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

  // 自动轮询刷新
  useEffect(() => {
    const timer = setInterval(() => {
      refetch();
    }, 10000); // 每10秒刷新一次
    return () => clearInterval(timer);
  }, [refetch]);

  // 处理卡片点击，区分图片和视频
  const handleCardClick = (result: ImageEditResult) => {
    if (result.result_type === 'video') {
      setSelectedVideoResult(result);
      onOpen();
    } else {
      // 仅在非videos页面弹出图片详情
      if (!pathname.endsWith('/videos')) {
        setSelectedResult(result);
        onOpen();
      }
    }
  };

  // 处理视频生成按钮点击
  const handleVideoGeneration = (result: ImageEditResult, type: 'emoji' | 'liveportrait') => {
    setSelectedImageForVideo(result);
    setSelectedVideoType(type);
    onDrawerOpen();
  };

  const handleDelete = (result: ImageEditResult) => {
    setImageToDelete(result);
    onDeleteModalOpen();
  };

  // 处理多选
  const handleSelectItem = (itemId: string) => {
    console.log('选择项目:', itemId);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        console.log(t('gallery.cancelSelectItem'), itemId);
      } else {
        newSet.add(itemId);
        console.log('选择项目:', itemId);
      }
      console.log('当前选中的项目:', Array.from(newSet));
      return newSet;
    });
  };

          // {t('gallery.selectAll')}/{t('gallery.cancelSelectAll')}
  const handleSelectAll = () => {
    if (selectedItems.size === results.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(results.map(item => item.id)));
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    console.log('批量删除按钮被点击');
    console.log('当前选中的项目数量:', selectedItems.size);
    console.log('选中的项目:', Array.from(selectedItems));
    
    if (selectedItems.size === 0) {
      toast.error(t('pleaseSelectItems'));
      return;
    }
    setImageToDelete(null); // 确保设置为null以表示批量删除
    onDeleteModalOpen();
  };

  // 退出选择模式
  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedItems(new Set());
  };

  const confirmDelete = async () => {
    const itemsToDelete = imageToDelete ? [imageToDelete.id] : Array.from(selectedItems);
    console.log('要删除的项目:', itemsToDelete);
    console.log('imageToDelete:', imageToDelete);
    console.log('selectedItems:', selectedItems);
    
    if (itemsToDelete.length === 0) {
      console.log('没有项目需要删除');
      toast.error(t('pleaseSelectItems'));
      return;
    }

    const isBatch = !imageToDelete;
    console.log('是否为批量删除:', isBatch);
    
    if (isBatch) {
      setIsBatchDeleting(true);
    } else {
      setIsDeleting(true);
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const itemId of itemsToDelete) {
        console.log('正在删除项目:', itemId);
        try {
          const response = await fetch(`/api/image-edit-results/${itemId}`, {
            method: 'DELETE',
          });

          console.log('删除响应状态:', response.status);
          
          if (response.ok) {
            successCount++;
            console.log('删除成功:', itemId);
          } else {
            errorCount++;
            const errorData = await response.json().catch(() => ({})) as { error?: string };
            console.error(`删除失败 ${itemId}:`, errorData);
          }
        } catch (error) {
          errorCount++;
          console.error(`删除失败 ${itemId}:`, error);
        }
      }

                    if (successCount > 0) {
        toast.success(t('deleteSuccess', { count: successCount }));
        if (errorCount > 0) {
          toast.error(t('deleteFailedWithCount', { count: errorCount }));
        }
        refetch();
        if (isBatch) {
          exitSelectMode();
        }
      } else {
        toast.error(t('deleteFailed'));
      }
      
      // 清理状态
      setSelectedItems(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error('删除失败:', error);
      toast.error(t('deleteNetworkError'));
    } finally {
      setIsDeleting(false);
      setIsBatchDeleting(false);
      onDeleteModalClose();
      setImageToDelete(null);
    }
  };

  // 结果网格
  const filteredResults = state.typeFilter === 'all'
    ? results
    : results.filter(r => r.result_type === state.typeFilter);

  // 类型过滤器
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') router.push('/gallery');
    else if (value === 'image') router.push('/gallery/images');
    else if (value === 'video') router.push('/gallery/videos');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* 标题和过滤器 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            
            {/* 多选控制按钮 */}
            {!isSelectMode ? (
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => setIsSelectMode(true)}
                className="text-xs"
              >
                {t('selectMode')}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="secondary"
                  onPress={handleSelectAll}
                  className="text-xs"
                >
                  {selectedItems.size === results.length ? t('deselectAll') : t('selectAll')}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={handleBatchDelete}
                  startContent={<Trash2 size={14} />}
                  isDisabled={selectedItems.size === 0}
                  className="text-xs"
                >
                  {t('batchDelete')} ({selectedItems.size})
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  onPress={exitSelectMode}
                  className="text-xs"
                >
                  {t('cancel')}
                </Button>
              </div>
            )}
          </div>

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
              value={typeFilter}
              onChange={handleTypeFilterChange}
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
        {!loading && !error && filteredResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Images className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">{t('noResults')}</h3>
            <p className="text-gray-500 max-w-md">{t('noResultsDescription')}</p>
          </div>
        )}

        {/* 结果网格 */}
        {!loading && filteredResults.length > 0 && (
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
            {filteredResults.map(result => (
              <GalleryCard
                key={result.id}
                result={result}
                onImageClick={handleCardClick}
                onDownload={handleDownload}
                onVideoGeneration={handleVideoGeneration}
                onDelete={handleDelete}
                formatTime={formatTime}
                isSelectMode={isSelectMode}
                isSelected={selectedItems.has(result.id)}
                onSelect={handleSelectItem}
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
      {selectedResult && selectedResult.result_type !== 'video' && (
        <ImageDetailModal
          isOpen={isOpen}
          onClose={onClose}
          imageResult={selectedResult}
          handleDownload={handleDownload}
          formatTime={formatTime}
        />
      )}
      {selectedVideoResult && selectedVideoResult.result_type === 'video' && (
        <VideoDetailModal
          isOpen={isOpen}
          onClose={() => { setSelectedVideoResult(null); onClose(); }}
          videoResult={selectedVideoResult}
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

      {/* 删除确认模态框 */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>
            {imageToDelete ? t('deleteConfirm') : t('batchDeleteConfirm')}
          </ModalHeader>
          <ModalBody>
            <p>
              {imageToDelete 
                ? t('deleteConfirmMessage') 
                : t('batchDeleteConfirmMessage', { count: selectedItems.size })
              }
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteModalClose}>
              {t('cancel')}
            </Button>
            <Button 
              color="danger" 
              onPress={confirmDelete}
              isLoading={isDeleting || isBatchDeleting}
            >
              {t('delete')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
