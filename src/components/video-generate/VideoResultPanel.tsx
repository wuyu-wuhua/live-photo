'use client';

import { Button, Card, CardBody, CardFooter, CardHeader, Image, Spinner, Tooltip } from '@heroui/react';
import { Download, RefreshCw, Share2, Wand2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type VideoResultPanelProps = {
  isGenerating: boolean;
  videoUrl: string;
  imageUrl: string;
  videoType: 'emoji' | 'liveportrait';
  onGenerate: () => void;
};

export function VideoResultPanel({
  isGenerating,
  videoUrl,
  imageUrl,
  videoType,
  onGenerate,
}: VideoResultPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 处理视频播放/暂停
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

  // 处理视频下载
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

  // 处理视频分享
  const handleShare = async () => {
    if (!videoUrl) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI生成视频',
          text: '查看我用AI生成的视频',
          url: videoUrl,
        });
      } catch (err) {
        console.error('分享失败:', err);
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(videoUrl)
        .then(() => toast.success('视频链接已复制到剪贴板'))
        .catch(err => console.error('复制失败:', err));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 视频展示区域 */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden relative">
        {isGenerating
          ? (
              <div className="text-center space-y-4">
                <Spinner size="lg" color="primary" />
                <p className="text-gray-600 dark:text-gray-400">
                  {videoType === 'emoji' ? '正在生成表情视频...' : '正在生成对口型视频...'}
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
                      crossOrigin="anonymous"
                      src={videoUrl}
                      className="max-w-full max-h-[70vh] rounded-lg shadow-lg cursor-pointer"
                      controls
                      autoPlay
                      loop
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <track kind="captions" src="" label="字幕" />
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
                        alt="参考图片"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <p className="text-white text-lg font-medium">等待生成视频</p>
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
                      开始生成
                    </Button>
                  </div>
                )
              : (
                  <div className="text-center p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      请先选择图像并设置参数
                    </p>
                  </div>
                )}
      </div>

      {/* 操作按钮区域 */}
      {videoUrl && (
        <Card className="mt-4">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">
              {videoType === 'emoji' ? '表情视频' : '对口型视频'}
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {videoType === 'emoji'
                ? '根据选择的表情模板生成的动态表情视频'
                : '根据上传的音频生成的对口型视频'}
            </p>
          </CardBody>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Tooltip content="下载视频">
                <Button
                  isIconOnly
                  variant="flat"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="分享视频">
                <Button
                  isIconOnly
                  variant="flat"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
            <Tooltip content="重新生成">
              <Button
                variant="light"
                color="primary"
                startContent={<RefreshCw className="w-4 h-4" />}
                onClick={onGenerate}
                isDisabled={isGenerating}
              >
                重新生成
              </Button>
            </Tooltip>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
