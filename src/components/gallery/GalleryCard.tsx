'use client';

import type { ImageEditResult } from '@/types/database';
import { CheckCircle, Clock, Download, Loader2, Mic, Smile, Trash2, VideoIcon, Wand2, XCircle } from 'lucide-react';
import { Image } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
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
  // 新增：展示开关更新后的回调
  onShowcaseToggle?: (resultId: string, isShowcase: boolean) => void;
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
  onShowcaseToggle,
}: GalleryCardProps) {
  const t = useTranslations('gallery');
  // 添加状态来跟踪下载按钮点击，防止事件冒泡到 Card
  const [isDownloadClicked, setIsDownloadClicked] = useState(false);
  // 新增：处理展示/隐藏
  const [showcaseLoading, setShowcaseLoading] = useState(false);
  const [localShowcaseStatus, setLocalShowcaseStatus] = useState(result.is_showcase);

  // 监听result.is_showcase的变化，确保本地状态与数据库状态同步
  useEffect(() => {
    setLocalShowcaseStatus(result.is_showcase);
  }, [result.is_showcase, result.id]);

  const handleShowcaseToggle = async (checked: boolean) => {
    setShowcaseLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('image_edit_results')
        .update({ is_showcase: checked })
        .eq('id', result.id)
        .select('is_showcase')
        .single();
      if (error) {
        setLocalShowcaseStatus(result.is_showcase);
      } else {
        setLocalShowcaseStatus(checked);
        onShowcaseToggle?.(result.id, checked);
      }
    } catch (error) {
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
      className={
        hideShowcaseButton && hideDeleteButton && hideStatusInfo
          ? 'mb-4 cursor-pointer group relative bg-transparent p-0 border-none shadow-none rounded-none overflow-visible'
          : 'mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden border border-default-200 dark:border-default-100'
      }
      onClick={() => {
        if (!isDownloadClicked && !isSelectMode) {
          onImageClick(result);
        }
      }}
    >
      <div className={hideShowcaseButton && hideDeleteButton && hideStatusInfo ? 'p-0' : 'p-0'}>
        <div className={hideShowcaseButton && hideDeleteButton && hideStatusInfo ? 'relative group' : 'relative group'}>
          {/* 只保留图片本身 */}
          {(isVideo && displayUrl)
           ? (
            <video
              className={hideShowcaseButton && hideDeleteButton && hideStatusInfo ? 'w-full h-auto object-contain' : 'w-full h-auto object-contain rounded-t-lg'}
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
          ) : isGif ? (
            <img
              src={displayUrl}
              alt={t('gifResult')}
              className={hideShowcaseButton && hideDeleteButton && hideStatusInfo ? 'w-full h-auto object-contain' : 'w-full h-auto object-contain rounded-t-lg'}
              loading="lazy"
              style={{ imageRendering: 'auto' }}
            />
          ) : (
            <Image
              src={displayUrl || '/placeholder-image.jpg'}
              alt={t('generatedResult')}
              className={hideShowcaseButton && hideDeleteButton && hideStatusInfo ? 'w-full h-auto object-contain' : 'w-full h-auto object-contain rounded-t-lg'}
              loading="lazy"
            />
          )}

          {/* 视频类型标识 */}
          {isVideo && !hideStatusInfo && (
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <VideoIcon size={12} />
              {t('video')}
            </div>
          )}
          {/* GIF类型标识 */}
          {isGif && !isVideo && !hideStatusInfo && (
            <div className="absolute top-2 left-2 bg-green-600/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <Wand2 size={12} />
              GIF
            </div>
          )}

          {/* 只在作品展示图片页面显示悬浮下载按钮 */}
          {hideShowcaseButton && hideDeleteButton && hideStatusInfo && result.result_type === 'image' && (
            <div
              role="button"
              tabIndex={0}
              className="absolute bottom-2 right-2 z-20 hidden group-hover:flex"
              onClick={e => {
                e.stopPropagation();
                setIsDownloadClicked(true);
                const filename = isGif
                  ? `animated-gif-${result.id}.gif`
                  : `${result.result_type}_${result.id}`;
                handleDownloadClick(displayUrl || '', filename);
                setTimeout(() => setIsDownloadClicked(false), 100);
              }}
              title="下载"
              style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: 8 }}
            >
              <Download size={28} className="text-white hover:text-purple-300" />
            </div>
          )}
        </div>
      </div>

      {/* 状态信息和控制按钮区域 */}
      {!hideShowcaseButton || !hideDeleteButton || !hideStatusInfo ? (
        <div className="flex flex-col gap-2 p-3">
          {/* 状态信息和日期 */}
          {!hideStatusInfo && (
            <div className="flex items-center justify-between w-full mb-3">
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

          {/* 展示/下载/删除按钮那一行 */}
          <div className="flex items-center gap-2 justify-between mb-2">
            {/* 展示/隐藏按钮 - Switch 开关样式 */}
            {!hideShowcaseButton && (
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={result.is_showcase}
                    onChange={(e) => handleShowcaseToggle(e.target.checked)}
                    disabled={showcaseLoading}
                    className="sr-only peer"
                  />
                  <div 
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"
                    style={{ backgroundColor: result.is_showcase ? '#f97316' : undefined }}
                  ></div>
                </label>
                <span className="text-xs">
                  {showcaseLoading ? t('showcaseStatus.processing') : (!result.is_showcase ? t('showcaseStatus.notShowcased') : t('showcaseStatus.showcased'))}
                  {/* 调试信息 */}
                  <span className="text-gray-400 ml-1">
                    (
                      {result.is_showcase ? 'true' : 'false'}
                      )
                  </span>
                </span>
              </div>
            )}
            {/* 下载和删除按钮并排显示在右侧 */}
            {!hideDeleteButton && (
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

          {/* 额外功能状态 */}
          <div className="flex gap-2 w-full">
            {/* 表情视频状态 */}
            {result.emoji_compatible && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                result.emoji_status === 'SUCCEEDED'
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
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                result.liveportrait_status === 'SUCCEEDED'
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
      ) : null}
    </div>
  );
}
