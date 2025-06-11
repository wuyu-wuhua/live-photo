'use client';

import type { ImageEditResult } from '@/types/database';
import { Button, Card, CardBody, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { CheckCircle, Clock, Download, Loader2, Mic, Smile, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ImageDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageResult: ImageEditResult | null;
  handleDownload: (url: string, filename?: string) => void;
  formatTime: (date: string) => string;
};

export default function ImageDetailModal({
  isOpen,
  onClose,
  imageResult,
  handleDownload,
  formatTime,
}: ImageDetailModalProps) {
  const t = useTranslations('gallery');
  if (!imageResult) {
    return null;
  }
  // 将 useTranslations hook 移到条件判断之前调用
  // 获取状态显示信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'succeeded':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          icon: CheckCircle,
          label: t('status.completed'),
        };
      case 'running':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          icon: Loader2,
          label: t('status.processing'),
        };
      case 'pending':
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          icon: Clock,
          label: t('status.pending'),
        };
      case 'failed':
        return {
          color: 'text-red-600',
          bg: 'bg-red-100',
          icon: XCircle,
          label: t('status.failed'),
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          icon: Clock,
          label: t('status.unknown'),
        };
    }
  };

  const statusInfo = getStatusInfo(imageResult.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{t('imageDetails')}</span>
            <div className={`px-2 py-1 rounded-lg ${statusInfo.bg} ml-2`}>
              <div className="flex items-center gap-1">
                <StatusIcon className={`w-4 h-4 ${statusInfo.color} ${imageResult.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {t('createTime')}
            :
            {' '}
            {formatTime(imageResult.created_at)}
          </div>
        </ModalHeader>

        <ModalBody>
          {/* 原图和结果图对比 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="font-medium mb-2">{t('originalImage')}</div>
              {imageResult.source_image_url && (
                <div className="relative group">
                  <Image
                    src={imageResult.source_image_url}
                    alt="原始图片"
                    className="w-full rounded-lg object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                    <Button
                      isIconOnly
                      color="default"
                      variant="flat"
                      radius="full"
                      onClick={() => handleDownload(imageResult.source_image_url || '')}
                    >
                      <Download size={20} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="font-medium mb-2">{t('generatedResult')}</div>
              {imageResult.result_image_url && imageResult.result_image_url.length > 0
                ? (
                    <div className="relative group">
                      {imageResult.result_type === 'video'
                        ? (
                            <div className="relative">
                              <video
                                src={imageResult.result_image_url[0]}
                                controls
                                muted
                                loop
                                className="w-full rounded-lg"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                                <Button
                                  isIconOnly
                                  color="default"
                                  variant="flat"
                                  radius="full"
                                  onPress={() => handleDownload(imageResult.result_image_url[0] || '')}
                                >
                                  <Download size={20} />
                                </Button>
                              </div>
                            </div>
                          )
                        : (
                            <>
                              <Image
                                src={imageResult.result_image_url[0]}
                                alt={t('generatedResult')}
                                className="w-full rounded-lg object-contain"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                                <Button
                                  isIconOnly
                                  color="default"
                                  variant="flat"
                                  radius="full"
                                  onClick={() => handleDownload(imageResult.result_image_url[0] || '')}
                                >
                                  <Download size={20} />
                                </Button>
                              </div>
                            </>
                          )}
                    </div>
                  )
                : (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">{imageResult.result_type === 'video' ? t('noResultVideo') : t('noResultImage')}</p>
                    </div>
                  )}
            </div>
          </div>

          {/* 额外的结果 */}
          {imageResult.result_image_url && imageResult.result_image_url.length > 1 && (
            <div className="mb-6">
              <div className="font-medium mb-2">{t('otherResults')}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {imageResult.result_image_url.slice(1).map((url, index) => (
                  <div key={index} className="relative group">
                    {imageResult.result_type === 'video'
                      ? (
                          <>
                            {/* <VideoPlayer
                              src={url}
                              className="w-full aspect-square rounded-lg"
                              controls={false}
                              muted
                              loop
                            /> */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                              <Button
                                isIconOnly
                                color="default"
                                variant="flat"
                                radius="full"
                                onClick={() => handleDownload(url)}
                              >
                                <Download size={20} />
                              </Button>
                            </div>
                          </>
                        )
                      : (
                          <>
                            <Image
                              src={url}
                              alt={`${t('generatedResult')} ${index + 2}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                              <Button
                                isIconOnly
                                color="default"
                                variant="flat"
                                radius="full"
                                onClick={() => handleDownload(url)}
                              >
                                <Download size={20} />
                              </Button>
                            </div>
                          </>
                        )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 表情视频生成结果 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{t('emojiVideoResult')}</span>
              <div className={`px-2 py-1 rounded-full text-xs ${imageResult.emoji_status === 'SUCCEEDED'
                ? 'bg-green-100 text-green-700'
                : imageResult.emoji_status === 'RUNNING'
                  ? 'bg-blue-100 text-blue-700'
                  : imageResult.emoji_status === 'FAILED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
              >
                {imageResult.emoji_status === 'SUCCEEDED'
                  ? t('status.succeeded')
                  : imageResult.emoji_status === 'RUNNING'
                    ? t('status.processing')
                    : imageResult.emoji_status === 'FAILED' ? t('status.failed') : t('status.waiting')}
              </div>
            </div>
            {imageResult.emoji_status === 'SUCCEEDED' && imageResult.emoji_result_url
              ? (
                  <div className="relative group">
                    <video
                      src={imageResult.emoji_result_url}
                      controls
                      muted
                      loop
                      className="w-full rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                      <Button
                        isIconOnly
                        color="default"
                        variant="flat"
                        radius="full"
                        onPress={() => handleDownload(imageResult.emoji_result_url || '')}
                      >
                        <Download size={20} />
                      </Button>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {imageResult.emoji_status === 'RUNNING'
                        ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )
                        : imageResult.emoji_status === 'FAILED'
                          ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )
                          : (
                              <Clock className="w-4 h-4 text-gray-500" />
                            )}
                      <span className="text-sm text-gray-600">
                        {imageResult.emoji_status === 'RUNNING'
                          ? t('messages.generatingEmoji')
                          : imageResult.emoji_status === 'FAILED'
                            ? t('messages.emojiGenerationFailed')
                            : t('messages.emojiNotStarted')}
                      </span>
                    </div>
                    {(imageResult.emoji_status === 'FAILED' || !imageResult.emoji_status) && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => {
                          console.warn('重试表情视频生成');
                        }}
                      >
                        {t('retry')}
                      </Button>
                    )}
                  </div>
                )}
          </div>

          {/* 对口型视频生成结果 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{t('lipsyncVideoResult')}</span>
              <div className={`px-2 py-1 rounded-full text-xs ${imageResult.liveportrait_status === 'SUCCEEDED'
                ? 'bg-green-100 text-green-700'
                : imageResult.liveportrait_status === 'RUNNING'
                  ? 'bg-blue-100 text-blue-700'
                  : imageResult.liveportrait_status === 'FAILED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
              >
                {imageResult.liveportrait_status === 'SUCCEEDED'
                  ? t('status.succeeded')
                  : imageResult.liveportrait_status === 'RUNNING'
                    ? t('status.processing')
                    : imageResult.liveportrait_status === 'FAILED' ? t('status.failed') : t('status.waiting')}
              </div>
            </div>

            {imageResult.liveportrait_status === 'SUCCEEDED' && imageResult.liveportrait_result_url
              ? (
                  <div className="relative group">
                    <video
                      src={imageResult.liveportrait_result_url}
                      controls
                      muted
                      loop
                      className="w-full rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/50 transition-opacity group-hover:opacity-100 rounded-lg">
                      <Button
                        isIconOnly
                        color="default"
                        variant="flat"
                        radius="full"
                        onPress={() => handleDownload(imageResult.liveportrait_result_url || '')}
                      >
                        <Download size={20} />
                      </Button>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {imageResult.liveportrait_status === 'RUNNING'
                        ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )
                        : imageResult.liveportrait_status === 'FAILED'
                          ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )
                          : (
                              <Clock className="w-4 h-4 text-gray-500" />
                            )}
                      <span className="text-sm text-gray-600">
                        {imageResult.liveportrait_status === 'RUNNING'
                          ? t('messages.generatingLipsync')
                          : imageResult.liveportrait_status === 'FAILED'
                            ? t('messages.lipsyncGenerationFailed')
                            : t('messages.lipsyncNotStarted')}
                      </span>
                    </div>
                    {(imageResult.liveportrait_status === 'FAILED' || !imageResult.liveportrait_status) && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => {
                          // TODO: 实现重试逻辑
                          console.warn('重试对口型视频生成');
                        }}
                      >
                        {t('retry')}
                      </Button>
                    )}
                  </div>
                )}
          </div>

          {/* 提示词和参数信息 */}
          <div className="space-y-4">
            <Card>
              <CardBody>
                <h3 className="font-medium mb-2">编辑功能</h3>
                <p className="text-sm">{(imageResult.request_parameters as any)?.function || '未知功能'}</p>
              </CardBody>
            </Card>

            {(imageResult.request_parameters as any)?.prompt && (
              <Card>
                <CardBody>
                  <h3 className="font-medium mb-2">{t('prompt')}</h3>
                  <p className="text-sm whitespace-pre-wrap">{(imageResult.request_parameters as any).prompt}</p>
                </CardBody>
              </Card>
            )}

            {(imageResult.request_parameters as any)?.task_id && (
              <Card>
                <CardBody>
                  <h3 className="font-medium mb-2">{t('taskId')}</h3>
                  <p className="text-sm font-mono">{(imageResult.request_parameters as any).task_id}</p>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {/* 表情视频生成按钮 */}
              {imageResult && imageResult.emoji_compatible && !imageResult.emoji_result_url && (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Smile size={16} />}
                  onClick={() => {
                    onClose();
                    // 跳转到视频生成页面
                    window.open(`/video-generate?imageId=${imageResult.id}&type=emoji`, '_blank');
                  }}
                >
                  {t('generateEmojiVideo')}
                </Button>
              )}

              {/* 对口型视频生成按钮 */}
              {imageResult && imageResult.liveportrait_compatible && !imageResult.liveportrait_result_url && (
                <Button
                  color="secondary"
                  variant="flat"
                  startContent={<Mic size={16} />}
                  onClick={() => {
                    onClose();
                    // 跳转到视频生成页面
                    window.open(`/video-generate?imageId=${imageResult.id}&type=liveportrait`, '_blank');
                  }}
                >
                  {t('generateLipsyncVideo')}
                </Button>
              )}
            </div>

            <Button color="primary" variant="light" onClick={onClose}>
              {t('close')}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
