import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ApiResponse,
  Customer,
  CustomerInsert,
  CustomerUpdate,
  ImageEditResult,
  ImageEditResultInsert,
  ImageEditResultUpdate,
  PaginatedResponse,
  QueryParams,
  TaskStatus,
  Upload,
  UploadInsert,
  UploadUpdate,
} from '@/types/database';
import { createSupabaseClient } from '@/lib/supabase';

const supabase = createSupabaseClient();

// 上传文件服务
export class UploadService {
  static async create(upload: UploadInsert): Promise<ApiResponse<Upload>> {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .insert(upload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '文件上传成功',
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '上传失败',
      };
    }
  }

  static async getByUserId(userId: string, params?: QueryParams): Promise<PaginatedResponse<Upload>> {
    try {
      let query = supabase
        .from('uploads')
        .select('*', { count: 'exact' })
        .eq('userId', userId);

      // 排序
      if (params?.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' });
      } else {
        query = query.order('createdAt', { ascending: false });
      }

      // 分页
      if (params?.limit) {
        const offset = params.offset || (params.page ? (params.page - 1) * params.limit : 0);
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const limit = params?.limit || data?.length || 0;
      const page = params?.page || 1;

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '获取上传文件失败',
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  static async update(id: string, updates: UploadUpdate): Promise<ApiResponse<Upload>> {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '文件信息更新成功',
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '更新失败',
      };
    }
  }

  static async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
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
}

