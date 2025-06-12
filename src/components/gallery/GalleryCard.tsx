'use client';

import type { ImageEditResult } from '@/types/database';
import { Image } from '@heroui/react';
import { CheckCircle, Clock, Download, Loader2, Mic, Smile, VideoIcon, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const Button = dynamic(
  () => import('@/components/ui/button').then(mod => mod.Button),
  { ssr: false },
);

type GalleryCardProps = {
  result: ImageEditResult;
  onImageClick: (result: ImageEditResult) => void;
  onDownload: (url: string, filename: string) => void;
  onVideoGeneration?: (result: ImageEditResult, videoType: 'emoji' | 'liveportrait') => void;
  formatTime?: (date: string) => string;
};

export default function GalleryCard({
  result,
  onImageClick,
  onDownload,
  formatTime,
}: GalleryCardProps) {
  const t = useTranslations('gallery');
  // 添加状态来跟踪下载按钮点击，防止事件冒泡到 Card
  const [isDownloadClicked, setIsDownloadClicked] = useState(false);
  // 获取状态显示信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return { color: 'success', icon: CheckCircle, text: t('status.completed') };
      case 'RUNNING':
        return { color: 'warning', icon: Loader2, text: t('status.processing') };
      case 'PENDING':
        return { color: 'default', icon: Clock, text: t('status.pending') };
      case 'FAILED':
        return { color: 'danger', icon: XCircle, text: t('status.failed') };
      default:
        return { color: 'default', icon: Clock, text: t('status.unknown') };
    }
  };

  const statusInfo = getStatusInfo(result.status);
  const StatusIcon = statusInfo.icon;

  const handleDownloadClick = async (url: string, filename: string) => {
    if (onDownload) {
      onDownload(url, filename);
    } else {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  // 获取显示的图片URL
  const getDisplayImageUrl = () => {
    if (result.emoji_result_url && result.emoji_result_url.length > 0) {
      return result.emoji_result_url;
    }
    if (result.liveportrait_result_url && result.liveportrait_result_url.length > 0) {
      return result.liveportrait_result_url;
    }
    return result.source_image_url;
  };

  // 判断是否为视频
  const isVideo = result.result_type === 'video';
  const displayUrl = getDisplayImageUrl();

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!isDownloadClicked) {
            onImageClick(result);
          }
        }
      }}
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden border border-default-200 dark:border-default-100"
      onClick={() => {
        // 如果下载按钮被点击，不执行卡片的点击操作
        if (!isDownloadClicked) {
          onImageClick(result);
        }
      }}
    >
      <div className="p-0">
        {/* 主要内容区域 */}
        <div className="relative group">
          {isVideo && displayUrl
            ? (
                <video
                  src={displayUrl}
                  className="w-full h-auto object-cover rounded-t-lg"
                  muted
                  loop
                  onMouseEnter={e => e.currentTarget.play()}
                  onMouseLeave={e => e.currentTarget.pause()}
                  onError={e => console.error('Video error:', e)}
                >
                  <source src={displayUrl} type="video/mp4" />
                </video>
              )
            : (
                <Image
                  src={displayUrl || '/placeholder-image.jpg'}
                  alt={t('generatedResult')}
                  className="w-full h-auto object-cover rounded-t-lg"
                  loading="lazy"
                />
              )}

          {/* 悬停时显示的下载按钮 */}
          {displayUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-t-lg">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white z-40"
                onClick={() => {
                  // 使用状态变量来防止事件冒泡到 Card
                  setIsDownloadClicked(true);
                  // 处理下载
                  handleDownloadClick(displayUrl, `${result.result_type}_${result.id}`);
                  // 使用 setTimeout 确保在事件冒泡完成后重置状态
                  setTimeout(() => setIsDownloadClicked(false), 100);
                }}
              >
                <Download size={20} />
              </Button>
            </div>
          )}

          {/* 视频类型标识 */}
          {isVideo && (
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <VideoIcon size={12} />
              {t('video')}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {/* 状态信息 */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <StatusIcon className={`w-3 h-3 ${result.status === 'RUNNING' ? 'animate-spin' : ''}`} />
            <span className="text-xs font-medium">
              {statusInfo.text}
            </span>
          </div>

          <span className="text-xs text-gray-500">
            {formatTime ? formatTime(result.created_at) : new Date(result.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* 功能类型 */}
        <div className="w-full">
          <span className="text-sm font-medium text-gray-700">
            {(result.request_parameters as any)?.function || t('unknownFunction')}
          </span>
        </div>

        {/* 额外功能状态 */}
        <div className="flex gap-2 w-full">
          {/* 表情视频状态 */}
          {result.emoji_compatible && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${result.emoji_status === 'SUCCEEDED'
              ? 'bg-green-100 text-green-700'
              : result.emoji_status === 'RUNNING'
                ? 'bg-blue-100 text-blue-700'
                : result.emoji_status === 'FAILED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
            >
              <Smile size={12} />
              <span>
                {result.emoji_status === 'SUCCEEDED'
                  ? t('emojiReady')
                  : result.emoji_status === 'RUNNING'
                    ? t('emojiGenerating')
                    : result.emoji_status === 'FAILED'
                      ? t('emojiFailed')
                      : t('emojiAvailable')}
              </span>
            </div>
          )}

          {/* 对口型视频状态 */}
          {result.liveportrait_compatible && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${result.liveportrait_status === 'SUCCEEDED'
              ? 'bg-green-100 text-green-700'
              : result.liveportrait_status === 'RUNNING'
                ? 'bg-blue-100 text-blue-700'
                : result.liveportrait_status === 'FAILED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
            >
              <Mic size={12} />
              <span>
                {result.liveportrait_status === 'SUCCEEDED'
                  ? t('lipsyncReady')
                  : result.liveportrait_status === 'RUNNING'
                    ? t('lipsyncGenerating')
                    : result.liveportrait_status === 'FAILED'
                      ? t('lipsyncFailed')
                      : t('lipsyncAvailable')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
