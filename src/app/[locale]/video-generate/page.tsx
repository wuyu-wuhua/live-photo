'use client';

import type { ImageEditResult } from '@/types/database';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { VideoIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { VideoParameterPanel } from '@/components/video-generate/VideoParameterPanel';
import { VideoResultPanel } from '@/components/video-generate/VideoResultPanel';
import { useCredits } from '@/hooks/useCredits';
import { useUser } from '@/hooks/useUser';
import { ImageEditService } from '@/services/databaseService';

export default function VideoGeneratePage() {
  const searchParams = useSearchParams();
  const imageId = searchParams.get('imageId');
  const { user } = useUser();
  const { credits, loading: creditsLoading, refresh: refreshCredits, hasEnoughCredits } = useCredits();

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageEditResult | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('');
  const [videoType, setVideoType] = useState<'emoji' | 'liveportrait'>('emoji');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [drivenId, setDrivenId] = useState<string>('mengwa_kaixin');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [creditsConsumed, setCreditsConsumed] = useState<number | undefined>(undefined);

  // Get image data
  useEffect(() => {
    async function fetchImageData() {
      if (!imageId) {
        setError('Missing image ID parameter');
        toast.error('Missing image ID parameter');
        setIsLoading(false);
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
        setIsLoading(false);
      }
    }

    fetchImageData();
  }, [imageId]);

  // Handle video type change
  const handleVideoTypeChange = (type: 'emoji' | 'liveportrait') => {
    setVideoType(type);
    // Update required credits - fixed at 3 credits for all video types
    setRequiredCredits(3);
  };

  // Handle audio URL change
  const handleAudioUrlChange = (url: string) => {
    setAudioUrl(url);
  };

  // Handle emoji template ID change
  const handleDrivenIdChange = (id: string) => {
    setDrivenId(id);
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
  const currentHasEnoughCredits = () => {
    if (!user) {
      return false;
    }
    // Fixed cost at 3 credits for all video types
    const cost = 3;
    return hasEnoughCredits(cost);
  };

  // Generate video
  const handleGenerate = async () => {
    if (!imageData) {
      return;
    }

    // Check if credits are sufficient
    if (!checkCredits()) {
      return;
    }

    setIsGenerating(true);
    setError(null);

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
        data: { videoUrl: string };
        error: any;
        credits_consumed?: number;
      };

      if (success && data?.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
        setCreditsConsumed(credits_consumed);
        toast.success(`Video generated successfully${credits_consumed ? `, consumed ${credits_consumed} credits` : ''}`);
        // Refresh credits
        refreshCredits();
      } else {
        throw new Error(error || 'Generation failed');
      }
    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error(err instanceof Error ? err.message : 'Error generating video');
    } finally {
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
            <div className="h-full overflow-y-auto p-4">
              <VideoParameterPanel
                imageData={imageData}
                isLoading={isLoading}
                isGenerating={isGenerating}
                error={error}
                videoType={videoType}
                audioUrl={audioUrl}
                drivenId={drivenId}
                hasEnoughCredits={currentHasEnoughCredits()}
                onVideoTypeChange={handleVideoTypeChange}
                onAudioUrlChange={handleAudioUrlChange}
                onDrivenIdChange={handleDrivenIdChange}
                onGenerate={handleGenerate}
              />
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
                onGenerate={handleGenerate}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Insufficient credits modal */}
      <Modal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} size="md">
        <ModalContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg">
          <ModalHeader className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">Insufficient Credits</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">You don't have enough credits to generate the video</p>
          </ModalHeader>
          <ModalBody className="pb-6 pt-4">
            <div className="space-y-4">
              <p className="text-sm">
                Current Balance:
                {' '}
                <span className="font-medium">
                  {credits?.balance || 0}
                  {' '}
                  Credits
                </span>
              </p>
              <p className="text-sm">
                Required Credits:
                {' '}
                <span className="font-medium text-blue-600">
                  {requiredCredits}
                  {' '}
                  Credits
                </span>
              </p>
              <p className="text-sm">
                Difference:
                {' '}
                <span className="font-medium text-red-500">
                  {Math.max(0, requiredCredits - (credits?.balance || 0))}
                  {' '}
                  Credits
                </span>
              </p>
              <div className="pt-2">
                <Button
                  color="primary"
                  className="w-full"
                  onPress={() => {
                    setShowCreditModal(false);
                    // Here can redirect to recharge page
                    window.location.href = '/credits';
                  }}
                >
                  Go to Recharge
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
