'use client';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { VideoIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { VideoGeneratePanel } from '@/components/video-generate/VideoGeneratePanel';
import { VideoParameterPanel } from '@/components/video-generate/VideoParameterPanel';
import { VideoResultPanel } from '@/components/video-generate/VideoResultPanel';
import { useCredits } from '@/hooks/useCredits';
import type { ImageEditResult, TaskStatus } from '@/types/database';
import { useUser } from '@/hooks/useUser';
import { createSupabaseClient } from '@/lib/supabase';
import { ImageEditService } from '@/services/databaseService';

export default function VideoGeneratePage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const imageId = searchParams.get('imageId');
  const { user } = useUser();
  const { credits, loading: creditsLoading, refresh: refreshCredits, hasEnoughCredits } = useCredits();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageEditResult | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('');
  const [videoType] = useState<'emoji' | 'liveportrait'>('emoji');
  const [audioUrl] = useState<string>('');
  const [drivenId] = useState<string>('mengwa_kaixin');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [creditsConsumed, setCreditsConsumed] = useState<number | undefined>(undefined);

  // 新增状态用于跟踪生成任务
  const [generationTaskId, setGenerationTaskId] = useState<string | null>(null);

  // 新增：展示询问相关状态
  const { isOpen: isShowcaseModalOpen, onOpen: onShowcaseModalOpen, onClose: onShowcaseModalClose } = useDisclosure();
  const [pendingShowcaseId, setPendingShowcaseId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef<number>(0);
  const MAX_POLLING_COUNT = 60; // 最大轮询次数，防止无限轮询

  // Get image data
  useEffect(() => {
    async function fetchImageData() {
      if (!imageId) {
        setError('Missing image ID parameter');
        toast.error('Missing image ID parameter');
        return;
      }

      try {
        const response = await ImageEditService.getById(imageId);
        if (response.success && response.data) {
          setImageData(response.data);
        } else {
          setError('Failed to get image data');
          toast.error('Failed to get image data');
        }
      } catch (err) {
        setError('Error while retrieving image data');
        toast.error('Error while retrieving image data');
        console.error(err);
      }
    }

    fetchImageData();
  }, [imageId]);

  // 轮询检查视频生成任务状态
  const pollTaskStatus = async (taskId: string) => {
    if (!taskId) {
      return;
    }

    try {
      const response = await ImageEditService.getById(taskId);
      if (response.success && response.data) {
        const taskData = response.data;
        setTaskStatus(taskData.status);

        // 如果任务成功完成
        if (taskData.status === 'SUCCEEDED') {
          // 停止轮询
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // 获取视频URL
          if (videoType === 'emoji' && taskData.emoji_result_url) {
            setGeneratedVideoUrl(taskData.emoji_result_url);
          } else if (videoType === 'liveportrait' && taskData.liveportrait_result_url) {
            setGeneratedVideoUrl(taskData.liveportrait_result_url);
          }

          setIsGenerating(false);
          toast.success('Video generated successfully');
          refreshCredits();

          // 显示展示询问弹框
          setPendingShowcaseId(taskId);
          onShowcaseModalOpen();
        } else if (taskData.status === 'FAILED') {
          // 停止轮询
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          const errorMessage = videoType === 'emoji'
            ? taskData.emoji_message || 'Video generation failed'
            : taskData.liveportrait_message || 'Video generation failed';

          setError(errorMessage);
          setIsGenerating(false);
          toast.error(errorMessage);
        } else {
          pollingCountRef.current += 1;

          // 如果超过最大轮询次数，停止轮询
          if (pollingCountRef.current >= MAX_POLLING_COUNT) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            setError('Video generation is taking too long. Please check back later.');
            setIsGenerating(false);
            toast.error('Video generation is taking too long. Please check back later.');
          }
        }
      }
    } catch (err) {
      // 不再打印 console
    }
  };

  // 启动轮询
  const startPolling = (taskId: string) => {
    // 重置轮询计数
    pollingCountRef.current = 0;

    // 清除之前的轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // 立即执行一次
    pollTaskStatus(taskId);

    // 设置轮询间隔
    pollingIntervalRef.current = setInterval(() => {
      pollTaskStatus(taskId);
    }, 3000); // 每3秒轮询一次
  };

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // 处理展示选择
  const handleShowcaseChoice = async (accept: boolean) => {
    console.log('handleShowcaseChoice called with:', accept, 'pendingShowcaseId:', pendingShowcaseId);
    if (!pendingShowcaseId) {
      return;
    }

    try {
      const supabase = createSupabaseClient();
      await supabase
        .from('image_edit_results')
        .update({ is_showcase: accept })
        .eq('id', pendingShowcaseId);

      onShowcaseModalClose();
      setPendingShowcaseId(null);

      if (accept) {
        toast.success('作品已添加到展示页面');
      } else {
        toast.success('作品已设置为不展示');
      }
    } catch (error) {
      console.error('更新展示状态失败:', error);
      toast.error('更新展示状态失败');
    }
  };

  // Check if credits are sufficient
  const checkCredits = () => {
    if (!user) {
      toast.error('Please login first');
      return false;
    }

    // Fixed cost at 3 credits for all video types
    const cost = 3;
    setRequiredCredits(cost);

    if (!hasEnoughCredits(cost)) {
      setShowCreditModal(true);
      return false;
    }

    return true;
  };

  // Generate video
  const generateVideo = async () => {
    if (!imageData) {
      return;
    }

    // Check if credits are sufficient
    if (!checkCredits()) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl('');
    setTaskStatus(null);
    setGenerationTaskId(null);

    try {
      let response;

      if (videoType === 'emoji') {
        // Generate emoji video
        response = await fetch('/api/dashscope/emoji-video-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageId: imageData.id,
            drivenId,
          }),
        });
      } else {
        // Generate lipsync video
        if (!audioUrl) {
          throw new Error('Please upload an audio file first');
        }

        response = await fetch('/api/dashscope/liveportrait-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageId: imageData.id,
            audioUrl,
          }),
        });
      }

      if (response.status === 402) {
        throw new Error('Insufficient credits, please recharge and try again');
      }

      const { success, data, error, credits_consumed } = await response.json() as {
        success: boolean;
        data: { videoUrl?: string; imageId?: string; message?: string };
        error: any;
        credits_consumed?: number;
      };

      // 从data对象中获取taskId
      const taskId = data?.imageId;

      if (success) {
        if (taskId) {
          // If we got a task ID, start polling for status
          setGenerationTaskId(taskId);
          startPolling(taskId);
          toast.info('Video generation started. Please wait...');
        } else if (data?.videoUrl) {
          // If we got a direct video URL (immediate result)
          setGeneratedVideoUrl(data.videoUrl);
          setCreditsConsumed(credits_consumed);
          toast.success(`Video generated successfully${credits_consumed ? `, consumed ${credits_consumed} credits` : ''}`);
          // Refresh credits
          refreshCredits();
          setIsGenerating(false);
        } else {
          throw new Error('No video URL or task ID returned');
        }
      } else {
        throw new Error(error || 'Generation failed');
      }
    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error(err instanceof Error ? err.message : 'Error generating video');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Title area */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm">
                <VideoIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Video Generation
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Intelligent Video Processing and Generation Platform
                </p>
              </div>
            </div>

            {/* Credits display */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium">
                  {creditsLoading ? '...' : credits?.balance || 0}
                  {' '}
                  Credits
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto p-4">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-[calc(100vh-120px)] rounded-lg border"
        >
          {/* Left parameter panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="h-full overflow-y-auto p-4 space-y-4">
              <VideoParameterPanel
                referenceImage={imageData?.source_image_url || ''}
              />

              {/* 添加任务状态面板 */}
              {generationTaskId && (
                <VideoGeneratePanel
                  isGenerating={isGenerating}
                  videoUrl={generatedVideoUrl}
                  onRetry={generateVideo}
                  taskStatus={taskStatus || 'PENDING'}
                  errorMessage={error}
                />
              )}
            </div>
          </ResizablePanel>

          {/* Drag divider */}
          <ResizableHandle withHandle />

          {/* Right result display area */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full overflow-y-auto p-4">
              <VideoResultPanel
                isGenerating={isGenerating}
                videoUrl={generatedVideoUrl}
                imageUrl={imageData?.source_image_url || ''}
                videoType={videoType}
                creditsConsumed={creditsConsumed}
                onGenerate={generateVideo}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Insufficient credits modal */}
      <Modal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} size="md">
        <ModalContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg">
          <ModalHeader className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
              {t('common.insufficientCredits')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('common.notEnoughCredits')}
            </p>
          </ModalHeader>
          <ModalBody className="pb-6 pt-4">
            <div className="space-y-4">
              <p className="text-sm">
                {t('common.currentBalance')}
                :
                {' '}
                <span className="font-medium">
                  {credits?.balance || 0}
                  {' '}
                  {t('common.credits')}
                </span>
              </p>
              <p className="text-sm">
                {t('common.requiredCredits')}
                :
                {' '}
                <span className="font-medium text-blue-600">
                  {requiredCredits}
                  {' '}
                  {t('common.credits')}
                </span>
              </p>
              <p className="text-sm">
                {t('common.difference')}
                :
                {' '}
                <span className="font-medium text-red-500">
                  {Math.max(0, requiredCredits - (credits?.balance || 0))}
                  {' '}
                  {t('common.credits')}
                </span>
              </p>
              <div className="pt-2">
                <Button
                  color="primary"
                  className="w-full"
                  onPress={() => {
                    setShowCreditModal(false);
                    // Here can redirect to recharge page
                    window.location.href = '/pricing';
                  }}
                >
                  {t('common.goToRecharge')}
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 作品展示询问弹框 */}
      <Modal isOpen={isShowcaseModalOpen} onClose={onShowcaseModalClose} size="md">
        <ModalContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg">
          <ModalHeader className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
              是否将该视频展示到"作品展示"页面？
            </h3>
          </ModalHeader>
          <ModalBody className="pb-6 pt-4">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                您可以随时在"我的作品"页面修改展示状态。
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="flex gap-2">
            <Button color="primary" onPress={() => handleShowcaseChoice(true)}>
              展示
            </Button>
            <Button color="default" variant="light" onPress={() => handleShowcaseChoice(false)}>
              不展示
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
