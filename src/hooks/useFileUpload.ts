'use client';

import type {
  BatchUploadResult,
  FileUploadConfig,
  FileUploadResult,
  UploadProgress,
} from '@/services/fileUploadService';
import type { Upload } from '@/types/database';
import { useCallback, useRef, useState } from 'react';
import { useSupabase } from '@/provider/SupabaseProvider';
import {
  DOCUMENT_UPLOAD_CONFIG,
  FileUploadService,
  IMAGE_UPLOAD_CONFIG,
} from '@/services/fileUploadService';

// 上传状态
export type UploadState = {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: FileUploadResult[];
};

// 文件列表状态
export type FileListState = {
  files: Upload[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
};

// 文件统计状态
export type FileStatsState = {
  totalFiles: number;
  totalSize: number;
  typeBreakdown: Record<string, number>;
  loading: boolean;
  error: string | null;
};

/**
 * 文件上传Hook
 */
export function useFileUpload(config?: FileUploadConfig) {
  const { user, isLoading } = useSupabase();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFiles: [],
  });

  const fileUploadService = useRef(new FileUploadService());

  // 重置上传状态
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFiles: [],
    });
  }, []);

  // 上传单个文件
  const uploadFile = useCallback(async (
    file: File,
    uploadConfig?: FileUploadConfig,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<FileUploadResult> => {
    // 等待用户状态加载完成
    if (isLoading) {
      // 等待用户状态加载完成，最多等待5秒
      let attempts = 0;
      const maxAttempts = 50; // 5秒，每次等待100ms

      while (isLoading && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // 如果超时仍在加载，返回错误
      if (isLoading) {
        const error = '用户状态加载超时，请刷新页面重试';
        setUploadState(prev => ({ ...prev, error }));
        return { success: false, error };
      }
    }

    if (!user?.id) {
      const error = '用户未登录';
      setUploadState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      error: null,
      progress: 0,
    }));

    try {
      const result = await fileUploadService.current.uploadFile(
        file,
        user.id,
        uploadConfig || config,
        (progress) => {
          setUploadState(prev => ({ ...prev, progress: progress.percentage }));
          onProgress?.(progress);
        },
      );

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadedFiles: [...prev.uploadedFiles, result],
        error: result.success ? null : result.error || '上传失败',
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [user?.id, config, isLoading]);

  // 批量上传文件
  const uploadFiles = useCallback(async (
    files: File[],
    uploadConfig?: FileUploadConfig,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  ): Promise<BatchUploadResult> => {
    // 等待用户状态加载完成
    if (isLoading) {
      // 等待用户状态加载完成，最多等待5秒
      let attempts = 0;
      const maxAttempts = 50; // 5秒，每次等待100ms

      while (isLoading && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // 如果超时仍在加载，返回错误
      if (isLoading) {
        const error = '用户状态加载超时，请刷新页面重试';
        setUploadState(prev => ({ ...prev, error }));
        return { success: false, results: [], successCount: 0, failureCount: files.length };
      }
    }

    if (!user?.id) {
      const error = '用户未登录';
      setUploadState(prev => ({ ...prev, error }));
      return { success: false, results: [], successCount: 0, failureCount: files.length };
    }

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      error: null,
      progress: 0,
      uploadedFiles: [],
    }));

    try {
      const result = await fileUploadService.current.uploadFiles(
        files,
        user.id,
        uploadConfig || config,
        (fileIndex, progress) => {
          const overallProgress = ((fileIndex + progress.percentage / 100) / files.length) * 100;
          setUploadState(prev => ({ ...prev, progress: overallProgress }));
          onProgress?.(fileIndex, progress);
        },
      );

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadedFiles: result.results,
        error: result.failureCount > 0 ? `${result.failureCount} 个文件上传失败` : null,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量上传失败';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      return { success: false, results: [], successCount: 0, failureCount: files.length };
    }
  }, [user?.id, config, isLoading]);

  // 删除文件
  const deleteFile = useCallback(async (fileId: string) => {
    if (!user?.id) {
      return { success: false, error: '用户未登录' };
    }

    return await fileUploadService.current.deleteFile(fileId, user.id);
  }, [user?.id]);

  // 批量删除文件
  const deleteFiles = useCallback(async (fileIds: string[]) => {
    if (!user?.id) {
      return { success: false, error: '用户未登录' };
    }

    return await fileUploadService.current.deleteFiles(fileIds, user.id);
  }, [user?.id]);

  return {
    uploadState,
    uploadFile,
    uploadFiles,
    deleteFile,
    deleteFiles,
    resetUploadState,
  };
}

