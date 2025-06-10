'use client';

import type {
  ApiResponse,
  Customer,
  CustomerInsert,
  CustomerUpdate,
  ImageEditResult,
  ImageEditResultInsert,
  QueryParams,
  TaskStatus,
  Upload,
  UploadInsert,
  UploadUpdate,
} from '@/types/database';
import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import {
  CustomerService,
  DatabaseUtils,
  ImageEditService,
  UploadService,
} from '@/services/databaseService';

// 通用加载状态类型
type LoadingState = {
  loading: boolean;
  error: string | null;
};

// 上传文件 Hook
export function useUploads(params?: QueryParams) {
  const { user } = useUser();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [state, setState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const fetchUploads = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setState({ loading: true, error: null });
    try {
      const response = await UploadService.getByUserId(user.id, params);
      if (response.success) {
        setUploads(response.data);
        setPagination(response.pagination);
      } else {
        setState({ loading: false, error: response.error || '获取上传文件失败' });
      }
    } catch (error) {
      setState({ loading: false, error: '获取上传文件失败' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id, params]);

  const createUpload = useCallback(async (upload: UploadInsert): Promise<ApiResponse<Upload>> => {
    setState({ loading: true, error: null });
    try {
      const response = await UploadService.create(upload);
      if (response.success) {
        await fetchUploads(); // 刷新列表
      }
      return response;
    } catch (error) {
      const errorMsg = '创建上传记录失败';
      setState({ loading: false, error: errorMsg });
      return { success: false, data: undefined as any, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchUploads]);

  const updateUpload = useCallback(async (id: string, updates: UploadUpdate): Promise<ApiResponse<Upload>> => {
    setState({ loading: true, error: null });
    try {
      const response = await UploadService.update(id, updates);
      if (response.success) {
        await fetchUploads(); // 刷新列表
      }
      return response;
    } catch (error) {
      const errorMsg = '更新上传记录失败';
      setState({ loading: false, error: errorMsg });
      return { success: false, data: undefined as any, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchUploads]);

  const deleteUpload = useCallback(async (id: string): Promise<ApiResponse<null>> => {
    setState({ loading: true, error: null });
    try {
      const response = await UploadService.delete(id);
      if (response.success) {
        await fetchUploads(); // 刷新列表
      }
      return response;
    } catch (error) {
      const errorMsg = '删除上传记录失败';
      setState({ loading: false, error: errorMsg });
      return { success: false, data: undefined as any, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchUploads]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  return {
    uploads,
    pagination,
    ...state,
    refetch: fetchUploads,
    createUpload,
    updateUpload,
    deleteUpload,
  };
}

// 图片编辑结果 Hook
export function useImageEditResults(params?: QueryParams) {
  const { user } = useUser();
  const [results, setResults] = useState<ImageEditResult[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [state, setState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const fetchResults = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setState({ loading: true, error: null });
    try {
      const response = await ImageEditService.getByUserId(user.id, params);
      if (response.success) {
        setResults(response.data);
        setPagination(response.pagination);
      } else {
        setState({ loading: false, error: response.error || '获取编辑结果失败' });
      }
    } catch (error) {
      setState({ loading: false, error: '获取编辑结果失败' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id, params]);

  const createEditResult = useCallback(async (editResult: ImageEditResultInsert): Promise<ApiResponse<ImageEditResult>> => {
    setState({ loading: true, error: null });
    try {
      const response = await ImageEditService.create(editResult);
      if (response.success) {
        await fetchResults(); // 刷新列表
      }
      return response;
    } catch (error) {
      const errorMsg = '创建编辑任务失败';
      setState({ loading: false, error: errorMsg });
      return { success: false, data: undefined as any, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchResults]);

  const updateStatus = useCallback(async (
    id: string,
    status: TaskStatus,
    updates?: Partial<ImageEditResult>,
  ): Promise<ApiResponse<ImageEditResult>> => {
    setState({ loading: true, error: null });
    try {
      const response = await ImageEditService.updateStatus(id, status, updates);
      if (response.success) {
        await fetchResults(); // 刷新列表
      }
      return response;
    } catch (error) {
      const errorMsg = '更新状态失败';
      setState({ loading: false, error: errorMsg });
      return { success: false, data: undefined as any, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchResults]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return {
    results,
    pagination,
    ...state,
    refetch: fetchResults,
    createEditResult,
    updateStatus,
  };
}

// 单个图片编辑结果 Hook
export function useImageEditResult(id: string) {
  const [result, setResult] = useState<ImageEditResult | null>(null);
  const [state, setState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const fetchResult = useCallback(async () => {
    if (!id) {
      return;
    }

    setState({ loading: true, error: null });
    try {
      const response = await ImageEditService.getById(id);
      if (response.success) {
        setResult(response.data);
      } else {
        setState({ loading: false, error: response.error || '获取编辑结果失败' });
      }
    } catch (error) {
      setState({ loading: false, error: '获取编辑结果失败' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [id]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  return {
    result,
    ...state,
    refetch: fetchResult,
  };
}

// 客户管理 Hook
export function useCustomers(params?: QueryParams) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [state, setState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const fetchCustomers = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const response = await CustomerService.list(params);
      if (response.success) {
        setCustomers(response.data);
        setPagination(response.pagination);
      } else {
        setState({ loading: false, error: response.error || '获取客户列表失败' });
      }
    } catch (error) {
      setState({ loading: false, error: '获取客户列表失败' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [params]);

  const createCustomer = useCallback(async (customer: CustomerInsert): Promise<ApiResponse<Customer>> => {
    setState({ loading: true, error: null });
    try {
      const response = await CustomerService.create(customer);
      if (response.success) {
        await fetchCustomers(); // 刷新列表
      }
      return response;
    } catch (error) {
      const errorMsg = '创建客户失败';
      setState({ loading: false, error: errorMsg });
      return { success: false, data: undefined as any, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id: string, updates: CustomerUpdate): Promise<ApiResponse<Customer>> => {
    setState({ loading: true, error: null });
    try {
      const response = await CustomerService.update(id, updates);
      if (response.success) {
        await fetchCustomers(); // 刷新列表
      }
      return response;
    } catch (error) {
      const errorMsg = '更新客户信息失败';
      setState({ loading: false, error: errorMsg });
      return { success: false, data: undefined as any, error: errorMsg };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    pagination,
    ...state,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
  };
}

// 单个客户 Hook
export function useCustomer(id?: string, email?: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [state, setState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const fetchCustomer = useCallback(async () => {
    if (!id && !email) {
      return;
    }

    setState({ loading: true, error: null });
    try {
      const response = id
        ? await CustomerService.getById(id)
        : await CustomerService.getByEmail(email!);

      if (response.success) {
        setCustomer(response.data);
      } else {
        setState({ loading: false, error: response.error || '获取客户信息失败' });
      }
    } catch (error) {
      setState({ loading: false, error: '获取客户信息失败' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [id, email]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    ...state,
    refetch: fetchCustomer,
  };
}

// 数据库统计 Hook
export function useDatabaseStats() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [state, setState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const tables = ['uploads', 'image_edit_results', 'customers'];
      const statsData: Record<string, number> = {};

      for (const table of tables) {
        const response = await DatabaseUtils.getTableStats(table);
        if (response.success) {
          statsData[table] = response.data.count;
        }
      }

      setStats(statsData);
    } catch (error) {
      setState({ loading: false, error: '获取统计信息失败' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    ...state,
    refetch: fetchStats,
  };
}

// 任务状态监控 Hook
export function useTaskMonitor(status: TaskStatus, params?: QueryParams) {
  const [tasks, setTasks] = useState<ImageEditResult[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [state, setState] = useState<LoadingState>({
    loading: false,
    error: null,
  });

  const fetchTasks = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const response = await ImageEditService.getByStatus(status, params);
      if (response.success) {
        setTasks(response.data);
        setPagination(response.pagination);
      } else {
        setState({ loading: false, error: response.error || '获取任务列表失败' });
      }
    } catch (error) {
      setState({ loading: false, error: '获取任务列表失败' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [status, params]);

  useEffect(() => {
    fetchTasks();

    // 对于进行中的任务，设置定时刷新
    if (status === 'PENDING' || status === 'RUNNING') {
      const interval = setInterval(fetchTasks, 5000); // 每5秒刷新一次
      return () => clearInterval(interval);
    }
    return undefined;
  }, [fetchTasks, status]);

  return {
    tasks,
    pagination,
    ...state,
    refetch: fetchTasks,
  };
}
