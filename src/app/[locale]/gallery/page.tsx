'use client';

import type { ImageEditResult, QueryParams } from '@/types/database';
import { Button, Card, CardBody, CardFooter, CardHeader, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Spinner, useDisclosure } from '@heroui/react';
import { CheckCircle, Clock, Download, Images, Loader2, Mic, Smile, VideoIcon, Wand2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { VideoParameterPanel } from '@/components/video-generate/VideoParameterPanel';
import { useImageEditResults } from '@/hooks/useDatabase';
import { useUser } from '@/hooks/useUser';
import { prepareAnimationGeneration } from '@/lib/credits';
import { createSupabaseClient } from '@/lib/supabase';

const Xgplayer: any = dynamic(() => import('xgplayer-react'), { ssr: false });

type GalleryPageState = {
  currentPage: number;
  pageSize: number;
  statusFilter: string;
  typeFilter: string; // 'all', 'image', 'video'
};

// 图片详情模态框组件
type ImageDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageResult: ImageEditResult | null;
};

const ImageDetailModal = ({ isOpen, onClose, imageResult }: ImageDetailModalProps) => {
  const t = useTranslations('gallery');

  if (!imageResult) {
    return null;
  }

  // 获取状态显示信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: t('status.waiting') };
      case 'RUNNING':
        return { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', label: t('status.processing') };
      case 'SUCCEEDED':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: t('status.succeeded') };
      case 'FAILED':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: t('status.failed') };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: t('status.unknown') };
    }
  };

  const statusInfo = getStatusInfo(imageResult.status);
  const StatusIcon = statusInfo.icon;

  // 格式化时间
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 处理下载图片
  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{t('imageDetails')}</span>
            <div className={`px-2 py-1 rounded-lg ${statusInfo.bg} ml-2`}>
              <div className="flex items-center gap-1">
                <StatusIcon className={`w-4 h-4 ${statusInfo.color} ${imageResult.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {t('createTime')}
            :
            {' '}
            {formatTime(imageResult.created_at)}
          </div>
        </ModalHeader>

        <ModalBody>
          {/* 原图和结果图对比 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="font-medium mb-2">{t('originalImage')}</div>
              {imageResult.source_image_url && (
                <div className="relative group">
                  <Image
                    src={imageResult.source_image_url}
                    alt="原始图片"
                    className="w-full rounded-lg object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                    <Button
                      isIconOnly
                      color="default"
                      variant="flat"
                      radius="full"
                      onClick={() => handleDownload(imageResult.source_image_url || '')}
                    >
                      <Download size={20} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="font-medium mb-2">{t('generatedResult')}</div>
              {imageResult.result_image_url && imageResult.result_image_url.length > 0
                ? (
                    <div className="relative group">
                      {imageResult.result_type === 'video'
                        ? (
                            <div className="relative">
                              <Xgplayer
                                config={{
                                  url: imageResult.result_image_url[0],
                                  controls: true,
                                  muted: true,
                                  loop: true,
                                }}
                                className="w-full rounded-lg"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                                <Button
                                  isIconOnly
                                  color="default"
                                  variant="flat"
                                  radius="full"
                                  onPress={() => handleDownload(imageResult.result_image_url[0] || '')}
                                >
                                  <Download size={20} />
                                </Button>
                              </div>
                            </div>
                          )
                        : (
                            <>
                              <Image
                                src={imageResult.result_image_url[0]}
                                alt={t('generatedResult')}
                                className="w-full rounded-lg object-contain"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                                <Button
                                  isIconOnly
                                  color="default"
                                  variant="flat"
                                  radius="full"
                                  onClick={() => handleDownload(imageResult.result_image_url[0] || '')}
                                >
                                  <Download size={20} />
                                </Button>
                              </div>
                            </>
                          )}
                    </div>
                  )
                : (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">{imageResult.result_type === 'video' ? t('noResultVideo') : t('noResultImage')}</p>
                    </div>
                  )}
            </div>
          </div>

          {/* 额外的结果 */}
          {imageResult.result_image_url && imageResult.result_image_url.length > 1 && (
            <div className="mb-6">
              <div className="font-medium mb-2">{t('otherResults')}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {imageResult.result_image_url.slice(1).map((url, index) => (
                  <div key={index} className="relative group">
                    {imageResult.result_type === 'video'
                      ? (
                          <>
                            {/* <VideoPlayer
                              src={url}
                              className="w-full aspect-square rounded-lg"
                              controls={false}
                              muted
                              loop
                            /> */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                              <Button
                                isIconOnly
                                color="default"
                                variant="flat"
                                radius="full"
                                onClick={() => handleDownload(url)}
                              >
                                <Download size={20} />
                              </Button>
                            </div>
                          </>
                        )
                      : (
                          <>
                            <Image
                              src={url}
                              alt={`${t('generatedResult')} ${index + 2}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                              <Button
                                isIconOnly
                                color="default"
                                variant="flat"
                                radius="full"
                                onClick={() => handleDownload(url)}
                              >
                                <Download size={20} />
                              </Button>
                            </div>
                          </>
                        )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 表情视频生成结果 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{t('emojiVideoResult')}</span>
              <div className={`px-2 py-1 rounded-full text-xs ${
                imageResult.emoji_status === 'SUCCEEDED'
                  ? 'bg-green-100 text-green-700'
                  : imageResult.emoji_status === 'RUNNING'
                    ? 'bg-blue-100 text-blue-700'
                    : imageResult.emoji_status === 'FAILED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
              }`}
              >
                {imageResult.emoji_status === 'SUCCEEDED'
                  ? t('status.succeeded')
                  : imageResult.emoji_status === 'RUNNING'
                    ? t('status.processing')
                    : imageResult.emoji_status === 'FAILED' ? t('status.failed') : t('status.waiting')}
              </div>
            </div>
            {imageResult.emoji_status === 'SUCCEEDED' && imageResult.emoji_result_url ? (
              <div className="relative group">
                <Xgplayer
                  config={{
                    url: imageResult.emoji_result_url,
                    controls: true,
                    muted: true,
                    loop: true,
                  }}
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                  <Button
                    isIconOnly
                    color="default"
                    variant="flat"
                    radius="full"
                    onPress={() => handleDownload(imageResult.emoji_result_url || '')}
                  >
                    <Download size={20} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {imageResult.emoji_status === 'RUNNING'
                    ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )
                    : imageResult.emoji_status === 'FAILED'
                      ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )
                      : (
                          <Clock className="w-4 h-4 text-gray-500" />
                        )}
                  <span className="text-sm text-gray-600">
                    {imageResult.emoji_status === 'RUNNING'
                      ? t('messages.generatingEmoji')
                      : imageResult.emoji_status === 'FAILED'
                        ? t('messages.emojiGenerationFailed')
                        : t('messages.emojiNotStarted')}
                  </span>
                </div>
                {(imageResult.emoji_status === 'FAILED' || !imageResult.emoji_status) && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => {
                      // TODO: 实现重试逻辑
                      console.log('重试表情视频生成');
                    }}
                  >
                    {t('retry')}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 对口型视频生成结果 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{t('lipsyncVideoResult')}</span>
              <div className={`px-2 py-1 rounded-full text-xs ${
                imageResult.liveportrait_status === 'SUCCEEDED'
                  ? 'bg-green-100 text-green-700'
                  : imageResult.liveportrait_status === 'RUNNING'
                    ? 'bg-blue-100 text-blue-700'
                    : imageResult.liveportrait_status === 'FAILED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
              }`}
              >
                {imageResult.liveportrait_status === 'SUCCEEDED'
                  ? '已完成'
                  : imageResult.liveportrait_status === 'RUNNING'
                    ? '生成中'
                    : imageResult.liveportrait_status === 'FAILED' ? '失败' : '等待中'}
              </div>
            </div>

            {imageResult.liveportrait_status === 'SUCCEEDED' && imageResult.liveportrait_result_url ? (
              <div className="relative group">
                <Xgplayer
                  config={{
                    url: imageResult.liveportrait_result_url,
                    controls: true,
                    muted: true,
                    loop: true,
                  }}
                  className="w-full rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                  <Button
                    isIconOnly
                    color="default"
                    variant="flat"
                    radius="full"
                    onPress={() => handleDownload(imageResult.liveportrait_result_url || '')}
                  >
                    <Download size={20} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {imageResult.liveportrait_status === 'RUNNING'
                    ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )
                    : imageResult.liveportrait_status === 'FAILED'
                      ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )
                      : (
                          <Clock className="w-4 h-4 text-gray-500" />
                        )}
                  <span className="text-sm text-gray-600">
                    {imageResult.liveportrait_status === 'RUNNING'
                      ? t('messages.generatingLipsync')
                      : imageResult.liveportrait_status === 'FAILED'
                        ? t('messages.lipsyncGenerationFailed')
                        : t('messages.lipsyncNotStarted')}
                  </span>
                </div>
                {(imageResult.liveportrait_status === 'FAILED' || !imageResult.liveportrait_status) && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => {
                      // TODO: 实现重试逻辑
                      console.log('重试对口型视频生成');
                    }}
                  >
                    {t('retry')}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 提示词和参数信息 */}
          <div className="space-y-4">
            <Card>
              <CardBody>
                <h3 className="font-medium mb-2">编辑功能</h3>
                <p className="text-sm">{(imageResult.request_parameters as any)?.function || '未知功能'}</p>
              </CardBody>
            </Card>

            {(imageResult.request_parameters as any)?.prompt && (
              <Card>
                <CardBody>
                  <h3 className="font-medium mb-2">{t('prompt')}</h3>
                  <p className="text-sm whitespace-pre-wrap">{(imageResult.request_parameters as any).prompt}</p>
                </CardBody>
              </Card>
            )}

            {(imageResult.request_parameters as any)?.task_id && (
              <Card>
                <CardBody>
                  <h3 className="font-medium mb-2">{t('taskId')}</h3>
                  <p className="text-sm font-mono">{(imageResult.request_parameters as any).task_id}</p>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {/* 表情视频生成按钮 */}
              {imageResult && imageResult.emoji_compatible && !imageResult.emoji_result_url && (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Smile size={16} />}
                  onClick={() => {
                    onClose();
                    // 跳转到视频生成页面
                    window.open(`/video-generate?imageId=${imageResult.id}&type=emoji`, '_blank');
                  }}
                >
                  {t('generateEmojiVideo')}
                </Button>
              )}

              {/* 对口型视频生成按钮 */}
              {imageResult && imageResult.liveportrait_compatible && !imageResult.liveportrait_result_url && (
                <Button
                  color="secondary"
                  variant="flat"
                  startContent={<Mic size={16} />}
                  onClick={() => {
                    onClose();
                    // 跳转到视频生成页面
                    window.open(`/video-generate?imageId=${imageResult.id}&type=liveportrait`, '_blank');
                  }}
                >
                  {t('generateLipsyncVideo')}
                </Button>
              )}
            </div>

            <Button color="primary" variant="light" onPress={onClose}>
              {t('close')}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// 瀑布流布局组件
type MasonryGridProps = {
  children: React.ReactNode[];
  columnCount?: number;
  gap?: number;
};

const MasonryGrid = ({ children = [], columnCount = 4, gap = 24 }: MasonryGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<React.ReactNode[][]>([]);
  const [actualColumnCount, setActualColumnCount] = useState(columnCount);

  useEffect(() => {
    const updateColumns = () => {
      // 根据屏幕宽度动态调整列数
      if (typeof window !== 'undefined') {
        let newColumnCount = columnCount;
        if (window.innerWidth < 640) {
          newColumnCount = 1; // 移动设备单列
        } else if (window.innerWidth < 768) {
          newColumnCount = 2; // 平板设备两列
        } else if (window.innerWidth < 1280) {
          newColumnCount = 3; // 小屏幕设备三列
        }
        setActualColumnCount(newColumnCount);
      }
    };

    // 初始化时更新列数
    updateColumns();

    // 添加窗口大小变化监听
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columnCount]);

  useEffect(() => {
    // 确保children存在且是数组
    const childrenArray = Array.isArray(children) ? children : [];

    if (childrenArray.length > 0) {
      // 将子元素分配到各列中
      const cols: React.ReactNode[][] = Array.from({ length: actualColumnCount }, () => []);

      // 简单地按顺序分配，将每个子元素添加到高度最小的列中
      childrenArray.forEach((child, index) => {
        const columnIndex = index % actualColumnCount;
        cols[columnIndex].push(child);
      });

      setColumns(cols);
    } else {
      setColumns([]);
    }
  }, [children, actualColumnCount]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${actualColumnCount}, 1fr)`, gap: `${gap}px` }}
    >
      {columns.map((column, index) => (
        <div key={index} className="flex flex-col gap-6">
          {column}
        </div>
      ))}
    </div>
  );
};

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [state, setState] = useState<GalleryPageState>({
    currentPage: 1,
    pageSize: 24, // 增加了默认显示数量，更适合瀑布流
    statusFilter: 'all',
    typeFilter: 'all',
  });

  // 选中的图片结果
  const [selectedResult, setSelectedResult] = useState<ImageEditResult | null>(null);

  // 动画生成加载状态
  const [animationLoading, setAnimationLoading] = useState<{ [key: string]: boolean }>({});

  // 模态框控制
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Drawer控制
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [selectedVideoType, setSelectedVideoType] = useState<'emoji' | 'liveportrait'>('emoji');
  const [selectedImageForVideo, setSelectedImageForVideo] = useState<ImageEditResult | null>(null);

  // 视频生成参数状态
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [drivenId, setDrivenId] = useState<string>('mengwa_kaixin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // 修复后（正确）
  const [_realtimeResults, setRealtimeResults] = useState<ImageEditResult[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

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

  // Supabase 实时订阅
  useEffect(() => {
    if (!user?.id || isSubscribed) {
      return;
    }

    const supabase = createSupabaseClient();

    const channel = supabase
      .channel('image_edit_results_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'image_edit_results',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.warn('实时数据变化:', payload);

          // 根据事件类型处理数据
          if (payload.eventType === 'INSERT') {
            const newResult = payload.new as ImageEditResult;
            setRealtimeResults(prev => [newResult, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedResult = payload.new as ImageEditResult;
            setRealtimeResults(prev =>
              prev.map(item => item.id === updatedResult.id ? updatedResult : item),
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setRealtimeResults(prev => prev.filter(item => item.id !== deletedId));
          }

          // 刷新数据
          refetch();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          console.warn('已订阅实时数据更新');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [user?.id, isSubscribed, refetch]);

  // 处理分页
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  // 处理状态筛选
  const handleStatusFilter = useCallback((status: string) => {
    setState(prev => ({ ...prev, statusFilter: status, currentPage: 1 }));
  }, []);

  // 处理类型筛选
  const handleTypeFilter = useCallback((type: string) => {
    setState(prev => ({ ...prev, typeFilter: type, currentPage: 1 }));
  }, []);

  // 处理卡片点击，打开详情模态框
  const handleCardClick = useCallback((result: ImageEditResult) => {
    setSelectedResult(result);
    onOpen();
  }, [onOpen]);

  // 获取状态显示信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: t('status.waiting') };
      case 'RUNNING':
        return { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', label: t('status.processing') };
      case 'SUCCEEDED':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: t('status.succeeded') };
      case 'FAILED':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: t('status.failed') };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: t('status.unknown') };
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 处理视频生成
  const handleVideoGeneration = useCallback((result: ImageEditResult, type: 'emoji' | 'liveportrait') => {
    if (!user) {
      console.warn('请先登录，您需要登录后才能使用此功能');
      return;
    }

    setSelectedImageForVideo(result);
    setSelectedVideoType(type);
    // 重置状态
    setGenerateError(null);
    setAudioUrl('');
    setDrivenId('mengwa_kaixin');
    onDrawerOpen();
  }, [user, onDrawerOpen]);

  // 处理Drawer关闭
  const handleDrawerClose = useCallback(() => {
    onDrawerClose();
    // 重置状态
    setSelectedImageForVideo(null);
    setGenerateError(null);
    setAudioUrl('');
    setDrivenId('mengwa_kaixin');
    setIsGenerating(false);
  }, [onDrawerClose]);

  // 处理视频生成
  const handleVideoGenerate = useCallback(async () => {
    if (!selectedImageForVideo || !user) {
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const endpoint = selectedVideoType === 'emoji'
        ? '/api/dashscope/emoji-video-generate'
        : '/api/dashscope/liveportrait-generate';

      const requestBody = selectedVideoType === 'emoji'
        ? {
            imageId: selectedImageForVideo.id,
            drivenId,
          }
        : {
            imageId: selectedImageForVideo.id,
            audioUrl,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '生成失败');
      }

      // 生成成功，关闭抽屉并刷新数据
      handleDrawerClose();
      refetch();
    } catch (error: any) {
      setGenerateError(error.message || '生成视频时出现错误');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedImageForVideo, selectedVideoType, drivenId, audioUrl, user, handleDrawerClose, refetch]);

  // 处理动画生成
  const handleAnimationGeneration = useCallback(async (result: ImageEditResult) => {
    if (!user) {
      console.warn('请先登录，您需要登录后才能使用此功能');
      return;
    }

    // 设置对应的图片为加载状态
    setAnimationLoading(prev => ({ ...prev, [result.id]: true }));

    try {
      // 验证积分并扣除
      const animationType = 'liveportrait_animation';
      const { canProceed, message, creditCost, transactionId } = await prepareAnimationGeneration(
        user.id,
        result,
        animationType,
      );

      if (!canProceed) {
        console.warn(`积分不足: ${message}`);
        return;
      }

      // TODO: 调用实际的动画生成API
      console.warn('开始生成动画，交易ID:', transactionId, '消耗积分:', creditCost);

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.warn('动画生成请求已发送，稍后可在此页面查看结果');
    } catch (error: any) {
      console.warn(`操作失败: ${error.message || '生成动画时出现错误'}`);
    } finally {
      // 清除加载状态
      setAnimationLoading((prev) => {
        const newState = { ...prev };
        delete newState[result.id];
        return newState;
      });
    }
  }, [user]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">请先登录</h2>
          <p className="text-gray-600 dark:text-gray-400">您需要登录后才能查看生成内容</p>
        </div>
      </div>
    );
  }

  // 创建瀑布流布局所需的子元素数组
  const galleryItems = results.map((result) => {
    const statusInfo = getStatusInfo(result.status);
    const _StatusIcon = statusInfo.icon;

    return (
      <Card
        key={result.id}
        isPressable
        isFooterBlurred
        className="w-full col-span-12 sm:col-span-5"
        onPress={() => handleCardClick(result)}
      >
        <CardHeader className="absolute z-11 top-1 flex-col items-start">
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {/* 兼容性标签 */}
            <div className="flex gap-1">
              {result.emoji_compatible && (
                <div className="bg-blue-500/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  表情动画
                </div>
              )}
              {result.liveportrait_compatible && (
                <div className="bg-purple-500/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  口型匹配
                </div>
              )}
            </div>

            {/* 视频生成状态标签 */}
            <div className="flex flex-col gap-1">
              {result.emoji_status && result.emoji_status !== 'PENDING' && (
                <div className={`text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm ${
                  result.emoji_status === 'SUCCEEDED'
                    ? 'bg-green-500/80'
                    : result.emoji_status === 'RUNNING'
                      ? 'bg-blue-500/80'
                      : 'bg-red-500/80'
                }`}
                >
                  <div className="flex items-center gap-1">
                    <Smile size={10} />
                    {result.emoji_status === 'SUCCEEDED'
                      ? '表情完成'
                      : result.emoji_status === 'RUNNING' ? '表情生成中' : '表情失败'}
                  </div>
                </div>
              )}

              {result.liveportrait_status && result.liveportrait_status !== 'PENDING' && (
                <div className={`text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm ${
                  result.liveportrait_status === 'SUCCEEDED'
                    ? 'bg-green-500/80'
                    : result.liveportrait_status === 'RUNNING'
                      ? 'bg-purple-500/80'
                      : 'bg-red-500/80'
                }`}
                >
                  <div className="flex items-center gap-1">
                    <Mic size={10} />
                    {result.liveportrait_status === 'SUCCEEDED'
                      ? t('lipsyncCompleted')
                      : result.liveportrait_status === 'RUNNING' ? t('lipsyncGenerating') : t('lipsyncFailed')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        {result.result_type === 'video'
          ? (
              <div className="relative w-full aspect-video">
                {/* <VideoPlayer
                  src={result.result_image_url[0]}
                  className="w-full h-full"
                  controls={false}
                  muted
                  loop
                /> */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <VideoIcon className="w-12 h-12 text-white/80" />
                </div>
              </div>
            )
          : (
              <Image
                src={result.result_image_url[0]}
                alt={t('generatedResult')}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}

        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100 py-1 px-2">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-white text-md font-semibold">
                {(result.request_parameters as any)?.function || t('unknownFunction')}
              </p>
              <div className="flex gap-1">
                {/* 视频生成按钮 - 检测到可以生成表情视频或口型视频时显示 */}
                {result.result_type === 'image' && result.status === 'SUCCEEDED'
                && (result.emoji_compatible || result.liveportrait_compatible) && (
                  <Button
                    variant="flat"
                    color="primary"
                    size="sm"
                    className="text-tiny text-white bg-gradient-to-r from-blue-500/70 to-purple-500/70 flex items-center justify-center h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      // 优先选择表情视频，如果不支持则选择对口型视频
                      const videoType = result.emoji_compatible ? 'emoji' : 'liveportrait';
                      handleVideoGeneration(result, videoType);
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <div className="animate-bounce">
                        <Wand2 size={12} />
                      </div>
                      {t('makeItMove')}
                    </div>
                  </Button>
                )}

                {/* {result.status === 'SUCCEEDED' && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="default"
                    className="text-tiny text-white bg-white/20"
                  >
                    <Eye size={16} />
                  </Button>
                )} */}
              </div>
            </div>
            <div className="flex justify-start w-full">
              <p className="text-white/70 text-xs">
                {formatTime(result.created_at)}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* 标题区域 */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('myGeneratedContent')}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('viewAllResults')}
                  {' '}
                  {isSubscribed && `• ${t('realTimeUpdates')}`}
                </p>
              </div>
            </div>

            {/* 筛选器 */}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto p-6">
        {loading
          ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" color="primary" />
              </div>
            )
          : error
            ? (
                <div className="text-center py-12">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('loadFailed')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                  <Button
                    onClick={refetch}
                    color="primary"
                    variant="solid"
                  >
                    {t('retry')}
                  </Button>
                </div>
              )
            : results.length === 0
              ? (
                  <div className="text-center py-12">
                    <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noContent')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t('noContentDescription')}</p>
                  </div>
                )
              : (
                  <>
                    {/* 瀑布流布局 */}
                    <div className="mb-4">
                      <MasonryGrid columnCount={4} gap={8}>
                        {galleryItems}
                      </MasonryGrid>
                    </div>

                    {/* 分页控件 */}
                    {pagination.totalPages > 1 && (
                      <div className="flex justify-center">
                        <Pagination
                          total={pagination.totalPages}
                          page={state.currentPage}
                          onChange={handlePageChange}
                          showControls
                          showShadow
                          color="primary"
                          size="md"
                          className="gap-2"
                        />
                      </div>
                    )}

                    {/* 统计信息 */}
                    <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                      {t('pagination.total', { total: pagination.total, current: state.currentPage, totalPages: pagination.totalPages })}
                    </div>
                  </>
                )}
      </div>

      {/* 图片详情模态框 */}
      <ImageDetailModal
        isOpen={isOpen}
        onClose={onClose}
        imageResult={selectedResult}
      />

      {/* 视频生成参数抽屉 */}
      <Drawer isOpen={isDrawerOpen} onClose={handleDrawerClose} size="lg">
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-1">
            <h4 className="text-lg font-semibold">
              {t('generateVideoTitle', { type: selectedVideoType === 'emoji' ? t('emoji') : t('lipsync') })}
            </h4>
            <p className="text-sm text-gray-500">
              {t('configureAndGenerate')}
            </p>
          </DrawerHeader>
          <DrawerBody className="px-6">
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
            />
          </DrawerBody>
          <DrawerFooter>
            <Button color="danger" variant="light" onPress={handleDrawerClose}>
              {t('cancel')}
            </Button>
            <Button
              color="primary"
              variant="shadow"
              onPress={handleVideoGenerate}
              isLoading={isGenerating}
              isDisabled={(() => {
                if (isGenerating || !selectedImageForVideo) {
                  return true;
                }
                if (selectedVideoType === 'emoji') {
                  return !selectedImageForVideo.emoji_compatible;
                } else {
                  return !selectedImageForVideo.liveportrait_compatible || !audioUrl;
                }
              })()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
            >
              {isGenerating ? t('generating') : t('startGenerate')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