/**
 * 图片上传Hook
 */
export function useImageUpload() {
  return useFileUpload(IMAGE_UPLOAD_CONFIG);
}

/**
 * 文档上传Hook
 */
export function useDocumentUpload() {
  return useFileUpload(DOCUMENT_UPLOAD_CONFIG);
}

/**
 * 文件列表Hook
 */
export function useFileList(options?: {
  type?: string;
  limit?: number;
  autoLoad?: boolean;
}) {
  const { user } = useSupabase();
  const [state, setState] = useState<FileListState>({
    files: [],
    loading: false,
    error: null,
    hasMore: true,
  });

  const fileUploadService = useRef(new FileUploadService());
  const offsetRef = useRef(0);

  // 加载文件列表
  const loadFiles = useCallback(async (reset = false) => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: '用户未登录' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const offset = reset ? 0 : offsetRef.current;
      const result = await fileUploadService.current.getUserFiles(user.id, {
        ...options,
        offset,
        limit: options?.limit || 20,
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          files: reset ? result.data : [...prev.files, ...result.data],
          loading: false,
          hasMore: result.data.length === (options?.limit || 20),
        }));

        if (reset) {
          offsetRef.current = result.data.length;
        } else {
          offsetRef.current += result.data.length;
        }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '加载文件列表失败',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '加载文件列表失败',
      }));
    }
  }, [user?.id, options]);

  // 刷新文件列表
  const refreshFiles = useCallback(() => {
    loadFiles(true);
  }, [loadFiles]);

  // 加载更多文件
  const loadMoreFiles = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadFiles(false);
    }
  }, [loadFiles, state.loading, state.hasMore]);

  // 从列表中移除文件
  const removeFileFromList = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId),
    }));
  }, []);

  // 添加文件到列表
  const addFileToList = useCallback((file: Upload) => {
    setState(prev => ({
      ...prev,
      files: [file, ...prev.files],
    }));
  }, []);

  return {
    ...state,
    loadFiles: refreshFiles,
    loadMoreFiles,
    refreshFiles,
    removeFileFromList,
    addFileToList,
  };
}

/**
 * 文件统计Hook
 */
export function useFileStats() {
  const { user } = useSupabase();
  const [state, setState] = useState<FileStatsState>({
    totalFiles: 0,
    totalSize: 0,
    typeBreakdown: {},
    loading: false,
    error: null,
  });

  const fileUploadService = useRef(new FileUploadService());

  // 加载统计信息
  const loadStats = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: '用户未登录' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fileUploadService.current.getFileStats(user.id);

      if (result.success) {
        setState(prev => ({
          ...prev,
          ...result.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || '加载统计信息失败',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '加载统计信息失败',
      }));
    }
  }, [user?.id]);

  return {
    ...state,
    loadStats,
  };
}

/**
 * 拖拽上传Hook
 */
export function useDragAndDrop({
  onFilesSelected,
  accept,
  multiple = true,
}: {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);

    // 过滤文件类型
    let filteredFiles = files;
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      filteredFiles = files.filter(file =>
        acceptedTypes.some((acceptedType) => {
          if (acceptedType.startsWith('.')) {
            return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
          }
          return file.type.match(acceptedType.replace('*', '.*'));
        }),
      );
    }

    // 限制文件数量
    if (!multiple && filteredFiles.length > 1) {
      filteredFiles = [filteredFiles[0]!];
    }

    onFilesSelected(filteredFiles);
  }, [onFilesSelected, accept, multiple]);

  const dragProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  return {
    isDragOver,
    dragProps,
  };
}
