'use client';

import type { FormUploadFile } from '@/components/upload/picture-card-form';
import type { DashscopeImageEditRequest } from '@/types/dashscope';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';
import { ParameterPanel } from '@/components/generate/ParameterPanel';
import { ResultPanel } from '@/components/generate/ResultPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [baseImageFiles, setBaseImageFiles] = useState<FormUploadFile[]>([]);

  const [formData, setFormData] = useState<DashscopeImageEditRequest>({
    function: 'colorization',
    base_image_url: '',
    prompt: '',
    parameters: {
      n: 1,
      strength: 0.5,
      upscale_factor: 1,
      top_scale: 1.0,
      bottom_scale: 1.0,
      left_scale: 1.0,
      right_scale: 1.0,
      is_sketch: false,
    },
  });

  const handleFormDataChange = (data: DashscopeImageEditRequest) => {
    setFormData(data);
  };

  const handleBaseImageChange = (files: FormUploadFile[]) => {
    setBaseImageFiles(files);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      // 构建JSON请求体
      const requestBody: DashscopeImageEditRequest = {
        ...formData,
      };

      const response = await fetch('/api/dashscope/image-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data?.output?.results) {
        const imageUrls = result.data.output.results.map((item: any) => item.url);
        setGeneratedImages(imageUrls);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('生成图像时出错:', error);
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
              <Wand2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI 图像编辑
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                智能图像处理与生成平台
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
              <ParameterPanel
                formData={formData}
                baseImageFiles={baseImageFiles}
                isGenerating={isGenerating}
                onFormDataChange={handleFormDataChange}
                onBaseImageChange={handleBaseImageChange}
                onGenerate={handleGenerate}
              />
            </div>
          </ResizablePanel>

          {/* 拖拽分割线 */}
          <ResizableHandle withHandle />

          {/* 右侧结果展示区域 */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full overflow-y-auto p-4">
              <ResultPanel
                isGenerating={isGenerating}
                generatedImages={generatedImages}
                onGenerate={handleGenerate}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
