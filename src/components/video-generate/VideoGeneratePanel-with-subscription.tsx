'use client';

import type { TaskStatus } from '@/types/database';
import { Button } from '@heroui/react';
import { Loader2, RefreshCw } from 'lucide-react';
import { TaskStatusMonitor } from './TaskStatusMonitor';

type VideoGeneratePanelProps = {
  isGenerating: boolean;
  videoUrl: string;
  onRetry: () => void;
  taskStatus: TaskStatus;
  errorMessage: string | null;
  taskId?: string;
};

export function VideoGeneratePanel({
  isGenerating,
  videoUrl,
  onRetry,
  taskStatus,
  errorMessage,
  taskId,
}: VideoGeneratePanelProps) {
  // 根据任务状态显示不同的UI
  function renderStatusContent() {
    // 如果有taskId，使用TaskStatusMonitor组件
    if (taskId) {
      return (
        <TaskStatusMonitor
          taskId={taskId}
          onSuccess={(videoUrl) => {
            // 处理成功回调
            console.log('Video generation success:', videoUrl);
          }}
          onError={(error) => {
            // 处理错误回调
            console.error('Video generation error:', error);
          }}
        />
      );
    }

    // 否则使用传统的状态显示
    switch (taskStatus) {
      case 'PENDING':
        return (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Preparing to generate video...
            </p>
          </div>
        );
      case 'RUNNING':
        return (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generating video, please wait...
            </p>
          </div>
        );
      case 'SUCCEEDED':
        if (videoUrl) {
          return (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Video generated successfully!
              </p>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Video processing completed, but no URL available.
            </p>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage || 'Video generation failed'}
            </p>
            <Button
              color="danger"
              variant="light"
              startContent={<RefreshCw className="w-4 h-4" />}
              onPress={onRetry}
              isDisabled={isGenerating}
            >
              Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Generation Status</h3>
      </div>
      <div className="p-4">
        {renderStatusContent()}
      </div>
    </div>
  );
}
