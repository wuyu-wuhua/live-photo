'use client';

import type { FormUploadFile } from '@/components/upload/picture-card-form';
import type { ImageEditResult } from '@/types/database';
import { Card, CardBody, CardHeader, Select, SelectItem, Spinner, Tab, Tabs } from '@heroui/react';
import { Mic, Smile } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { PictureCardForm } from '@/components/upload/picture-card-form';

// 表情包模板选项
const EMOJI_TEMPLATE_OPTIONS = [
  { value: 'mengwa_kaixin', label: '萌娃开心', description: '萌娃开心表情' },
  { value: 'dagong_kaixin', label: '开心', description: '开心表情' },
  { value: 'dagong_yangwang', label: '不错', description: '不错表情' },
  { value: 'jingdian_tiaopi', label: '调皮', description: '调皮表情' },
  { value: 'jingdian_deyi_1', label: '得意', description: '得意表情' },
  { value: 'jingdian_qidai', label: '期待', description: '期待表情' },
  { value: 'mengwa_dengyan', label: '瞪眼', description: '瞪眼表情' },
  { value: 'mengwa_jidong', label: '激动', description: '激动表情' },
  { value: 'dagong_kunhuo', label: '困惑', description: '困惑表情' },
  { value: 'dagong_zhuakuang', label: '抓狂', description: '抓狂表情' },
  { value: 'mengwa_kun_1', label: '困', description: '困表情' },
  { value: 'jingdian_landuo_1', label: '懒惰', description: '懒惰表情' },
  { value: 'jingdian_xianqi', label: '嫌弃', description: '嫌弃表情' },
  { value: 'jingdian_lei', label: '累', description: '累表情' },
  { value: 'mengwan_gandong', label: '感动', description: '感动表情' },
  { value: 'dagong_weixiao', label: '微笑', description: '微笑表情' },
  { value: 'dagong_ganji', label: '感激', description: '感激表情' },
];

type VideoParameterPanelProps = {
  imageData: ImageEditResult | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  videoType: 'emoji' | 'liveportrait';
  audioUrl: string;
  drivenId: string;
  onVideoTypeChange: (type: 'emoji' | 'liveportrait') => void;
  onAudioUrlChange: (url: string) => void;
  onDrivenIdChange: (id: string) => void;
  onGenerate?: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
};

export function VideoParameterPanel({
  imageData,
  isLoading,
  error,
  videoType,
  drivenId,
  onVideoTypeChange,
  onAudioUrlChange,
  onDrivenIdChange,
}: VideoParameterPanelProps) {
  const [audioFiles, setAudioFiles] = useState<FormUploadFile[]>([]);

  // 处理音频文件上传
  const handleAudioChange = (files: FormUploadFile[]) => {
    setAudioFiles(files);
  };

  return (
    <div className="h-fit space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 图像信息 */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">参考图片</h3>
        </CardHeader>
        <CardBody>
          {isLoading
            ? (
                <div className="flex items-center justify-center p-6">
                  <Spinner size="sm" />
                </div>
              )
            : imageData
              ? (
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      <img
                        src={imageData.source_image_url || ''}
                        alt="参考图片"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <span className="block text-gray-500 dark:text-gray-400">表情视频兼容</span>
                        <span className={`font-medium ${imageData.emoji_compatible ? 'text-green-600' : 'text-red-600'}`}>
                          {imageData.emoji_compatible ? '支持' : '不支持'}
                        </span>
                      </div>
                      <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <span className="block text-gray-500 dark:text-gray-400">对口型视频兼容</span>
                        <span className={`font-medium ${imageData.liveportrait_compatible ? 'text-green-600' : 'text-red-600'}`}>
                          {imageData.liveportrait_compatible ? '支持' : '不支持'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              : (
                  <div className="text-center p-6 text-gray-500">
                    未找到图像数据
                  </div>
                )}
        </CardBody>
      </Card>

      {/* 视频类型选择 */}
      <div className="space-y-2">
        <Label htmlFor="video-type" className="text-sm font-medium">
          视频类型
        </Label>
        <Tabs
          selectedKey={videoType}
          onSelectionChange={key => onVideoTypeChange(key as 'emoji' | 'liveportrait')}
          fullWidth
          size="lg"
          color="primary"
        >
          <Tab
            key="emoji"
            title={(
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4" />
                <span>表情视频</span>
              </div>
            )}
            isDisabled={!imageData?.emoji_compatible}
          >
            <div className="p-3 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                根据选择的表情模板，为图像生成对应的表情动画视频。
              </p>

              {/* 表情模板选择 */}
              <div className="space-y-2">
                <Label htmlFor="driven-id" className="text-sm font-medium">
                  表情模板
                </Label>
                <Select
                  label="选择表情模板"
                  placeholder="请选择表情模板"
                  selectedKeys={[drivenId]}
                  onSelectionChange={(keys) => {
                    const selectedId = Array.from(keys)[0] as string;
                    onDrivenIdChange(selectedId);
                  }}
                  isDisabled={!imageData?.emoji_compatible}
                >
                  {EMOJI_TEMPLATE_OPTIONS.map(option => (
                    <SelectItem key={option.value} description={option.description}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </Tab>
          <Tab
            key="liveportrait"
            title={(
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span>对口型视频</span>
              </div>
            )}
            isDisabled={!imageData?.liveportrait_compatible}
          >
            <div className="p-3 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                上传音频文件，生成与音频口型同步的人物视频。
              </p>

              {/* 音频上传 */}
              <div className="space-y-2">
                <Label htmlFor="audio-upload" className="text-sm font-medium">
                  音频文件
                  <span className="text-danger ml-1">*</span>
                </Label>
                <PictureCardForm
                  value={audioFiles}
                  onChange={handleAudioChange}
                  maxCount={1}
                  className="w-full"
                  onUploadComplete={(result) => {
                    if (result.success) {
                      if (result.file?.url) {
                        onAudioUrlChange(result.file.url);
                      }
                    }
                  }}
                  onUploadError={(error, file) => {
                    console.error('上传失败:', error, file);
                  }}
                />
                <p className="text-xs text-default-500">
                  支持MP3、WAV等格式，大小不超过10MB
                </p>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* 兼容性提示 */}
      {imageData && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {!imageData.emoji_compatible && !imageData.liveportrait_compatible && (
            <p className="text-red-500">
              当前图像不支持任何视频生成功能，请选择其他图像。
            </p>
          )}
          {videoType === 'emoji' && !imageData.emoji_compatible && (
            <p className="text-red-500">
              当前图像不支持表情视频生成，请切换到对口型视频或选择其他图像。
            </p>
          )}
          {videoType === 'liveportrait' && !imageData.liveportrait_compatible && (
            <p className="text-red-500">
              当前图像不支持对口型视频生成，请切换到表情视频或选择其他图像。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
