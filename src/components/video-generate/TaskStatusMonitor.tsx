'use client';

import { Button, Card, CardBody, CardHeader, Progress, Spinner } from '@heroui/react';
import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type TaskStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

type TaskStatusMonitorProps = {
  taskId: string;
  onSuccess: (videoUrl: string) => void;
  onError: (error: string) => void;
};

export function TaskStatusMonitor({ taskId, onSuccess, onError }: TaskStatusMonitorProps) {
  const [status, setStatus] = useState<TaskStatus>('PENDING');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // 轮询任务状态
  useEffect(() => {
    if (!taskId) {
      return;
    }

    const pollTaskStatus = async () => {
      try {
        const response = await fetch(`/api/dashscope/video-synthesis/status?taskId=${taskId}`);
        const result = await response.json() as any;

        if (!response.ok) {
          throw new Error(result.error || '查询任务状态失败');
        }

        const taskStatus = result.data?.task_status;
        setStatus(taskStatus);

        if (taskStatus === 'SUCCEEDED') {
          const videoUrl = result.data?.video_url;
          console.log('TaskStatusMonitor - 任务成功，videoUrl:', videoUrl);
          if (videoUrl) {
            setVideoUrl(videoUrl);
            setProgress(100);
            console.log('TaskStatusMonitor - 调用 onSuccess 回调');
            onSuccess(videoUrl);
            toast.success('视频生成完成！');
          } else {
            console.error('TaskStatusMonitor - 任务成功但没有视频URL');
          }
        } else if (taskStatus === 'FAILED') {
          const errorMsg = result.data?.error || '视频生成失败';
          setError(errorMsg);
          onError(errorMsg);
          toast.error(errorMsg);
        } else if (taskStatus === 'RUNNING') {
          // 模拟进度增长
          setProgress(prev => Math.min(prev + Math.random() * 10, 90));
        } else if (taskStatus === 'PENDING') {
          setProgress(prev => Math.min(prev + Math.random() * 5, 30));
        }
      } catch (err: any) {
        const errorMsg = err.message || '查询任务状态失败';
        setError(errorMsg);
        onError(errorMsg);
        toast.error(errorMsg);
      }
    };

    // 立即执行一次
    pollTaskStatus();

    // 设置轮询间隔
    const interval = setInterval(pollTaskStatus, 5000);

    return () => clearInterval(interval);
  }, [taskId, onSuccess, onError]);

  const getStatusIcon = () => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'RUNNING':
        return <Spinner size="sm" color="primary" />;
      case 'SUCCEEDED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'PENDING':
        return '任务已创建，等待处理...';
      case 'RUNNING':
        return '正在生成视频...';
      case 'SUCCEEDED':
        return '视频生成完成！';
      case 'FAILED':
        return '视频生成失败';
      default:
        return '未知状态';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'RUNNING':
        return 'primary';
      case 'SUCCEEDED':
        return 'success';
      case 'FAILED':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        {getStatusIcon()}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium">视频生成状态</h4>
          <p className="text-xs text-gray-500">
            任务ID:
            {taskId}
          </p>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{getStatusText()}</span>
            <span className="text-gray-500">
              {Math.round(progress)}
              %
            </span>
          </div>
          <Progress
            value={progress}
            color={getStatusColor()}
            className="w-full"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}

        {videoUrl && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">视频生成成功！</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={() => window.location.reload()}
          >
            刷新状态
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
