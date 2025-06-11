'use client';

import type { ImageEditResult } from '@/types/database';
import { VideoIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { VideoParameterPanel } from '@/components/video-generate/VideoParameterPanel';
import { VideoResultPanel } from '@/components/video-generate/VideoResultPanel';
import { ImageEditService } from '@/services/databaseService';

export default function VideoGeneratePage() {
  const searchParams = useSearchParams();
  const imageId = searchParams.get('imageId');

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageEditResult | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>('');
  const [videoType, setVideoType] = useState<'emoji' | 'liveportrait'>('emoji');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [drivenId, setDrivenId] = useState<string>('mengwa_kaixin');

  // 获取图像数据
  useEffect(() => {
    async function fetchImageData() {
      if (!imageId) {
        setError('缺少图像ID参数');
        toast.error('缺少图像ID参数');
        setIsLoading(false);
        return;
      }

      try {
        const response = await ImageEditService.getById(imageId);
        if (response.success && response.data) {
          setImageData(response.data);
        } else {
          setError('获取图像数据失败');
          toast.error('获取图像数据失败');
        }
      } catch (err) {
        setError('获取图像数据时出错');
        toast.error('获取图像数据时出错');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImageData();
  }, [imageId]);

  // 处理视频类型变更
  const handleVideoTypeChange = (type: 'emoji' | 'liveportrait') => {
    setVideoType(type);
  };

  // 处理音频URL变更
  const handleAudioUrlChange = (url: string) => {
    setAudioUrl(url);
  };

  // 处理表情模板ID变更
  const handleDrivenIdChange = (id: string) => {
    setDrivenId(id);
  };

  // 生成视频
  const handleGenerate = async () => {
    if (!imageData) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let response;

      if (videoType === 'emoji') {
        // 生成表情视频
        response = await fetch('/api/dashscope/emoji-video-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageId: imageData.id,
            drivenId,
          }),
        });
      } else {
        // 生成对口型视频
        if (!audioUrl) {
          throw new Error('请先上传音频文件');
        }

        response = await fetch('/api/dashscope/liveportrait-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageId: imageData.id,
            audioUrl,
          }),
        });
      }

      const { success, data, error } = (await response.json()) as { success: boolean; data: { videoUrl: string }; error: any };

      if (success && data?.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
        toast.success('视频生成成功');
      } else {
        throw new Error(error || '生成失败');
      }
    } catch (err) {
      console.error('生成视频时出错:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      toast.error(err instanceof Error ? err.message : '生成视频时出错');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* 标题区域 */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm">
              <VideoIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI 视频生成
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                智能视频处理与生成平台
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto p-4">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-[calc(100vh-120px)] rounded-lg border"
        >
          {/* 左侧参数面板 */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="h-full overflow-y-auto p-4">
              <VideoParameterPanel
                imageData={imageData}
                isLoading={isLoading}
                isGenerating={isGenerating}
                error={error}
                videoType={videoType}
                audioUrl={audioUrl}
                drivenId={drivenId}
                onVideoTypeChange={handleVideoTypeChange}
                onAudioUrlChange={handleAudioUrlChange}
                onDrivenIdChange={handleDrivenIdChange}
                onGenerate={handleGenerate}
              />
            </div>
          </ResizablePanel>

          {/* 拖拽分割线 */}
          <ResizableHandle withHandle />

          {/* 右侧结果展示区域 */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full overflow-y-auto p-4">
              <VideoResultPanel
                isGenerating={isGenerating}
                videoUrl={generatedVideoUrl}
                imageUrl={imageData?.source_image_url || ''}
                videoType={videoType}
                onGenerate={handleGenerate}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
