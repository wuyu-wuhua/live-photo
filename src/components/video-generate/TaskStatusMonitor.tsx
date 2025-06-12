'use client';

import type { ImageEditResult, TaskStatus } from '@/types/database';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useImageEditStatusSubscription } from '@/hooks/useSupabaseSubscription';
import { ImageEditService } from '@/services/databaseService';

type TaskStatusMonitorProps = {
  taskId: string;
  onStatusChange?: (status: TaskStatus, result?: ImageEditResult) => void;
};

export function TaskStatusMonitor({ taskId, onStatusChange }: TaskStatusMonitorProps) {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [taskData, setTaskData] = useState<ImageEditResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 使用Supabase实时订阅监听任务状态变更
  const { isSubscribed, error } = useImageEditStatusSubscription(
    taskId,
    (updatedTask) => {
      if (!updatedTask) {
        return;
      }

      setTaskStatus(updatedTask.status);
      setTaskData(updatedTask);

      // 调用外部状态变更回调
      if (onStatusChange) {
        onStatusChange(updatedTask.status, updatedTask);
      }
    },
  );

  // 初始加载任务数据
  useEffect(() => {
    async function fetchTaskData() {
      if (!taskId) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await ImageEditService.getById(taskId);
        if (response.success && response.data) {
          setTaskData(response.data);
          setTaskStatus(response.data.status);

          // 调用外部状态变更回调
          if (onStatusChange) {
            onStatusChange(response.data.status, response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTaskData();
  }, [taskId, onStatusChange]);

  // 根据任务状态显示不同的UI
  function renderStatusIndicator() {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading task status...</span>
        </div>
      );
    }

    if (!taskStatus) {
      return (
        <div className="text-slate-600">
          No status information available
        </div>
      );
    }

    switch (taskStatus) {
      case 'PENDING':
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Pending</span>
          </div>
        );
      case 'RUNNING':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing</span>
          </div>
        );
      case 'SUCCEEDED':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Completed</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Failed</span>
            {taskData?.emoji_message && (
              <span className="text-xs ml-2 text-red-500">{taskData.emoji_message}</span>
            )}
            {taskData?.liveportrait_message && (
              <span className="text-xs ml-2 text-red-500">{taskData.liveportrait_message}</span>
            )}
          </div>
        );
      default:
        return (
          <div className="text-slate-600">
            Unknown status:
            {' '}
            {taskStatus}
          </div>
        );
    }
  }

  return (
    <div className="p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Task Status</h3>
          <div className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {isSubscribed ? 'Live Updates' : 'Connecting...'}
          </div>
        </div>

        <div className="mt-1">
          {renderStatusIndicator()}
        </div>

        {error && (
          <div className="mt-2 text-xs text-red-500">
            Subscription error:
            {' '}
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
