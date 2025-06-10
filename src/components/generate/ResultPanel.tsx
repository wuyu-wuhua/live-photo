'use client';

import { Button, Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { Download, ImageIcon, Sparkles, Wand2 } from 'lucide-react';

type ResultPanelProps = {
  isGenerating: boolean;
  generatedImages: string[];
  onGenerate: () => void;
};

export function ResultPanel({ isGenerating, generatedImages, onGenerate }: ResultPanelProps) {
  return (
    <div className="h-fit">
      <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-0 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  生成结果
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI 图像生成结果展示
                </p>
              </div>
            </div>
            <Button
              color="secondary"
              variant="shadow"
              size="sm"
              startContent={<Wand2 className="w-4 h-4" />}
              onPause={onGenerate}
              isLoading={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {isGenerating
            ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-6 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20">
                      <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      AI 正在创作中...
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                      请稍候，我们正在为您生成精美的图像
                    </p>
                  </div>
                  <div className="mt-4">
                    <Spinner size="sm" color="secondary" />
                  </div>
                </div>
              )
            : generatedImages.length > 0
              ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedImages.map((imageUrl, index) => (
                      <div key={index} className="group relative">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                          <img
                            src={imageUrl}
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <button className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg">
                            <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              : (
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl" />
                      <div className="relative p-6 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm border border-blue-500/10">
                        <ImageIcon className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        等待生成
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                        配置参数后点击右上角的生成按钮开始创作
                      </p>
                    </div>
                  </div>
                )}
        </CardBody>
      </Card>
    </div>
  );
}
