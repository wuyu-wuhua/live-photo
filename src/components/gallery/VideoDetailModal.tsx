import type { ImageEditResult } from '@/types/database';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useTranslations } from 'next-intl';

type VideoDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoResult: ImageEditResult | null;
  formatTime: (date: string) => string;
};

export default function VideoDetailModal({
  isOpen,
  onClose,
  videoResult,
  formatTime,
}: VideoDetailModalProps) {
  const t = useTranslations('gallery');
  if (!videoResult) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{t('video')}</span>
          </div>
          <div className="text-sm text-gray-500">
            {t('createTime')}
            :
            {formatTime(videoResult.created_at)}
          </div>
        </ModalHeader>
        <ModalBody>
          {/* 左右对比：左图右视频 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* 左侧上色/处理后图片 */}
            <div className="flex flex-col items-center">
              <h5 className="text-sm mb-2 text-gray-500">{t('originalImage')}</h5>
              {/* 优先显示原始图片，如果没有则显示处理后的图片 */}
              {videoResult.source_image_url ? (
                <img
                  src={videoResult.source_image_url}
                  alt={t('originalImage')}
                  className="w-full rounded-lg object-contain"
                  style={{ maxHeight: 360, background: '#222' }}
                />
              ) : (videoResult.result_image_url && videoResult.result_image_url.length > 0) ? (
                <img
                  src={videoResult.result_image_url[0]}
                  alt={t('originalImage')}
                  className="w-full rounded-lg object-contain"
                  style={{ maxHeight: 360, background: '#222' }}
                />
              ) : (
                <div className="text-gray-400 text-center">{t('noOriginalImage')}</div>
              )}
            </div>
            {/* 右侧视频 */}
            <div className="flex flex-col items-center">
              <h5 className="text-sm mb-2 text-gray-500">{t('videoGeneration.videoResult')}</h5>
              {videoResult.video_result_url || videoResult.emoji_result_url || videoResult.liveportrait_result_url
                ? (
                    <video
                      src={videoResult.video_result_url || videoResult.emoji_result_url || videoResult.liveportrait_result_url || ''}
                      controls
                      className="w-full rounded-lg object-contain"
                      style={{ maxHeight: 360, background: '#000' }}
                    />
                  )
                : (
                    <div className="text-gray-400 text-center">{t('noResultVideo')}</div>
                  )}
            </div>
          </div>
          {/* 下载按钮 */}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="light" onClick={onClose}>
            {t('close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
