import type { DashscopeImageEditRequest, DashscopeTaskQueryResponse } from '@/types/dashscope';
import { useCallback, useState } from 'react';
import { DashscopeImageService } from '@/services/DashscopeImageService';

type UseDashscopeImageState = {
  isLoading: boolean;
  error: string | null;
  result: DashscopeTaskQueryResponse['output'] | null;
  taskId: string | null;
};

type UseDashscopeImageReturn = {
  editImage: (request: DashscopeImageEditRequest) => Promise<void>;
  createTask: (request: DashscopeImageEditRequest) => Promise<string>;
  queryTask: (taskId: string) => Promise<DashscopeTaskQueryResponse>;
  reset: () => void;
} & UseDashscopeImageState;

export function useDashscopeImage(): UseDashscopeImageReturn {
  const [state, setState] = useState<UseDashscopeImageState>({
    isLoading: false,
    error: null,
    result: null,
    taskId: null,
  });

  const dashscopeService = new DashscopeImageService();

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      result: null,
      taskId: null,
    });
  }, []);

  const editImage = useCallback(async (request: DashscopeImageEditRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await dashscopeService.editImage(request);
      setState(prev => ({
        ...prev,
        isLoading: false,
        result,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '图像编辑失败',
      }));
    }
  }, []);

  const createTask = useCallback(async (request: DashscopeImageEditRequest): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await dashscopeService.createEditTask(request);
      const taskId = response.output.task_id;

      setState(prev => ({
        ...prev,
        taskId,
        error: null,
      }));

      return taskId;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '创建任务失败',
      }));
      throw error;
    }
  }, []);

  const queryTask = useCallback(async (taskId: string): Promise<DashscopeTaskQueryResponse> => {
    try {
      const response = await dashscopeService.queryTask(taskId);

      // 更新状态
      setState(prev => ({
        ...prev,
        isLoading: response.output.task_status === 'RUNNING',
        result: response.output.task_status === 'SUCCEEDED' ? response.output : prev.result,
        error: response.output.task_status === 'FAILED'
          ? (response.output.message || '任务执行失败')
          : null,
      }));

      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '查询任务失败',
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    editImage,
    createTask,
    queryTask,
    reset,
  };
}

// 轮询hooks - 用于实时监控任务状态
export function useDashscopeImagePolling(taskId: string | null, interval = 3000) {
  const [isPolling, setIsPolling] = useState(false);
  const { queryTask, ...state } = useDashscopeImage();

  const startPolling = useCallback(() => {
    if (!taskId || isPolling) {
      return;
    }

    setIsPolling(true);

    const poll = async () => {
      try {
        const response = await queryTask(taskId);

        // 如果任务完成或失败，停止轮询
        if (response.output.task_status === 'SUCCEEDED' || response.output.task_status === 'FAILED') {
          setIsPolling(false);
          return;
        }

        // 继续轮询
        if (isPolling) {
          setTimeout(poll, interval);
        }
      // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (error) {
        setIsPolling(false);
      }
    };

    poll();
  }, [taskId, isPolling, queryTask, interval]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return {
    ...state,
    isPolling,
    startPolling,
    stopPolling,
  };
}
