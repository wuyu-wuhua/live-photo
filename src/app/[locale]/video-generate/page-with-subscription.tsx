'use client';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { VideoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { VideoGeneratePanel } from '@/components/video-generate/VideoGeneratePanel';
import { VideoParameterPanel } from '@/components/video-generate/VideoParameterPanel';
import { VideoResultPanel } from '@/components/video-generate/VideoResultPanel';
import { useCredits } from '@/hooks/useCredits';
import { createSupabaseClient } from '@/lib/supabase';
import { useImageEditStatusSubscription } from '@/hooks/useSupabaseSubscription';
import { useUser } from '@/hooks/useUser';
import type { ImageEditResult, TaskStatus } from '@/types/database';
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
  // 只保留 videoType，不要 setVideoType
  const [videoType] = useState<'emoji' | 'liveportrait'>('emoji');
  const [audioUrl] = useState<string>('');
  const [drivenId] = useState<string>('mengwa_kaixin');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [creditsConsumed, setCreditsConsumed] = useState<number | undefined>(undefined);

  // 新增状态用于跟踪生成任务
  const [generationTaskId, setGenerationTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);

  // 新增：展示询问相关状态
  const { isOpen: isShowcaseModalOpen, onOpen: onShowcaseModalOpen, onClose: onShowcaseModalClose } = useDisclosure();
  const [pendingShowcaseId, setPendingShowcaseId] = useState<string | null>(null);

  // 使用Supabase实时订阅替代轮询
  const { isSubscribed, error: subscriptionError } = useImageEditStatusSubscription(
    generationTaskId || '',
    (updatedTask) => {
      // 当任务状态更新时的回调
      if (!updatedTask) {
        return;
      }

      setTaskStatus(updatedTask.status);

      // 如果任务成功完成
      if (updatedTask.status === 'SUCCEEDED') {
        // 获取视频URL
        if (videoType === 'emoji' && updatedTask.emoji_result_url) {
          setGeneratedVideoUrl(updatedTask.emoji_result_url);
        } else if (videoType === 'liveportrait' && updatedTask.liveportrait_result_url) {
          setGeneratedVideoUrl(updatedTask.liveportrait_result_url);
        }

        setIsGenerating(false);
        toast.success('Video generated successfully');
        refreshCredits();

        // 显示展示询问弹框
        setPendingShowcaseId(updatedTask.id);
        onShowcaseModalOpen();
      } else if (updatedTask.status === 'FAILED') {
        const errorMessage = videoType === 'emoji'
          ? updatedTask.emoji_message || 'Video generation failed'
          : updatedTask.liveportrait_message || 'Video generation failed';

        setError(errorMessage);
        setIsGenerating(false);
        toast.error(errorMessage);
      }
    },
  );

  // 如果订阅出错，显示错误信息
  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      toast.error(`Failed to subscribe to task updates: ${subscriptionError}`);
    }
  }, [subscriptionError]);

  // 当订阅状态变化时记录日志
  useEffect(() => {
    if (generationTaskId) {
      console.warn(`Subscription status for task ${generationTaskId}: ${isSubscribed ? 'active' : 'inactive'}`);
    }
  }, [isSubscribed, generationTaskId]);

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
      } finally {
        // setIsLoading(false); // 未使用，移除
      }
    }

    fetchImageData();
  }, [imageId]);

  // 处理展示选择
  const handleShowcaseChoice = async (accept: boolean) => {
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

  // Check if current video type has enough credits

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

      const { success, data, error, credits_consumed, imageId: taskId } = await response.json() as {
        success: boolean;
        data: { videoUrl: string };
        error: any;
        credits_consumed?: number;
        imageId?: string;
      };

      if (success) {
        if (taskId) {
          // 如果获得了任务ID，设置任务ID以启动订阅
          setGenerationTaskId(taskId);
          toast.info('Video generation started. Please wait...');

          // 立即获取一次任务状态，以防订阅延迟
          const taskResponse = await ImageEditService.getById(taskId);
          if (taskResponse.success && taskResponse.data) {
            setTaskStatus(taskResponse.data.status);
          }
        } else if (data?.videoUrl) {
          // 如果直接获得了视频URL（立即结果）
          setGeneratedVideoUrl(data.videoUrl);
          setCreditsConsumed(credits_consumed);
          toast.success(`Video generated successfully${credits_consumed ? `, consumed ${credits_consumed} credits` : ''}`);
          // 刷新积分
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
                  让图片动起来
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  让你的照片动起来
                </p>
              </div>
            </div>

            {/* Credits display */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 rounded-lg backdrop-blur-sm shadow-sm border border-slate-200 dark:border-slate-700">
                {/* <WalletModal className="w-4 h-4 text-slate-700 dark:text-slate-300" /> */}
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
            <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">{t('common.insufficientCredits')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('common.notEnoughCredits')}</p>
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

      {/* 在主内容区下方添加底部操作区（如无则补充）： */}
      <div className="flex justify-end gap-4 px-8 py-6 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 sticky bottom-0 z-20">
        <Button color="default" variant="light" onClick={() => window.history.back()}>
          {t('common.cancel')}
        </Button>
        <Button color="primary" onClick={generateVideo} disabled={!imageData || isGenerating}>
          {isGenerating ? t('common.generating') : t('common.startGenerate')}
        </Button>
      </div>
    </div>
  );
}
