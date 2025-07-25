'use client';

import type { ImageEditResult } from '@/types/database';
import { Checkbox, Image, Switch } from '@heroui/react';
import { CheckCircle, Clock, Download, Loader2, Mic, Smile, Trash2, VideoIcon, Wand2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

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
  const [localShowcaseStatus, setLocalShowcaseStatus] = useState(result.is_showcase);
  
  const handleShowcaseToggle = async (checked: boolean) => {
    setShowcaseLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from('image_edit_results')
        .update({ is_showcase: checked })
        .eq('id', result.id);
      
      if (error) {
        console.error('更新展示状态失败:', error);
        setLocalShowcaseStatus(result.is_showcase);
      } else {
        setLocalShowcaseStatus(checked);
        // window.location.reload(); // 移除强制刷新
      }
    } catch (error) {
      console.error('更新展示状态失败:', error);
      setLocalShowcaseStatus(result.is_showcase);
    } finally {
      setShowcaseLoading(false);
    }
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
          
          {/* 状态信息和日期，放到最上面，并与图片增加间距 */}
          {!hideStatusInfo && (
            <div className="flex items-center justify-between w-full mb-3 mt-2">
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
          )}

          {/* 展示/下载/删除按钮那一行放到下面 */}
          <div className="flex items-center gap-2 justify-between mb-2">
            {/* 展示/隐藏按钮 - Switch 开关样式 */}
            {!hideShowcaseButton && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={localShowcaseStatus}
                  onChange={(e) => handleShowcaseToggle(e.target.checked)}
                  disabled={showcaseLoading}
                  color="primary"
                />
                <span className="text-xs">{showcaseLoading ? '处理中...' : (!localShowcaseStatus ? '未展示' : '已展示')}</span>
              </div>
            )}
            {/* 下载和删除按钮并排显示在右侧 */}
            {!hideDeleteButton && !hideVideoControls && (
              <div className="flex gap-2">
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
                <div
                  className="cursor-pointer p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) {
                      onDelete(result);
                    }
                  }}
                  title="删除"
                >
                  <Trash2 size={20} className="text-red-500 hover:text-red-700" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 恢复图片下方的所有内容 */}
      <div className="flex flex-col gap-2 p-3">
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
