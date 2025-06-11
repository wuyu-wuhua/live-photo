'use client';

import type { TaskStatus } from '@/types/database';
import { Button, Card, CardBody, CardHeader, Progress, Spinner } from '@heroui/react';
import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type VideoGeneratePanelProps = {
  isGenerating: boolean;
  videoUrl: string | null;
  onRetry: () => void;
  taskStatus?: TaskStatus;
  progress?: number;
  errorMessage?: string | null;
};

export function VideoGeneratePanel({
  isGenerating,
  videoUrl,
  onRetry,
  taskStatus = 'PENDING',
  progress = 0,
  errorMessage = null,
}: VideoGeneratePanelProps) {
  const [progressValue, setProgressValue] = useState(progress);

  // 当生成开始时，模拟进度增长
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isGenerating && taskStatus !== 'FAILED' && taskStatus !== 'SUCCEEDED') {
      // 初始进度
      setProgressValue(progress || 0);

      // 模拟进度增长
      interval = setInterval(() => {
        setProgressValue((prev) => {
          // 根据任务状态调整进度上限
          const maxProgress = taskStatus === 'RUNNING' ? 90 : 60;

          // 确保进度不会超过上限
          if (prev < maxProgress) {
            return prev + Math.random() * 2;
          }
          return prev;
        });
      }, 1000);
    } else if (taskStatus === 'SUCCEEDED' && videoUrl) {
      setProgressValue(100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGenerating, taskStatus, progress, videoUrl]);

  // 获取任务状态对应的图标和颜色
  const getStatusInfo = () => {
    switch (taskStatus) {
      case 'PENDING':
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          label: '等待处理',
        };
      case 'RUNNING':
        return {
          icon: <Spinner size="sm" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: '正在生成',
        };
      case 'SUCCEEDED':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: '生成成功',
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: '生成失败',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: '未知状态',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0">
        <h3 className="text-lg font-semibold">视频生成状态</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* 状态指示器 */}
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-full',
              statusInfo.bgColor,
            )}
            >
              {statusInfo.icon}
            </div>
            <div>
              <p className={cn(
                'font-medium',
                statusInfo.color,
              )}
              >
                {statusInfo.label}
              </p>
              <p className="text-xs text-gray-500">
                {taskStatus === 'RUNNING' && '视频生成中，请耐心等待...'}
                {taskStatus === 'PENDING' && '任务正在排队中...'}
                {taskStatus === 'SUCCEEDED' && '视频已成功生成'}
                {taskStatus === 'FAILED' && (errorMessage || '生成过程中出现错误')}
              </p>
            </div>
          </div>

          {/* 进度条 */}
          {(isGenerating || taskStatus === 'RUNNING' || taskStatus === 'PENDING') && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>生成进度</span>
                <span>
                  {Math.min(Math.round(progressValue), 100)}
                  %
                </span>
              </div>
              <Progress
                value={progressValue}
                color={taskStatus === 'FAILED' ? 'danger' : 'primary'}
                size="sm"
                isIndeterminate={taskStatus === 'PENDING'}
              />
            </div>
          )}

          {/* 错误信息 */}
          {taskStatus === 'FAILED' && errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">生成失败</p>
                <p className="text-xs mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* 重试按钮 */}
          {taskStatus === 'FAILED' && (
            <Button
              variant="flat"
              color="primary"
              startContent={<RefreshCw className="w-4 h-4" />}
              onClick={onRetry}
              className="w-full"
            >
              重新尝试
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
