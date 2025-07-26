'use client';

import type { ImageEditResult } from '@/types/database';
import { Image } from '@heroui/react';
import { CheckCircle, Clock, Download, Loader2, Trash2, VideoIcon, Wand2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

type GalleryCardProps = {
  result: ImageEditResult;
  onImageClick: (result: ImageEditResult) => void;
  onDelete?: (result: ImageEditResult) => void;
  formatTime?: (date: string) => string;
  // 多选相关
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (itemId: string) => void;
  // 新增：是否隐藏展示按钮
  hideShowcaseButton?: boolean;
  hideDeleteButton?: boolean;
  hideStatusInfo?: boolean;
  hideVideoControls?: boolean;
  // 新增：展示开关更新后的回调
  onShowcaseToggle?: (resultId: string, isShowcase: boolean) => void;
};

export default function GalleryCard({
  result,
  onImageClick,
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
  const [_localShowcaseStatus, setLocalShowcaseStatus] = useState(result.is_showcase);

  // 监听result.is_showcase的变化，确保本地状态与数据库状态同步
  useEffect(() => {
    setLocalShowcaseStatus(result.is_showcase);
  }, [result.is_showcase, result.id]);

  const handleShowcaseToggle = async (checked: boolean) => {
    setShowcaseLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
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
    } catch {
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
    }

    // 对于图片类型，优先显示处理后的图片
    if (result.result_image_url && result.result_image_url.length > 0) {
      return result.result_image_url[0];
    }

    // 如果没有处理后的图片，显示原始图片
    if (result.source_image_url) {
      return result.source_image_url;
    }

    return '';
  };

  const displayUrl = getDisplayMediaUrl();
  const isVideo = result.result_type === 'video' && result.video_result_url;
  const isGif = result.result_type === 'image' && result.result_image_url && result.result_image_url.some(url => url.includes('.gif'));

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return {
          color: 'success',
          icon: CheckCircle,
          text: t('status.completed'),
        };
      case 'RUNNING':
        return {
          color: 'warning',
          icon: Loader2,
          text: t('status.processing'),
        };
      case 'PENDING':
        return {
          color: 'default',
          icon: Clock,
          text: t('status.pending'),
        };
      case 'FAILED':
        return {
          color: 'danger',
          icon: XCircle,
          text: t('status.failed'),
        };
      default:
        return {
          color: 'default',
          icon: Clock,
          text: t('status.unknown'),
        };
    }
  };

  const handleDownloadClick = async (url: string, filename: string) => {
    if (!url) {
      return;
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const statusInfo = getStatusInfo(result.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg group ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={() => {
        if (!isDownloadClicked) {
          if (isSelectMode && onSelect) {
            onSelect(result.id);
          } else {
            onImageClick(result);
          }
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isDownloadClicked && !isSelectMode) {
            onImageClick(result);
          }
        }
      }}
    >
      <div className={hideShowcaseButton && hideDeleteButton && hideStatusInfo ? 'p-0' : 'p-0'}>
        <div className={hideShowcaseButton && hideDeleteButton && hideStatusInfo ? 'relative group' : 'relative group'}>
          {/* 只保留图片本身 */}
          {isVideo && displayUrl
            ? (
                <video
                  className={
                    hideShowcaseButton && hideDeleteButton && hideStatusInfo
                      ? 'w-full h-auto object-contain'
                      : 'w-full h-auto object-contain rounded-t-lg'
                  }
                  muted
                  loop
                  controls={!hideVideoControls}
                  poster={
                    result.result_image_url && result.result_image_url.length > 0
                      ? result.result_image_url[0]
                      : undefined
                  }
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
                    className={
                      hideShowcaseButton && hideDeleteButton && hideStatusInfo
                        ? 'w-full h-auto object-contain'
                        : 'w-full h-auto object-contain rounded-t-lg'
                    }
                    loading="lazy"
                    style={{ imageRendering: 'auto' }}
                  />
                )
              : (
                  <Image
                    src={displayUrl || '/placeholder-image.jpg'}
                    alt={t('generatedResult')}
                    className={
                      hideShowcaseButton && hideDeleteButton && hideStatusInfo
                        ? 'w-full h-auto object-contain'
                        : 'w-full h-auto object-contain rounded-t-lg'
                    }
                    loading="lazy"
                  />
                )}

          {/* 多选模式下的勾选框 */}
          {isSelectMode && (
            <div className="absolute top-2 right-2 z-10">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isSelected
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-white border-gray-300'
              }`}
              >
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
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
              onClick={(e) => {
                e.stopPropagation();
                setIsDownloadClicked(true);
                const filename = isGif
                  ? `animated-gif-${result.id}.gif`
                  : `${result.result_type}_${result.id}`;
                handleDownloadClick(displayUrl || '', filename);
                setTimeout(() => setIsDownloadClicked(false), 100);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsDownloadClicked(true);
                  const filename = isGif
                    ? `animated-gif-${result.id}.gif`
                    : `${result.result_type}_${result.id}`;
                  handleDownloadClick(displayUrl || '', filename);
                  setTimeout(() => setIsDownloadClicked(false), 100);
                }
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
      {(!hideShowcaseButton || !hideDeleteButton || !hideStatusInfo) && (
        <div className="flex flex-col gap-2 p-3">
          {/* 状态信息和日期 */}
          {!hideStatusInfo && (
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center gap-1">
                <StatusIcon className={`w-3 h-3 ${result.status === 'RUNNING'
                  ? (
                      'animate-spin'
                    )
                  : (
                      ''
                    )}`}
                />
                <span className="text-xs font-medium">
                  {statusInfo.text}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatTime
                  ? (
                      formatTime(result.created_at)
                    )
                  : (
                      new Date(result.created_at).toLocaleDateString()
                    )}
              </span>
            </div>
          )}

          {/* 展示/下载/删除按钮那一行 */}
          <div className="flex items-center gap-2 justify-between mb-2">
            {/* 展示/隐藏按钮 - Switch 开关样式 */}
            {!hideShowcaseButton && (
              <div className="flex items-center gap-2">
                <div
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!showcaseLoading) {
                      handleShowcaseToggle(!result.is_showcase);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!showcaseLoading) {
                        handleShowcaseToggle(!result.is_showcase);
                      }
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={result.is_showcase ? t('showcaseStatus.showcased') : t('showcaseStatus.notShowcased')}
                >
                  <input
                    type="checkbox"
                    checked={result.is_showcase}
                    onChange={e => handleShowcaseToggle(e.target.checked)}
                    disabled={showcaseLoading}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"
                    style={{ backgroundColor: result.is_showcase ? '#f97316' : undefined }}
                  />
                </div>
                <span className="text-xs">
                  {showcaseLoading
                    ? (
                        t('showcaseStatus.processing')
                      )
                    : !result.is_showcase
                        ? (
                            t('showcaseStatus.notShowcased')
                          )
                        : (
                            t('showcaseStatus.showcased')
                          )}
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
                <button
                  type="button"
                  className="cursor-pointer p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDownloadClicked(true);
                    const filename = isGif
                      ? (
                          `animated-gif-${result.id}.gif`
                        )
                      : (
                          `${result.result_type}_${result.id}`
                        );
                    handleDownloadClick(displayUrl || '', filename);
                    setTimeout(() => setIsDownloadClicked(false), 100);
                  }}
                  title="下载"
                >
                  <Download size={20} className="text-purple-500 hover:text-purple-600" />
                </button>
                <button
                  type="button"
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
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
