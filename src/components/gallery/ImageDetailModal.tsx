'use client';

import type { ImageEditResult } from '@/types/database';
import { Button, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import {  Download } from 'lucide-react';
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
  // 删除未使用的 getStatusInfo 函数
  // const getStatusInfo = (status: string) => {
  //   switch (status) {
  //     case 'succeeded':
  //       return {
  //         color: 'success',
  //         icon: CheckCircle,
  //         text: t('status.completed'),
  //       };
  //     case 'running':
  //       return {
  //         color: 'warning',
  //         icon: Loader2,
  //         text: t('status.processing'),
  //       };
  //     case 'pending':
  //       return {
  //         color: 'default',
  //         icon: Clock,
  //         text: t('status.pending'),
  //       };
  //     case 'failed':
  //       return {
  //         color: 'danger',
  //         icon: XCircle,
  //         text: t('status.failed'),
  //       };
  //     default:
  //       return {
  //         color: 'default',
  //         icon: Clock,
  //         text: t('status.unknown'),
  //       };
  //   }
  // };

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
          </div>
          <div className="text-sm text-gray-500">
            {t('createTime')}
            :
            {' '}
            {formatTime(imageResult.created_at)}
          </div>
        </ModalHeader>

        <ModalBody>
          {/* 只保留图片相关内容，不显示任何视频生成结果区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="font-medium mb-2">{t('originalImage')}</div>
              {imageResult.source_image_url && (
                <div className="relative group">
                  <Image
                    src={imageResult.source_image_url}
                    alt={t('originalImage')}
                    className="w-full rounded-lg object-contain"
                  />
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              {imageResult.result_image_url && imageResult.result_image_url.length > 0 && (
                <div className="relative group">
                  <Image
                    src={imageResult.result_image_url[0] ? String(imageResult.result_image_url[0]) : ''}
                    alt={t('generatedResult')}
                    className="w-full rounded-lg object-contain"
                  />
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                </div>
              )}
            </div>
          </div>
          {/* 额外的图片结果 */}
          {imageResult.result_image_url && imageResult.result_image_url.length > 1 && (
            <div className="mb-6">
              <div className="font-medium mb-2">{t('otherResults')}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {imageResult.result_image_url.slice(1).map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url ? String(url) : ''}
                      alt={`${t('generatedResult')} ${index + 2}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between w-full">
            {/* 删除 makePhotoMove 相关按钮和文案 */}
            <Button color="primary" variant="light" onClick={onClose}>
              {t('close')}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
