import type { ApiResponse, Upload, UploadInsert } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

import { createSupabaseClient } from '@/lib/supabase';

// 文件上传配置
export type FileUploadConfig = {
  maxFileSize: number; // 最大文件大小（字节）
  allowedTypes: string[]; // 允许的文件类型
  bucket: string; // 存储桶名称
  folder?: string; // 文件夹路径
};

// 文件上传进度回调
export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

// 文件上传结果
export type FileUploadResult = {
  success: boolean;
  file?: {
    id: string;
    url: string;
    key: string;
    type: string;
    size: number;
    name: string;
  };
  error?: string;
};

// 批量上传结果
export type BatchUploadResult = {
  success: boolean;
  results: FileUploadResult[];
  successCount: number;
  failureCount: number;
};

// 默认配置
const DEFAULT_CONFIG: FileUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  bucket: 'uploads',
};

// 图片专用配置
export const IMAGE_UPLOAD_CONFIG: FileUploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  bucket: 'images',
  folder: 'user-uploads',
};

// 文档专用配置
export const DOCUMENT_UPLOAD_CONFIG: FileUploadConfig = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  bucket: 'documents',
  folder: 'user-documents',
};

export class FileUploadService {
  private supabase = createSupabaseClient();

  /**
   * 验证文件
   */
  private validateFile(file: File, config: FileUploadConfig): { valid: boolean; error?: string } {
    // 检查文件大小
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `文件大小超过限制（${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB）`,
      };
    }

    // 检查文件类型
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `不支持的文件类型：${file.type}`,
      };
    }

    return { valid: true };
  }

  /**
   * 生成文件路径
   */
  private generateFilePath(file: File, config: FileUploadConfig, userId: string): string {
    const timestamp = Date.now();
    const randomId = uuidv4().substring(0, 8);
    const extension = file.name.split('.').pop() || '';
    const fileName = `${timestamp}_${randomId}.${extension}`;

    const basePath = config.folder ? `${config.folder}/${userId}` : userId;
    return `${basePath}/${fileName}`;
  }

  /**
   * 上传单个文件到Supabase Storage
   */
  async uploadFile(
    file: File,
    userId: string,
    config: FileUploadConfig = DEFAULT_CONFIG,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<FileUploadResult> {
    try {
      // 验证文件
      const validation = this.validateFile(file, config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // 生成文件路径
      const filePath = this.generateFilePath(file, config, userId);
      const fileId = uuidv4();

      // 上传到Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from(config.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`文件上传失败: ${uploadError.message}`);
      }

      // 获取公共URL
      const { data: urlData } = this.supabase.storage
        .from(config.bucket)
        .getPublicUrl(filePath);

      // 保存文件信息到数据库
      const uploadRecord: UploadInsert = {
        id: fileId,
        userId,
        key: filePath,
        url: urlData.publicUrl,
        type: file.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error: dbError } = await this.supabase
        .from('uploads')
        .insert(uploadRecord)
        .select()
        .single();

      if (dbError) {
        // 如果数据库保存失败，删除已上传的文件
        await this.supabase.storage.from(config.bucket).remove([filePath]);
        throw new Error(`数据库保存失败: ${dbError.message}`);
      }

      // 模拟进度回调
      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size, percentage: 100 });
      }

      return {
        success: true,
        file: {
          id: fileId,
          url: urlData.publicUrl,
          key: filePath,
          type: file.type,
          size: file.size,
          name: file.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      };
    }
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: File[],
    userId: string,
    config: FileUploadConfig = DEFAULT_CONFIG,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  ): Promise<BatchUploadResult> {
    const results: FileUploadResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const result = await this.uploadFile(
        file,
        userId,
        config,
        onProgress ? progress => onProgress(i, progress) : undefined,
      );

      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    return {
      success: successCount > 0,
      results,
      successCount,
      failureCount,
    };
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string, userId: string): Promise<ApiResponse<null>> {
    try {
      // 获取文件信息
      const { data: fileData, error: fetchError } = await this.supabase
        .from('uploads')
        .select('*')
        .eq('id', fileId)
        .eq('userId', userId)
        .single();

      if (fetchError || !fileData) {
        throw new Error('文件不存在或无权限删除');
      }

      // 从Storage删除文件
      const bucketName = this.getBucketFromUrl(fileData.url);
      const { error: storageError } = await this.supabase.storage
        .from(bucketName)
        .remove([fileData.key]);

      if (storageError) {
        console.warn('Storage删除失败:', storageError.message);
      }

      // 从数据库删除记录
      const { error: dbError } = await this.supabase
        .from('uploads')
        .delete()
        .eq('id', fileId)
        .eq('userId', userId);

      if (dbError) {
        throw new Error(`数据库删除失败: ${dbError.message}`);
      }

      return {
        success: true,
        data: undefined as any,
        message: '文件删除成功',
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '删除失败',
      };
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(fileIds: string[], userId: string): Promise<ApiResponse<{ successCount: number; failureCount: number }>> {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const fileId of fileIds) {
      const result = await this.deleteFile(fileId, userId);
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        if (result.error) {
          errors.push(`${fileId}: ${result.error}`);
        }
      }
    }

    return {
      success: successCount > 0,
      data: { successCount, failureCount },
      message: `删除完成：成功 ${successCount} 个，失败 ${failureCount} 个`,
      error: errors.length > 0 ? errors.join('; ') : undefined,
    };
  }

  /**
   * 获取用户文件列表
   */
  async getUserFiles(
    userId: string,
    options?: {
      type?: string;
      limit?: number;
      offset?: number;
      sortBy?: 'createdAt' | 'updatedAt' | 'type';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<ApiResponse<Upload[]>> {
    try {
      let query = this.supabase
        .from('uploads')
        .select('*')
        .eq('userId', userId);

      // 按类型筛选
      if (options?.type) {
        query = query.eq('type', options.type);
      }

      // 排序
      const sortBy = options?.sortBy || 'createdAt';
      const sortOrder = options?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // 分页
      if (options?.limit) {
        const offset = options.offset || 0;
        query = query.range(offset, offset + options.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: '获取文件列表成功',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '获取文件列表失败',
      };
    }
  }

  /**
   * 获取文件统计信息
   */
  async getFileStats(userId: string): Promise<ApiResponse<{
    totalFiles: number;
    totalSize: number;
    typeBreakdown: Record<string, number>;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('uploads')
        .select('type')
        .eq('userId', userId);

      if (error) {
        throw error;
      }

      const totalFiles = data?.length || 0;
      const typeBreakdown: Record<string, number> = {};

      data?.forEach((file) => {
        typeBreakdown[file.type] = (typeBreakdown[file.type] || 0) + 1;
      });

      return {
        success: true,
        data: {
          totalFiles,
          totalSize: 0, // 需要额外查询或存储文件大小信息
          typeBreakdown,
        },
        message: '获取统计信息成功',
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalFiles: 0,
          totalSize: 0,
          typeBreakdown: {},
        },
        error: error instanceof Error ? error.message : '获取统计信息失败',
      };
    }
  }

  /**
   * 从URL提取bucket名称
   */
  private getBucketFromUrl(url: string): string {
    // 假设URL格式为: https://xxx.supabase.co/storage/v1/object/public/bucket/path
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)/);
    return match ? match[1]! : 'uploads';
  }

  /**
   * 生成预签名上传URL（用于大文件上传）
   */
  async generatePresignedUrl(
    fileName: string,
    fileType: string,
    userId: string,
    config: FileUploadConfig = DEFAULT_CONFIG,
  ): Promise<ApiResponse<{ uploadUrl: string; filePath: string }>> {
    try {
      const filePath = this.generateFilePath(
        { name: fileName, type: fileType } as File,
        config,
        userId,
      );

      // Supabase Storage 不直接支持预签名URL，这里返回路径供客户端使用
      return {
        success: true,
        data: {
          uploadUrl: '', // Supabase使用客户端直接上传
          filePath,
        },
        message: '生成上传路径成功',
      };
    } catch (error) {
      return {
        success: false,
        data: { uploadUrl: '', filePath: '' },
        error: error instanceof Error ? error.message : '生成上传路径失败',
      };
    }
  }
}

// 导出单例实例
export const fileUploadService = new FileUploadService();

// 工具函数
export const FileUploadUtils = {
  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  },

  /**
   * 获取文件扩展名
   */
  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  },

  /**
   * 检查是否为图片文件
   */
  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  },

  /**
   * 检查是否为文档文件
   */
  isDocumentFile(fileType: string): boolean {
    const documentTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    return documentTypes.includes(fileType);
  },

  /**
   * 生成文件预览URL
   */
  generatePreviewUrl(file: Upload): string {
    if (this.isImageFile(file.type)) {
      return file.url;
    }
    // 对于非图片文件，可以返回默认图标或文档预览服务URL
    return '/icons/file-default.svg';
  },
};
