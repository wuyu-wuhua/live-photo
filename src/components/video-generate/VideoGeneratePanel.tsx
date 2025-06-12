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

  // Simulate progress growth when generation starts
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isGenerating && taskStatus !== 'FAILED' && taskStatus !== 'SUCCEEDED') {
      // Initial progress
      setProgressValue(progress || 0);

      // Simulate progress growth
      interval = setInterval(() => {
        setProgressValue((prev) => {
          // Adjust progress limit based on task status
          const maxProgress = taskStatus === 'RUNNING' ? 90 : 60;

          // Ensure progress doesn't exceed the limit
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

  // Get icon and color corresponding to task status
  const getStatusInfo = () => {
    switch (taskStatus) {
      case 'PENDING':
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          label: 'Waiting',
        };
      case 'RUNNING':
        return {
          icon: <Spinner size="sm" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'Generating',
        };
      case 'SUCCEEDED':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Generation Successful',
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-5 h-5" />,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Generation Failed',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Unknown Status',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0">
        <h3 className="text-lg font-semibold">Video Generation Status</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Status indicator */}
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
                {taskStatus === 'RUNNING' && 'Video is being generated, please wait patiently...'}
                {taskStatus === 'PENDING' && 'Task is in queue...'}
                {taskStatus === 'SUCCEEDED' && 'Video has been successfully generated'}
                {taskStatus === 'FAILED' && (errorMessage || 'An error occurred during generation')}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {(isGenerating || taskStatus === 'RUNNING' || taskStatus === 'PENDING') && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Generation Progress</span>
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

          {/* Error message */}
          {taskStatus === 'FAILED' && errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Generation Failed</p>
                <p className="text-xs mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Retry button */}
          {taskStatus === 'FAILED' && (
            <Button
              variant="flat"
              color="primary"
              startContent={<RefreshCw className="w-4 h-4" />}
              onClick={onRetry}
              className="w-full"
            >
              Retry
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
