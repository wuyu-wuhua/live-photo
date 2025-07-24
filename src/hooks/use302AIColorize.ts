import { useCallback, useState } from 'react';

type ColorizeRequest = {
  image: File;
};

type ColorizeResponse = {
  success: boolean;
  data: {
    task_id: string;
    external_task_id: string;
    result_image_url: string;
    credit_cost: number;
    processing_time_ms: number;
  };
  message: string;
};

type Use302AIColorizeState = {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  taskId: string | null;
  creditCost: number;
  processingTime: number;
};

type Use302AIColorizeReturn = {
  colorizeImage: (request: ColorizeRequest) => Promise<string | null>; // 返回 task_id
  reset: () => void;
} & Use302AIColorizeState;

export function use302AIColorize(): Use302AIColorizeReturn {
  const [state, setState] = useState<Use302AIColorizeState>({
    isLoading: false,
    error: null,
    result: null,
    taskId: null,
    creditCost: 0,
    processingTime: 0,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      result: null,
      taskId: null,
      creditCost: 0,
      processingTime: 0,
    });
  }, []);

  const colorizeImage = useCallback(async (request: ColorizeRequest): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('image', request.image);

      const response = await fetch('/api/302ai/colorize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || '上色失败');
      }

      const result = await response.json() as ColorizeResponse;

      if (result.success) {
        console.log('302.AI上色成功:', result.data);
        setState(prev => ({
          ...prev,
          isLoading: false,
          result: result.data.result_image_url,
          taskId: result.data.task_id,
          creditCost: result.data.credit_cost,
          processingTime: result.data.processing_time_ms,
          error: null,
        }));
        return result.data.task_id; // 返回 task_id
      } else {
        throw new Error(result.message || '上色失败');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '黑白照片上色失败',
      }));
      return null; // 返回 null 表示失败
    }
  }, []);

  return {
    ...state,
    colorizeImage,
    reset,
  };
}
