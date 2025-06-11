'use client';

import type { ImageEditResult } from '@/types/database';
import { Button, Card, CardBody, CardHeader, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Image, Spinner, useDisclosure } from '@heroui/react';
import { Download, ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { VideoParameterPanel } from '@/components/video-generate/VideoParameterPanel';
import { useUser } from '@/hooks/useUser';
import { createSupabaseClient } from '@/lib/supabase';

type ResultPanelProps = {
  isGenerating: boolean;
  generatedImages: string[];
  originalImageUrl?: string;
  onGenerate: () => void;
  imageEditResultId?: string; // 用于订阅数据库变化
};

const downloadImage = async (imageUrl: string, filename: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载图片失败:', error);
  }
};

export function ResultPanel({
  isGenerating,
  generatedImages,
  originalImageUrl,
  onGenerate: _onGenerate,
  imageEditResultId,
}: ResultPanelProps) {
  const t = useTranslations('resultPanel');
  const { user } = useUser();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

  const [imageEditResult, setImageEditResult] = useState<ImageEditResult | null>(null);
  const [, setIsSubscribed] = useState(false);

  // 视频生成相关状态
  const [selectedVideoType, setSelectedVideoType] = useState<'emoji' | 'liveportrait'>('emoji');
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [drivenId, setDrivenId] = useState('mengwa_kaixin');

  // 订阅 Supabase 实时更新
  useEffect(() => {
    if (!imageEditResultId) {
      return;
    }

    const supabase = createSupabaseClient();

    // 首次获取数据
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('image_edit_results')
        .select('*')
        .eq('id', imageEditResultId)
        .single();

      if (data && !error) {
        setImageEditResult(data);
      }
    };

    fetchInitialData();

    // 设置实时订阅
    const subscription = supabase
      .channel(`image_edit_result_${imageEditResultId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'image_edit_results',
          filter: `id=eq.${imageEditResultId}`,
        },
        (payload) => {
          setImageEditResult(payload.new as ImageEditResult);
        },
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [imageEditResultId]);

  // 处理视频生成
  const handleVideoGeneration = useCallback((type: 'emoji' | 'liveportrait') => {
    if (!user) {
      console.warn(t('loginRequired'));
      return;
    }

    setSelectedVideoType(type);
    // 重置状态
    setGenerateError(null);
    setAudioUrl('');
    setDrivenId('mengwa_kaixin');
    onDrawerOpen();
  }, [user, onDrawerOpen, t]);

  // 处理Drawer关闭
  const handleDrawerClose = useCallback(() => {
    onDrawerClose();
    // 重置状态
    setGenerateError(null);
    setAudioUrl('');
    setDrivenId('mengwa_kaixin');
    setIsVideoGenerating(false);
  }, [onDrawerClose]);

  // 处理视频生成
  const handleVideoGenerate = useCallback(async () => {
    if (!imageEditResult || !user) {
      return;
    }

    setIsVideoGenerating(true);
    setGenerateError(null);

    try {
      const endpoint = selectedVideoType === 'emoji'
        ? '/api/dashscope/emoji-video-generate'
        : '/api/dashscope/liveportrait-generate';

      const requestBody = selectedVideoType === 'emoji'
        ? {
            imageId: imageEditResult.id,
            drivenId,
          }
        : {
            imageId: imageEditResult.id,
            audioUrl,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result: any = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('generateFailed'));
      }

      // 生成成功，关闭抽屉
      handleDrawerClose();
    } catch (error: any) {
      setGenerateError(error.message || t('generateVideoError'));
    } finally {
      setIsVideoGenerating(false);
    }
  }, [imageEditResult, selectedVideoType, drivenId, audioUrl, user, handleDrawerClose, t]);

  return (
    <div className="h-fit">
      <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('title')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            {/* <Button
              color="secondary"
              variant="shadow"
              size="sm"
              startContent={<Wand2 className="w-4 h-4" />}
              onPause={onGenerate}
              isLoading={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {isGenerating ? '生成中...' : '开始生成'}
            </Button> */}
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {isGenerating
            ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20">
                      <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {t('generating')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                      {t('generatingDescription')}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Spinner size="sm" color="secondary" />
                  </div>
                </div>
              )
            : generatedImages.length > 0
              ? (
                  <div className="space-y-6">
                    {/* 原图与结果图对比 */}
                    {originalImageUrl && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 原图 */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t('originalImage')}
                              </h5>
                            </div>
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                              <Image
                                src={originalImageUrl}
                                alt="Original image"
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          </div>

                          {/* 结果图 */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t('generatedResult')}
                              </h5>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="secondary"
                                  startContent={<Download className="w-4 h-4" />}
                                  onPress={() => downloadImage(generatedImages[0]!, `generated-image-${Date.now()}.png`)}
                                  className="text-xs"
                                >
                                  {t('download')}
                                </Button>

                                {/* 当检测到兼容性时显示视频生成按钮 */}
                                {(imageEditResult?.emoji_compatible || imageEditResult?.liveportrait_compatible) && (
                                  <Button
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    className="text-xs bg-gradient-to-r from-blue-500/70 to-purple-500/70 text-white"
                                    onClick={() => {
                                      // 优先选择表情视频，如果不支持则选择对口型视频
                                      const videoType = imageEditResult.emoji_compatible ? 'emoji' : 'liveportrait';
                                      handleVideoGeneration(videoType);
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
                              </div>
                            </div>
                            <div className="group relative">
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                <Image
                                  src={generatedImages[0]}
                                  alt="Generated image"
                                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 多张结果图网格显示 */}
                    {generatedImages.length > 1 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {t('allResults')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {generatedImages.map((imageUrl, index) => (
                            <div key={`generated-${imageUrl}`} className="group relative">
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                <Image
                                  src={imageUrl}
                                  alt={`Generated image ${index + 1}`}
                                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Button
                                  className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                                  onPress={() => downloadImage(imageUrl, `generated-image-${index + 1}-${Date.now()}.png`)}
                                >
                                  <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                </Button>
                              </div>
                              <div className="mt-2 text-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {t('result')}
                                  {' '}
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              : (
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl" />
                      <div className="relative p-6 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm border border-blue-500/10">
                        <ImageIcon className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        {t('waitingGenerate')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                        {t('waitingDescription')}
                      </p>
                    </div>
                  </div>
                )}
        </CardBody>
      </Card>

      {/* 视频生成参数抽屉 */}
      <Drawer isOpen={isDrawerOpen} onClose={handleDrawerClose} size="lg">
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-1">
            <h4 className="text-lg font-semibold">
              {t('generateVideoTitle', { type: selectedVideoType === 'emoji' ? t('emojiVideo') : t('lipsyncVideo') })}
            </h4>
            <p className="text-sm text-gray-500">
              {t('configureParameters')}
            </p>
          </DrawerHeader>
          <DrawerBody className="px-6">
            <VideoParameterPanel
              imageData={imageEditResult}
              isLoading={false}
              isGenerating={isVideoGenerating}
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
            <Button color="danger" variant="light" onClick={handleDrawerClose}>
              {t('cancel')}
            </Button>
            <Button
              color="primary"
              variant="shadow"
              onPress={handleVideoGenerate}
              isLoading={isVideoGenerating}
              isDisabled={(() => {
                if (isVideoGenerating || !imageEditResult) {
                  return true;
                }
                if (selectedVideoType === 'emoji') {
                  return !imageEditResult.emoji_compatible;
                } else {
                  return !imageEditResult.liveportrait_compatible || !audioUrl;
                }
              })()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
            >
              {isVideoGenerating ? t('generating') : t('startGenerate')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