// 图片编辑结果服务
export class ImageEditService {
  static async create(editResult: ImageEditResultInsert, customClient?: any): Promise<ApiResponse<ImageEditResult>> {
    try {
      const client = customClient || supabase;
      const { data, error } = await client
        .from('image_edit_results')
        .insert(editResult)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '图片编辑任务创建成功',
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '创建任务失败',
      };
    }
  }

  static async getById(id: string, customClient?: any): Promise<ApiResponse<ImageEditResult>> {
    try {
      const client = customClient || supabase;
      const { data, error } = await client
        .from('image_edit_results')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '获取编辑结果失败',
      };
    }
  }

  static async getByUserId(userId: string, params?: QueryParams, customClient?: any): Promise<PaginatedResponse<ImageEditResult>> {
    try {
      const client = customClient || supabase;
      let query = client
        .from('image_edit_results')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // 状态过滤
      if (params?.filters?.status) {
        query = query.eq('status', params.filters.status);
      }

      // 类型过滤
      if (params?.filters?.result_type) {
        query = query.eq('result_type', params.filters.result_type);
      }

      // 展示过滤
      if (params?.filters?.is_showcase !== undefined) {
        query = query.eq('is_showcase', params.filters.is_showcase);
      }

      // 排序
      if (params?.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // 分页
      if (params?.limit) {
        const offset = params.offset || (params.page ? (params.page - 1) * params.limit : 0);
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const limit = params?.limit || data?.length || 0;
      const page = params?.page || 1;

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '获取编辑结果失败',
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  // 新增：获取所有用户同意展示的作品
  static async getShowcaseItems(params?: QueryParams, customClient?: any): Promise<PaginatedResponse<ImageEditResult>> {
    try {
      const client = customClient || supabase;
      let query = client
        .from('image_edit_results')
        .select('*', { count: 'exact' })
        .eq('is_showcase', true);

      // 状态过滤
      if (params?.filters?.status) {
        query = query.eq('status', params.filters.status);
      }

      // 类型过滤
      if (params?.filters?.result_type) {
        query = query.eq('result_type', params.filters.result_type);
      }

      // 排序
      if (params?.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // 分页
      if (params?.limit) {
        const offset = params.offset || (params.page ? (params.page - 1) * params.limit : 0);
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const limit = params?.limit || data?.length || 0;
      const page = params?.page || 1;

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '获取展示作品失败',
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  static async updateStatus(
    id: string,
    statusOrUpdates: TaskStatus | Partial<ImageEditResultUpdate>,
    updates?: Partial<ImageEditResultUpdate>,
    customClient?: SupabaseClient,
  ): Promise<ApiResponse<ImageEditResult>> {
    try {
      const client = customClient || supabase;
      // 如果第二个参数是字符串，则为旧的调用方式（包含status）
      // 如果第二个参数是对象，则为新的调用方式（只有updates）
      let updateData: any;
      if (typeof statusOrUpdates === 'string') {
        updateData = { status: statusOrUpdates, ...updates };
      } else {
        updateData = statusOrUpdates;
      }
      const { data, error } = await client
        .from('image_edit_results')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '状态更新成功',
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '状态更新失败',
      };
    }
  }

  static async getByStatus(status: TaskStatus, params?: QueryParams, customClient?: any): Promise<PaginatedResponse<ImageEditResult>> {
    try {
      const client = customClient || supabase;
      let query = client
        .from('image_edit_results')
        .select('*', { count: 'exact' })
        .eq('status', status);

      // 排序
      if (params?.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // 分页
      if (params?.limit) {
        const offset = params.offset || (params.page ? (params.page - 1) * params.limit : 0);
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const limit = params?.limit || data?.length || 0;
      const page = params?.page || 1;

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '获取任务失败',
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }
}

// 客户服务
export class CustomerService {
  static async create(customer: CustomerInsert): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '客户创建成功',
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '创建客户失败',
      };
    }
  }

  static async getById(id: string): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '获取客户信息失败',
      };
    }
  }

  static async getByEmail(email: string): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '获取客户信息失败',
      };
    }
  }

  static async update(id: string, updates: CustomerUpdate): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '客户信息更新成功',
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        error: error instanceof Error ? error.message : '更新客户信息失败',
      };
    }
  }

  static async list(params?: QueryParams): Promise<PaginatedResponse<Customer>> {
    try {
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' });

      // 搜索过滤
      if (params?.filters?.search) {
        query = query.or(`name.ilike.%${params.filters.search}%,email.ilike.%${params.filters.search}%`);
      }

      // 排序
      if (params?.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' });
      } else {
        query = query.order('created', { ascending: false });
      }

      // 分页
      if (params?.limit) {
        const offset = params.offset || (params.page ? (params.page - 1) * params.limit : 0);
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const limit = params?.limit || data?.length || 0;
      const page = params?.page || 1;

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '获取客户列表失败',
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }
}

// 通用数据库工具函数
export class DatabaseUtils {
  /**
   * 执行原始 SQL 查询
   */
  static async executeRawQuery<T = any>(query: string, params?: any[]): Promise<ApiResponse<T[]>> {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query,
        params: params || [],
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '查询执行失败',
      };
    }
  }

  /**
   * 获取表统计信息
   */
  static async getTableStats(tableName: string): Promise<ApiResponse<{ count: number }>> {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: { count: count || 0 },
      };
    } catch (error) {
      return {
        success: false,
        data: { count: 0 },
        error: error instanceof Error ? error.message : '获取统计信息失败',
      };
    }
  }

  /**
   * 批量插入数据
   */
  static async batchInsert<T>(tableName: string, records: T[]): Promise<ApiResponse<T[]>> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(records)
        .select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: `成功插入 ${data?.length || 0} 条记录`,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '批量插入失败',
      };
    }
  }

  /**
   * 批量更新数据
   */
  static async batchUpdate<T>(
    tableName: string,
    updates: Array<{ id: string; data: Partial<T> }>,
  ): Promise<ApiResponse<T[]>> {
    try {
      const results: T[] = [];

      for (const update of updates) {
        const { data, error } = await supabase
          .from(tableName)
          .update(update.data)
          .eq('id', update.id)
          .select()
          .single();

        if (error) {
          throw error;
        }
        if (data) {
          results.push(data);
        }
      }

      return {
        success: true,
        data: results,
        message: `成功更新 ${results.length} 条记录`,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '批量更新失败',
      };
    }
  }
}
