'use client';

import type { ImageEditResult } from '@/types/database';
import { Checkbox, Image } from '@heroui/react';
import { CheckCircle, Clock, Download, Loader2, Mic, Smile, Trash2, VideoIcon, Wand2, XCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

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
  // 新增：是否隐藏展示按钮
  hideShowcaseButton?: boolean;
  hideDeleteButton?: boolean;
  hideStatusInfo?: boolean; // 新增
  hideVideoControls?: boolean; // 新增：是否隐藏视频控件
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
  hideShowcaseButton = false,
  hideDeleteButton = false,
  hideStatusInfo = false,
  hideVideoControls = false,
}: GalleryCardProps) {
  const t = useTranslations('gallery');
  // 添加状态来跟踪下载按钮点击，防止事件冒泡到 Card
  const [isDownloadClicked, setIsDownloadClicked] = useState(false);
  // 新增：处理展示/隐藏
  const [showcaseLoading, setShowcaseLoading] = useState(false);
  const handleShowcaseToggle = async () => {
    setShowcaseLoading(true);
    const supabase = createSupabaseClient();
    await supabase.from('image_edit_results').update({ is_showcase: !result.is_showcase }).eq('id', result.id);
    setShowcaseLoading(false);
  };
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

    // 对于图片类型，优先显示处理后的图片
    if (result.result_image_url && result.result_image_url.length > 0) {
      return result.result_image_url[0];
    }

    // 如果没有处理后的图片，显示原始图片
    if (result.source_image_url) {
      return result.source_image_url;
    }

    // 检查表情包和对口型结果
    if (result.emoji_result_url) {
      return result.emoji_result_url;
    }
    if (result.liveportrait_result_url) {
      return result.liveportrait_result_url;
    }

    return null;
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
    if (isVideo) {
      return t('video_synthesis');
    }
    if (isGif) {
      return t('gifResult');
    }
    if ((result.request_parameters as any)?.function === 'colorization') {
      return t('colorization');
    }
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
                  className="w-full h-auto object-contain rounded-t-lg"
                  muted
                  loop
                  controls={!hideVideoControls}
                  poster={result.result_image_url && result.result_image_url.length > 0 ? result.result_image_url[0] : undefined}
                  onError={e => console.error('Video error:', e)}
                  onMouseEnter={(e) => {
                    if (hideVideoControls) {
                      const video = e.currentTarget;
                      video.controls = true;
                      video.play();
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hideVideoControls) {
                      const video = e.currentTarget;
                      video.controls = false;
                      video.pause();
                    }
                  }}
                >
                  <source src={displayUrl} type="video/mp4" />
                </video>
              )
            : isGif
              ? (
                  <img
                    src={displayUrl}
                    alt={t('gifResult')}
                    className="w-full h-auto object-contain rounded-t-lg"
                    loading="lazy"
                    style={{ imageRendering: 'auto' }}
                  />
                )
              : (
                  <Image
                    src={displayUrl || '/placeholder-image.jpg'}
                    alt={t('generatedResult')}
                    className="w-full h-auto object-contain rounded-t-lg"
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
          
          {/* 下载按钮 - 移到图片右下角，鼠标悬停显示 */}
          {!hideVideoControls && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <div
                className="cursor-pointer p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDownloadClicked(true);
                  const filename = isGif
                    ? `animated-gif-${result.id}.gif`
                    : `${result.result_type}_${result.id}`;
                  handleDownloadClick(displayUrl || '', filename);
                  setTimeout(() => setIsDownloadClicked(false), 100);
                }}
                title="下载"
              >
                <Download size={20} className="text-purple-500 hover:text-purple-600" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
