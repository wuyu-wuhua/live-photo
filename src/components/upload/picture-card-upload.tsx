'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import ImageUploading, { type ImageListType } from 'react-images-uploading';
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// 常量定义
const STORAGE_BUCKET = 'live-photos';
const ACCEPTED_FILE_TYPES = ['jpg', 'gif', 'png', 'jpeg', 'webp'];

// 默认值常量
const DEFAULT_FILE_LIST: UploadFile[] = [];

export type PictureCardUploadProps = {
  /**
   * 是否自动上传到 Supabase
   */
  autoUpload?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 已上传的文件列表
   */
  fileList?: UploadFile[];
  /**
   * 上传文件数量限制
   */
  maxCount?: number;
  /**
   * 上传文件改变时的回调
   */
  onChange?: (fileList: UploadFile[]) => void;
  /**
   * 选择文件后的回调，用户可以在这里实现自己的上传逻辑
   */
  onSelectFile?: (file: File) => void;
  /**
   * 用户ID，用于 Supabase 上传
   */
  userId?: string;
};

export type UploadFile = {
  dataURL?: string;
  name: string;
  percent?: number;
  status?: 'done' | 'error' | 'uploading';
  uid: string;
  url: string;
  error?: string; // 添加 error 属性
};

/**
 * 图片卡片上传组件，类似 Ant Design Upload 的 picture-card 模式
 * 使用 react-images-uploading 和 Supabase 存储
 */
