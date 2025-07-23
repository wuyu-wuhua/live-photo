'use client';

import { Button, Card, CardBody, CardFooter, CardHeader, Image, Spinner, Tooltip } from '@heroui/react';
import { Download, RefreshCw, Share2, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type VideoResultPanelProps = {
  isGenerating: boolean;
  videoUrl: string;
  imageUrl: string;
  videoType: 'emoji' | 'liveportrait';
  creditsConsumed?: number;
  onGenerate: () => void;
};

export function VideoResultPanel({
  isGenerating,
  videoUrl,
  imageUrl,
  videoType,
  creditsConsumed,
  onGenerate,
}: VideoResultPanelProps) {
  const t = useTranslations('videoResult');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video play/pause
  const togglePlay = () => {
    if (!videoRef.current) {
      return;
    }

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle video download
  const handleDownload = () => {
    if (!videoUrl) {
      return;
    }

    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `ai-video-${new Date().getTime()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle video sharing
  const handleShare = async () => {
    if (!videoUrl) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('shareTitle'),
          text: t('shareText'),
          url: videoUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Copy link to clipboard
      navigator.clipboard.writeText(videoUrl)
        .then(() => toast.success(t('linkCopied')))
        .catch(err => console.error('Copy failed:', err));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Video display area */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden relative">
        {isGenerating
          ? (
              <div className="text-center space-y-4">
                <Spinner size="lg" color="primary" />
                <p className="text-gray-600 dark:text-gray-400">
                  {videoType === 'emoji' ? t('generatingEmoji') : t('generatingLipsync')}
                </p>
              </div>
            )
          : videoUrl
            ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="relative max-w-full max-h-full"
                    onClick={togglePlay}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        togglePlay();
                      }
                    }}
                  >
                    <video
                      ref={videoRef}
                      // 移除crossOrigin属性，这可能是导致CORS问题的原因
                      // crossOrigin="anonymous"
                      src={videoUrl}
                      className="max-w-full max-h-[70vh] rounded-lg shadow-lg cursor-pointer"
                      controls
                      autoPlay
                      loop
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={e => console.error('Video error:', e)}
                    >
                      {/* 添加多种格式支持 */}
                      <source src={videoUrl} type="video/mp4" />
                      <track kind="captions" src="" label="Captions" />
                    </video>
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                        <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-blue-600 border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            : imageUrl
              ? (
                  <div className="text-center space-y-4">
                    <div className="relative w-64 h-64 mx-auto overflow-hidden rounded-lg">
                      <Image
                        src={imageUrl}
                        alt="Reference image"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <p className="text-white text-lg font-medium">Waiting for video generation</p>
                      </div>
                    </div>
                    <Button
                      color="primary"
                      variant="shadow"
                      size="lg"
                      startContent={<Wand2 className="w-4 h-4" />}
                      onClick={onGenerate}
                      className="mt-4"
                    >
                      Start Generation
                    </Button>
                  </div>
                )
              : (
                  <div className="text-center p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Please select an image and set parameters first
                    </p>
                  </div>
                )}
      </div>

      {/* Action buttons area */}
      {videoUrl && (
        <Card className="mt-4">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {videoType === 'emoji' ? 'Emoji Video' : 'Lipsync Video'}
              </h3>
              {creditsConsumed !== undefined && (
                <div className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                  Consumed
                  {' '}
                  {creditsConsumed}
                  {' '}
                  credits
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {videoType === 'emoji'
                ? 'Dynamic emoji video generated based on the selected emoji template'
                : 'Lipsync video generated based on the uploaded audio'}
            </p>
          </CardBody>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Tooltip content="Download video">
                <Button
                  isIconOnly
                  variant="flat"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Share video">
                <Button
                  isIconOnly
                  variant="flat"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
            <Tooltip content="Regenerate">
              <Button
                isIconOnly
                variant="flat"
                color="primary"
                onClick={onGenerate}
                isDisabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </Tooltip>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
