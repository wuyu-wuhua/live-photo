'use client';

import type { FileUploadConfig, FileUploadResult } from '@/services/fileUploadService';
import { Button } from '@heroui/react';
import { Loader2, Upload, X } from 'lucide-react';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ImageUploading, { type ImageListType } from 'react-images-uploading';
import { useImageUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

// 常量定义
const ACCEPTED_FILE_TYPES = ['jpg', 'gif', 'png', 'jpeg', 'webp'] as const;
const DEFAULT_FILE_LIST: FormUploadFile[] = [];
const UPLOAD_CONFIG: FileUploadConfig = {
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpg', 'image/gif', 'image/png', 'image/jpeg', 'image/webp'],
  bucket: 'live-photos',
};

export type FormUploadFile = {
  id: string;
  name: string;
  url: string;
  status: 'done' | 'error' | 'uploading';
  progress?: number;
  error?: string;
  file?: File;
  uploadedFileId?: string; // 实际上传后的文件ID
};

export type PictureCardFormProps = {
  className?: string;
  disabled?: boolean;
  value?: FormUploadFile[];
  maxCount?: number;
  onChange?: (fileList: FormUploadFile[]) => void;
  onUploadComplete?: (result: FileUploadResult) => void;
  onUploadError?: (error: string, file: File) => void;
  onRemove?: (file: FormUploadFile) => void;
};

/**
 * 图片卡片表单上传组件
 */
export function PictureCardForm({
  className,
  disabled = false,
  value = DEFAULT_FILE_LIST,
  maxCount = 1,
  onChange,
  onUploadComplete,
  onUploadError,
  onRemove,
}: PictureCardFormProps) {
  const [fileList, setFileList] = useState<FormUploadFile[]>(value);
  const [images, setImages] = useState<ImageListType>([]);
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const uploadingFilesRef = useRef<Set<string>>(new Set());

  const { uploadState, uploadFile } = useImageUpload();

  // 同步外部传入的 value
  useEffect(() => {
    setFileList(value);
  }, [value]);

  // 清理 blob URLs
  const cleanupBlobUrls = useCallback(() => {
    blobUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    blobUrlsRef.current.clear();
  }, []);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, [cleanupBlobUrls]);

  // 创建 blob URL 并记录
  const createBlobUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    return url;
  }, []);

  // 清理单个 blob URL
  const cleanupBlobUrl = useCallback((url: string) => {
    if (url.startsWith('blob:') && blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  }, []);

  // 处理文件列表变化
  const handleFileListChange = useCallback((newFileList: FormUploadFile[]) => {
    setFileList(newFileList);
    onChange?.(newFileList);
  }, [onChange]);

  // 生成唯一ID
  const generateId = useCallback(() => {
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }, []);

  // 更新文件状态
  const updateFileStatus = useCallback((tempId: string, updates: Partial<FormUploadFile>) => {
    setFileList(prev => prev.map(f =>
      f.id === tempId ? { ...f, ...updates } : f,
    ));
  }, []);

  // 删除文件
  const handleRemove = useCallback(
    (file: FormUploadFile) => {
      cleanupBlobUrl(file.url);

      const newFileList = fileList.filter(item => item.id !== file.id);
      handleFileListChange(newFileList);

      // 清空 images 状态以同步 react-images-uploading
      setImages([]);

      onRemove?.(file);
    },
    [fileList, handleFileListChange, onRemove, cleanupBlobUrl],
  );

  // 预览图片
  const handlePreview = useCallback((file: FormUploadFile) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  }, []);

  // 上传文件
  const handleUploadFile = useCallback(async (file: File) => {
    const tempId = generateId();
    const fileName = file.name;

    // 防止重复上传
    if (uploadingFilesRef.current.has(fileName)) {
      console.warn('File is already being uploaded:', fileName);
      return;
    }

    uploadingFilesRef.current.add(fileName);

    try {
      const tempFile: FormUploadFile = {
        id: tempId,
        name: fileName,
        status: 'uploading',
        url: createBlobUrl(file),
        progress: 0,
        file,
      };

      // 添加到文件列表
      const newFileList = [...fileList, tempFile];
      handleFileListChange(newFileList);

      // 上传文件
      const result = await uploadFile(file, UPLOAD_CONFIG, (progress) => {
        updateFileStatus(tempId, { progress: progress.percentage });
      });

      if (result.success && result.file) {
        // 上传成功 - 保持原有的tempId，只更新其他字段
        const uploadedFile: FormUploadFile = {
          id: tempId, // 保持临时ID，确保能正确更新
          name: result.file.name,
          url: result.file.url,
          status: 'done',
          progress: 100,
          uploadedFileId: result.file.id, // 保存实际的文件ID
        };

        updateFileStatus(tempId, uploadedFile);
        onUploadComplete?.(result);
      } else {
        // 上传失败
        const errorMessage = result.error || '上传失败';
        updateFileStatus(tempId, {
          status: 'error',
          error: errorMessage,
        });
        onUploadError?.(errorMessage, file);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      updateFileStatus(tempId, {
        status: 'error',
        error: errorMessage,
      });
      onUploadError?.(errorMessage, file);
    } finally {
      uploadingFilesRef.current.delete(fileName);
    }
  }, [fileList, handleFileListChange, onUploadComplete, onUploadError, generateId, createBlobUrl, updateFileStatus, uploadFile]);

  // 处理图片变化
  const handleImagesChange = useCallback(async (imageList: ImageListType) => {
    setImages(imageList);

    // 处理新添加的图片
    const uploadPromises = imageList
      .filter((image) => {
        if (!image.file) {
          return false;
        }

        // 检查文件是否已存在
        const fileExists = fileList.some(f =>
          f.name === image.file!.name
          && (f.status === 'done' || f.status === 'uploading'),
        );

        return !fileExists;
      })
      .map(image => handleUploadFile(image.file!));

    // 并发上传所有新文件
    await Promise.allSettled(uploadPromises);
  }, [fileList, handleUploadFile]);

  // 重试上传
  const handleRetry = useCallback((file: FormUploadFile) => {
    if (!file.file) {
      return;
    }

    // 移除错误的文件
    const newFileList = fileList.filter(item => item.id !== file.id);
    setFileList(newFileList);

    // 重新上传
    handleUploadFile(file.file);
  }, [fileList, handleUploadFile]);

  // 渲染文件卡片
  const renderFileCard = useCallback((file: FormUploadFile) => {
    const isUploading = file.status === 'uploading';
    const isError = file.status === 'error';
    const isDone = file.status === 'done';

    return (
      <div
        key={file.id}
        className={cn(
          'relative flex h-24 w-24 cursor-pointer items-center',
          'justify-center overflow-hidden rounded-md border bg-background',
          'shadow-sm transition-colors',
          isDone && 'hover:bg-accent/50',
        )}
        onClick={() => isDone && handlePreview(file)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && isDone) {
            e.preventDefault();
            handlePreview(file);
          }
        }}
        role={isDone ? 'button' : undefined}
        tabIndex={isDone ? 0 : undefined}
      >
        {isUploading && (
          <div className="flex h-full w-full items-center justify-center bg-background/80">
            {file.url && (
              <Image
                alt={file.name}
                width={96}
                height={96}
                className="absolute h-full w-full object-cover opacity-50"
                src={file.url}
                unoptimized={file.url.startsWith('blob:')}
                onError={() => console.warn('Preview image load error:', file.url)}
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              {typeof file.progress === 'number' && (
                <div className="mt-1 text-xs font-medium text-muted-foreground">
                  {Math.floor(file.progress)}
                  %
                </div>
              )}
            </div>
          </div>
        )}

        {isError && (
          <div className="flex h-full w-full flex-col items-center justify-center bg-red-50 text-red-500">
            <X className="mb-1 size-6" />
            <span className="text-xs">上传失败</span>
            {file.error && (
              <div className="mt-1 px-1 text-center text-xs text-red-400">
                {file.error}
              </div>
            )}
            <button
              className="mt-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleRetry(file);
              }}
              type="button"
            >
              重试
            </button>
          </div>
        )}

        {isDone && (
          <>
            <Image
              alt={file.name}
              className="h-full w-full object-cover"
              width={96}
              height={96}
              src={file.url}
              onError={() => console.warn('Image load error:', file.url)}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:bg-black/50 hover:opacity-100">
              <Button
                className="rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file);
                }}
                type="button"
                size="sm"
              >
                <X className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }, [handlePreview, handleRetry, handleRemove]);

  // 是否可以上传更多文件
  const canUploadMore = useMemo(() => {
    return fileList.length < maxCount && !disabled;
  }, [fileList.length, maxCount, disabled]);

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <ImageUploading
        acceptType={ACCEPTED_FILE_TYPES}
        dataURLKey="data_url"
        maxNumber={maxCount}
        multiple={maxCount > 1}
        onChange={handleImagesChange}
        value={images}
        inputProps={{
          id: 'image-upload-input',
          name: 'image-upload',
          onClick: (e) => {
            // 清除之前的值，确保相同文件可以再次选择
            (e.currentTarget as HTMLInputElement).value = '';
          },
        }}
      >
        {({ dragProps, isDragging, onImageUpload }) => (
          <>
            {/* 已上传的文件列表 */}
            {fileList.map(renderFileCard)}

            {/* 上传按钮 */}
            {canUploadMore && (
              <div
                className={cn(
                  'flex h-24 w-24 cursor-pointer items-center justify-center',
                  'rounded-md border border-dashed bg-background shadow-sm',
                  'transition-colors hover:bg-accent/50',
                  isDragging && 'border-primary bg-primary/10',
                  uploadState.isUploading && 'pointer-events-none opacity-50',
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
                <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <Upload className="size-5" />
                  <span className="text-xs">
                    {isDragging ? '拖拽到此' : '上传图片'}
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