export function PictureCardUpload({
  autoUpload = true,
  className,
  disabled = false,
  fileList: propFileList = DEFAULT_FILE_LIST,
  maxCount = 1,
  onChange,
  onSelectFile,
  userId,
}: PictureCardUploadProps) {
  const t = useTranslations('upload');
  const [fileList, setFileList] = useState<UploadFile[]>(propFileList);
  const [images, setImages] = useState<ImageListType>([]);
  const supabase = createClient();

  // 同步外部传入的 fileList
  useEffect(() => {
    setFileList(propFileList);
  }, [propFileList]);

  // 组件卸载时清理 blob URLs
  useEffect(() => {
    return () => {
      fileList.forEach((file) => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [fileList]);

  // 处理文件列表变化
  const handleFileListChange = useCallback((newFileList: UploadFile[]) => {
    setFileList(newFileList);
    onChange?.(newFileList);
  }, [onChange]);

  // 删除文件
  const handleRemove = useCallback(
    (file: UploadFile) => {
      // 清理 blob URL 防止内存泄漏
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }

      const newFileList = fileList.filter(item => item.uid !== file.uid);
      handleFileListChange(newFileList);
      // 同时清空 images 状态，确保 react-images-uploading 组件状态同步
      setImages([]);
    },
    [fileList, handleFileListChange],
  );

  // 预览图片
  const handlePreview = (file: UploadFile) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  // 上传文件到 Supabase
  const uploadToSupabase = useCallback(async (file: File): Promise<UploadFile> => {
    if (!userId) {
      throw new Error(t('userIdRequired'));
    }

    // 获取文件扩展名
    const fileExtension = file.name.split('.').pop() || '';
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 创建临时文件对象显示上传进度
    const tempFile: UploadFile = {
      name: file.name,
      percent: 0,
      status: 'uploading',
      uid: tempId,
      url: URL.createObjectURL(file),
    };

    // 添加到文件列表中显示上传状态
    const newFileList = [...fileList, tempFile];
    handleFileListChange(newFileList);

    try {
      // 上传文件到 Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(tempId, file);

      if (storageError) {
        console.error('Storage upload error:', storageError);
        throw new Error(`${t('fileUploadFailed')}: ${storageError.message}`);
      }

      if (!storageData?.fullPath) {
        throw new Error(t('uploadDataError'));
      }

      // 获取公共 URL - 使用 path 而不是 fullPath 避免重复路径
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storageData.path);

      const key = storageData.id;
      const url = urlData.publicUrl;

      // 调试信息
      console.warn('Upload success:', {
        fullPath: storageData.fullPath,
        key,
        path: storageData.path,
        publicUrl: url,
      });
      const now = new Date().toISOString();

      // 保存到数据库
      const uploadData = {
        createdAt: now,
        id: uuidv4(),
        key,
        type: file.type,
        updatedAt: now,
        url,
        userId,
      };

      const { error: dbError } = await supabase
        .from('uploads')
        .insert(uploadData)
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // 如果数据库插入失败，尝试删除已上传的文件
        try {
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([storageData.path]);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
                  throw new Error(`${t('saveRecordFailed')}: ${dbError.message}`);
      }

      const uploadedFile: UploadFile = {
        name: file.name,
        percent: 100,
        status: 'done',
        uid: key,
        url,
      };

      // 替换临时文件
      const updatedFileList = newFileList.map(f =>
        f.uid === tempId ? uploadedFile : f,
      );
      handleFileListChange(updatedFileList);

      return uploadedFile;
    } catch (error) {
      console.error('Upload failed:', error);

      // 更新文件状态为错误
      const errorFile: UploadFile = {
        ...tempFile,
        status: 'error',
      };

      const updatedFileList = newFileList.map(f =>
        f.uid === tempId ? errorFile : f,
      );
      handleFileListChange(updatedFileList);

      throw error;
    }
  }, [fileList, handleFileListChange, userId, t]);

  // 处理图片变化
  const handleImagesChange = useCallback(async (imageList: ImageListType) => {
    setImages(imageList);

    // 处理新添加的图片
    for (const image of imageList) {
      if (image.file && !fileList.some(f => f.name === image.file!.name)) {
        onSelectFile?.(image.file);

        if (autoUpload) {
          try {
            await uploadToSupabase(image.file);
          } catch {
            // 错误已在 uploadToSupabase 中处理
          }
        }
      }
    }
  }, [fileList, onSelectFile, autoUpload, uploadToSupabase]);

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <ImageUploading
        acceptType={ACCEPTED_FILE_TYPES}
        dataURLKey="data_url"
        maxNumber={maxCount}
        multiple={maxCount > 1}
        onChange={handleImagesChange}
        value={images}
      >
        {({ dragProps, isDragging, onImageUpload }) => (
          <>
            {/* 已上传的文件列表 */}
            {fileList.map(file => (
              <div
                className={`
                  relative flex h-24 w-24 cursor-pointer items-center
                  justify-center overflow-hidden rounded-md border bg-background
                  shadow-sm
                  hover:bg-accent/50
                `}
                key={file.uid}
                onClick={() => handlePreview(file)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePreview(file);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {file.status === 'uploading'
                  ? (
                      <div
                        className={`
                          flex h-full w-full items-center justify-center
                          bg-background/80
                        `}
                      >
                        <Image
                          alt={file.name}
                          className="absolute h-full w-full object-cover opacity-50"
                          onError={() => {
                            console.warn('Preview image load error:', file.url);
                            // e.currentTarget.style.display = 'none'
                          }}
                          src={file.url}
                        />
                        <Loader2
                          className="size-6 animate-spin text-muted-foreground"
                        />
                        {file.percent !== undefined && (
                          <div
                            className={`
                              absolute right-0 bottom-1 left-0 text-center text-xs
                              font-medium
                            `}
                          >
                            {Math.floor(file.percent)}
                            %
                          </div>
                        )}
                      </div>
                    )
                  : file.status === 'error'
                    ? (
                        <div
                          className={`
                      flex h-full w-full items-center justify-center bg-red-50
                      text-red-500
                    `}
                        >
                          <div className="text-center">
                            <X className="mx-auto mb-1 size-6" />
                            <span className="text-xs">{t('uploadFailed')}</span>
                            {file.error && (
                              <div className="mt-1 text-xs text-red-400">
                                {file.error}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    : (
                        <>
                          <Image
                            alt={file.name}
                            className="h-full w-full object-cover"
                            onError={() => {
                              console.warn('Image load error:', file.url);
                              // 使用 DOM API 获取当前图片元素
                              const images = document.querySelectorAll(`img[src="${file.url}"]`);
                              const target = images[images.length - 1];
                              if (target) {
                                (target as HTMLElement).style.display = 'none';
                                // 显示错误占位符
                                const errorDiv = target.nextElementSibling as HTMLElement;
                                if (
                                  errorDiv
                                  && errorDiv.classList.contains('error-placeholder')
                                ) {
                                  errorDiv.style.display = 'flex';
                                }
                              }
                            }}
                            src={file.url}
                          />
                          <div
                            className={`
                        error-placeholder hidden h-full w-full items-center
                        justify-center bg-gray-100 text-gray-500
                      `}
                            style={{ display: 'none' }}
                          >
                            <div className="text-center">
                              <X className="mx-auto mb-1 size-6" />
                              <span className="text-xs">{t('loadFailed')}</span>
                            </div>
                          </div>
                          <div
                            className={`
                        absolute inset-0 flex items-center justify-center
                        opacity-0 transition-opacity
                        hover:bg-black/50 hover:opacity-100
                      `}
                          >
                            <Button
                              className="rounded-full bg-black/50 p-1 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(file);
                              }}
                              type="button"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </>
                      )}
              </div>
            ))}

            {/* 上传按钮 */}
            {fileList.length < maxCount && !disabled && (
              <div
                className={cn(
                  `
                    flex h-24 w-24 cursor-pointer items-center justify-center
                    rounded-md border border-dashed bg-background shadow-sm
                    hover:bg-accent/50
                  `,
                  isDragging && 'border-primary bg-primary/10',
                )}
                onClick={onImageUpload}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onImageUpload();
                  }
                }}
                role="button"
                tabIndex={0}
                {...dragProps}
              >
                <div
                  className={`
                    flex flex-col items-center justify-center gap-1
                    text-muted-foreground
                  `}
                >
                  <Upload className="size-5" />
                  <span className="text-xs">
                    {isDragging ? t('dragHere') : t('uploadImage')}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </ImageUploading>
    </div>
  );
}
