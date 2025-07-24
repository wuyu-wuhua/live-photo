'use client';

import type { ImageEditResult } from '@/types/database';
import { Checkbox, Image } from '@heroui/react';
import { CheckCircle, Clock, Download, Loader2, Mic, Smile, VideoIcon, XCircle, Trash2, Wand2 } from 'lucide-react';
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
  onDelete?: (result: ImageEditResult) => void;
  formatTime?: (date: string) => string;
  // 多选相关
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (itemId: string) => void;
};

export default function GalleryCard({
  result,
  onImageClick,
  onDownload,
  onDelete,
  formatTime,
  isSelectMode = false,
  isSelected = false,
  onSelect,
}: GalleryCardProps) {
  const t = useTranslations('gallery');
  // 添加状态来跟踪下载按钮点击，防止事件冒泡到 Card
  const [isDownloadClicked, setIsDownloadClicked] = useState(false);
  // 获取显示的图片或视频URL
  const getDisplayMediaUrl = () => {
    // 优先检查视频类型的各种结果URL
    if (result.result_type === 'video') {
      if (result.video_result_url) {
        return result.video_result_url;
      }
      if (result.emoji_result_url) {
        return result.emoji_result_url;
      }
      if (result.liveportrait_result_url) {
        return result.liveportrait_result_url;
      }
    }
    
    // 对于图片类型，检查表情包和对口型结果
    if (result.emoji_result_url) {
      return result.emoji_result_url;
    }
    if (result.liveportrait_result_url) {
      return result.liveportrait_result_url;
    }
    
    // 最后返回图片结果
    return result.result_image_url && result.result_image_url.length > 0 ? result.result_image_url[0] : null;
  };
  
  const displayUrl = getDisplayMediaUrl() || '/placeholder-image.jpg';
  const isVideo = result.result_type === 'video' && (result.video_result_url || result.emoji_result_url || result.liveportrait_result_url);
  const isGif = result.emoji_result_url && result.result_type !== 'video';

  // 获取状态显示信息（修正：图片类型一律显示已完成）
  const getStatusInfo = (status: string) => {
    if (isVideo) {
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
    } else {
      // 图片类型一律显示已完成
      return { color: 'success', icon: CheckCircle, text: t('status.completed') };
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

  // 功能类型显示
  const getFunctionLabel = () => {
    if (isVideo) return t('video_synthesis');
    if (isGif) return t('gifResult');
    if ((result.request_parameters as any)?.function === 'colorization') return t('colorization');
    return t('image');
  };

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
        if (!isDownloadClicked && !isSelectMode) {
          onImageClick(result);
        }
      }}
    >
      <div className="p-0">
        {/* 主要内容区域 */}
        <div className="relative group">
          {/* 多选复选框 */}
          {isSelectMode && (
            <div className="absolute top-2 left-2 z-50">
              <Checkbox
                isSelected={isSelected}
                onValueChange={() => {
                  onSelect?.(result.id);
                }}
                className="bg-white/90 dark:bg-black/90 backdrop-blur-sm"
              />
            </div>
          )}
          {isVideo && displayUrl
            ? (
                <video
                  className="w-full h-auto object-cover rounded-t-lg"
                  muted
                  loop
                  controls
                  poster={result.result_image_url && result.result_image_url.length > 0 ? result.result_image_url[0] : undefined}
                  onError={e => console.error('Video error:', e)}
                >
                  <source src={displayUrl} type="video/mp4" />
                </video>
              )
            : isGif
              ? (
                  <img
                    src={displayUrl}
                    alt={t('gifResult')}
                    className="w-full h-auto object-cover rounded-t-lg"
                    loading="lazy"
                    style={{ imageRendering: 'auto' }}
                  />
                )
              : (
                  <Image
                    src={displayUrl || '/placeholder-image.jpg'}
                    alt={t('generatedResult')}
                    className="w-full h-auto object-cover rounded-t-lg"
                    loading="lazy"
                  />
          )}

          {/* 视频类型标识 */}
          {isVideo && (
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <VideoIcon size={12} />
              {t('video')}
            </div>
          )}
          {/* GIF类型标识 */}
          {isGif && !isVideo && (
            <div className="absolute top-2 left-2 bg-green-600/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <Wand2 size={12} />
              GIF
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

        {/* 功能类型和操作按钮 */}
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium text-gray-700 flex-1">
            {getFunctionLabel()}
          </span>
          <div className="flex gap-2">
            {/* 下载按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1 min-w-0 flex-shrink-0 border border-blue-200 hover:border-blue-300 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsDownloadClicked(true);
                const filename = isGif 
                  ? `animated-gif-${result.id}.gif`
                  : `${result.result_type}_${result.id}`;
                handleDownloadClick(displayUrl || '', filename);
                // 重置状态
                setTimeout(() => setIsDownloadClicked(false), 100);
              }}
              title="下载"
            >
              <Download size={16} />
            </Button>
          {/* 删除按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 min-w-0 flex-shrink-0 border border-red-200 hover:border-red-300 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) {
                onDelete(result);
              }
            }}
            title="删除"
          >
            <Trash2 size={16} />
          </Button>
        </div>
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
