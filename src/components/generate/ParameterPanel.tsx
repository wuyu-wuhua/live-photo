'use client';

import type { FormUploadFile } from '@/components/upload/picture-card-form';
import type { DashscopeImageEditRequest } from '@/types/dashscope';
import {
  Button,
  Tooltip,
} from '@heroui/react';
import {
  Coins,
  Palette,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PictureCardForm } from '@/components/upload/picture-card-form';
import { useCredits } from '@/hooks/useCredits';
import { Label } from '../ui/label';

// 导入上传配置
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpg', 'image/gif', 'image/png', 'image/jpeg', 'image/webp'],
  bucket: 'live-photos',
};

// 验证图片是否符合要求
const validateImage = (file: File, t: ReturnType<typeof useTranslations>): { valid: boolean; error?: string } => {
  // 检查文件大小
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: t('parameterPanel.errors.fileSizeExceeded', { size: (UPLOAD_CONFIG.maxFileSize / 1024 / 1024).toFixed(1) }),
    };
  }

  // 检查文件类型
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: t('parameterPanel.errors.unsupportedFileType', { type: file.type }),
    };
  }

  return { valid: true };
};

// 替换 validateAndResizeImage 逻辑为简单校验
const validateAndResizeImage = async (file: File, t: ReturnType<typeof useTranslations>): Promise<{ valid: boolean; error?: string; resizedFile?: File }> => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: t('parameterPanel.errors.unsupportedFileType', { type: file.type }) };
  }
  if (file.size > maxSize) {
    return { valid: false, error: t('parameterPanel.errors.fileSizeExceeded', { size: (maxSize / 1024 / 1024).toFixed(1) }) };
      }
  return { valid: true, resizedFile: file };
};

type ParameterPanelProps = {
  formData: DashscopeImageEditRequest;
  baseImageFiles: FormUploadFile[];
  isGenerating: boolean;
  onFormDataChange: (data: DashscopeImageEditRequest) => void;
  onBaseImageChange: (files: FormUploadFile[]) => void;
  onGenerate: () => void;
};

export function ParameterPanel({
  formData,
  baseImageFiles,
  isGenerating,
  onFormDataChange,
  onBaseImageChange,
  onGenerate,
}: ParameterPanelProps) {
  const { credits, hasEnoughCredits } = useCredits();
  const t = useTranslations();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const [imageResizeNotice, setImageResizeNotice] = useState<string | null>(null);

  // 固定需要1积分
  const creditCost = 1;
  const hasEnoughCreditForGeneration = hasEnoughCredits(creditCost);

  // 判断按钮是否禁用
  const isButtonDisabled
    = baseImageFiles.length === 0
      || !hasEnoughCreditForGeneration
      || isGenerating;

  // 按钮提示文本
  const getButtonTooltip = () => {
    if (baseImageFiles.length === 0) {
      return t('parameterPanel.tooltipUploadImage');
    }
    if (!hasEnoughCreditForGeneration) {
      return t('parameterPanel.tooltipInsufficientCredits', { cost: creditCost, balance: credits?.balance || 0 });
    }
    return '';
  };

  return (
    <div className="h-fit space-y-4">
      {/* 基础图像上传 - 放大区域 */}
      <div className="space-y-2">
        <Label htmlFor="reference-image" className="text-lg font-semibold text-foreground text-center block">
          {t('parameterPanel.referenceImage')}
          <span className="text-danger ml-1">*</span>
        </Label>
        <div className="min-h-[400px] flex items-center justify-center"> {/* 减少整体高度 */}
          <div className="w-full max-w-2xl"> {/* 进一步增加上传区域宽度 */}
        <PictureCardForm
          value={baseImageFiles}
              onChange={async (files) => {
            // 如果是新上传的文件，进行验证
            if (files.length > baseImageFiles.length) {
              const { file }: any = files[files.length - 1];
              if (file) {
                  // 基本验证
                const validation = validateImage(file, t);
                if (!validation.valid) {
                  setImageValidationError(validation.error || null);
                  return; // 不更新状态，阻止上传
                  }

                  // 尺寸验证和调整
                  const dimensionValidation = await validateAndResizeImage(file, t);
                  if (!dimensionValidation.valid) {
                    setImageValidationError(dimensionValidation.error || null);
                    return; // 不更新状态，阻止上传
                  }
                  
                  // 如果有调整后的文件，显示提示信息
                  if (dimensionValidation.resizedFile) {
                    console.log('图片已自动调整尺寸');
                    setImageResizeNotice(t('parameterPanel.notices.imageResized'));
                  } else {
                    setImageResizeNotice(null);
                  }
              }
            }
            // 清除错误
            setImageValidationError(null);
              setImageResizeNotice(null);
            onBaseImageChange(files);
          }}
          maxCount={1}
            className="w-full h-full"
          onUploadComplete={(result) => {
            if (result.success) {
              if (result.file?.url) {
                onFormDataChange({
                  ...formData,
                  base_image_url: result.file.url,
                });
              }
            }
          }}
          onUploadError={(error, file) => {
            console.error('上传失败:', error, file);
            setUploadError(error);
          }}
        />
          </div>
        </div>
        <p className="text-xs text-default-500 text-center">
          {t('parameterPanel.referenceImageDescription')}
        </p>
        {imageValidationError && (
          <p className="text-sm text-danger mt-2">{imageValidationError}</p>
        )}
        {imageResizeNotice && (
          <p className="text-sm text-warning mt-2">{imageResizeNotice}</p>
        )}
        {uploadError && (
          <p className="text-sm text-danger mt-2">{uploadError}</p>
        )}
      </div>

      {/* 图片上色按钮 */}
      <div className="mt-4">
        <Tooltip content={getButtonTooltip()} isDisabled={!isButtonDisabled || isGenerating}>
          <Button
            color="primary"
            size="lg"
            startContent={<Palette className="w-5 h-5" />}
            endContent={(
              <div className="flex items-center">
                <Coins className="w-4 h-4 mr-1" />
                {creditCost}
              </div>
            )}
            className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onPress={onGenerate}
            isLoading={isGenerating}
            isDisabled={isButtonDisabled}
          >
            {isGenerating ? t('parameterPanel.colorizing') : t('parameterPanel.colorizeImage')}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

