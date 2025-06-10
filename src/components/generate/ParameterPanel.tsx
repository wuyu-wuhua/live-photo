'use client';

import type { FormUploadFile } from '@/components/upload/picture-card-form';
import type { DashscopeImageEditFunction, DashscopeImageEditRequest } from '@/types/dashscope';
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Select,
  SelectItem,
  Slider,
  Switch,
  Textarea,
} from '@heroui/react';
import {
  Brush,
  Building,
  Camera,
  Cherry,
  Edit3,
  Eraser,
  Expand,
  Eye,
  Film,
  Flower2,
  Heart,
  Leaf,
  PaintBucket,
  Palette,
  PenTool,
  Rainbow,
  Settings,
  Snowflake,
  Sparkles,
  Sunrise,
  Wand2,
  Zap,
} from 'lucide-react';
import { PictureCardForm } from '@/components/upload/picture-card-form';
import { Label } from '../ui/label';

const FUNCTION_OPTIONS: { value: DashscopeImageEditFunction; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  {
    value: 'colorization',
    label: '图像上色',
    icon: <Palette className="w-5 h-5" />,
    description: '为黑白图像添加自然色彩',
    color: 'text-pink-500',
  },
  {
    value: 'control_cartoon_feature',
    label: '卡通形象垫图',
    icon: <Eye className="w-5 h-5" />,
    description: '生成卡通风格图像',
    color: 'text-purple-500',
  },
  {
    value: 'description_edit',
    label: '指令编辑',
    icon: <Edit3 className="w-5 h-5" />,
    description: '根据文字描述编辑图像',
    color: 'text-blue-500',
  },
  {
    value: 'description_edit_with_mask',
    label: '局部重绘',
    icon: <PaintBucket className="w-5 h-5" />,
    description: '指定区域重新绘制',
    color: 'text-orange-500',
  },
  {
    value: 'doodle',
    label: '线稿生图',
    icon: <PenTool className="w-5 h-5" />,
    description: '将线稿转换为完整图像',
    color: 'text-green-500',
  },
  {
    value: 'expand',
    label: '扩图',
    icon: <Expand className="w-5 h-5" />,
    description: '扩展图像边界',
    color: 'text-indigo-500',
  },
  {
    value: 'remove_watermark',
    label: '去文字水印',
    icon: <Eraser className="w-5 h-5" />,
    description: '移除图像中的文字水印',
    color: 'text-red-500',
  },
  {
    value: 'stylization_all',
    label: '全局风格化',
    icon: <Sparkles className="w-5 h-5" />,
    description: '改变整体图像风格',
    color: 'text-yellow-500',
  },
  {
    value: 'stylization_local',
    label: '局部风格化',
    icon: <Brush className="w-5 h-5" />,
    description: '局部区域风格转换',
    color: 'text-teal-500',
  },
  {
    value: 'super_resolution',
    label: '图像超分',
    icon: <Zap className="w-5 h-5" />,
    description: '提升图像分辨率和清晰度',
    color: 'text-cyan-500',
  },
];

// 图像上色预设滤镜
const COLORIZATION_PRESETS = [
  {
    value: '',
    label: '自定义',
    icon: <Settings className="w-5 h-5" />,
    description: '手动输入提示词',
    color: 'text-gray-500',
  },
  {
    value: '自然真实的色彩，保持原有的光影效果',
    label: '自然色彩',
    icon: <Leaf className="w-5 h-5" />,
    description: '真实自然的色彩还原',
    color: 'text-green-500',
  },
  {
    value: '温暖的色调，增强黄色和橙色，营造温馨氛围',
    label: '温暖色调',
    icon: <Sunrise className="w-5 h-5" />,
    description: '温馨舒适的暖色调',
    color: 'text-orange-500',
  },
  {
    value: '冷色调为主，增强蓝色和青色，营造清冷氛围',
    label: '冷色调',
    icon: <Snowflake className="w-5 h-5" />,
    description: '清冷优雅的冷色调',
    color: 'text-blue-500',
  },
  {
    value: '复古怀旧的色彩风格，略微泛黄的色调',
    label: '复古怀旧',
    icon: <Camera className="w-5 h-5" />,
    description: '怀旧复古的色彩风格',
    color: 'text-amber-600',
  },
  {
    value: '鲜艳饱和的色彩，高对比度，充满活力',
    label: '鲜艳活力',
    icon: <Rainbow className="w-5 h-5" />,
    description: '充满活力的鲜艳色彩',
    color: 'text-rainbow bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent',
  },
  {
    value: '柔和淡雅的色彩，低饱和度，文艺清新',
    label: '柔和淡雅',
    icon: <Flower2 className="w-5 h-5" />,
    description: '文艺清新的淡雅色调',
    color: 'text-pink-400',
  },
  {
    value: '电影级调色，专业的色彩分级效果',
    label: '电影级调色',
    icon: <Film className="w-5 h-5" />,
    description: '专业电影级色彩效果',
    color: 'text-purple-600',
  },
  {
    value: '日系小清新色彩，明亮通透，略微过曝的效果',
    label: '日系清新',
    icon: <Cherry className="w-5 h-5" />,
    description: '明亮通透的日系风格',
    color: 'text-rose-400',
  },
  {
    value: '韩系色彩风格，偏粉色调，柔美浪漫',
    label: '韩系浪漫',
    icon: <Heart className="w-5 h-5" />,
    description: '柔美浪漫的韩系色调',
    color: 'text-pink-500',
  },
  {
    value: '黑白照片上色，还原历史照片的真实色彩',
    label: '历史还原',
    icon: <Building className="w-5 h-5" />,
    description: '还原历史照片真实色彩',
    color: 'text-stone-600',
  },
];

type ParameterPanelProps = {
  formData: DashscopeImageEditRequest;
  baseImageFiles: FormUploadFile[];
  isGenerating: boolean;
  onFormDataChange: (data: DashscopeImageEditRequest) => void;
  onBaseImageChange: (files: FormUploadFile[]) => void;
  onGenerate: () => void;
};

export function ParameterPanel({
  formData,
  baseImageFiles,
  isGenerating,
  onFormDataChange,
  onBaseImageChange,
  onGenerate,
}: ParameterPanelProps) {
  const handleInputChange = (field: keyof DashscopeImageEditRequest, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleParameterChange = (field: string, value: any) => {
    onFormDataChange({
      ...formData,
      parameters: {
        ...formData.parameters,
        [field]: value,
      },
    });
  };
  const needsMask = formData.function === 'description_edit_with_mask';
  const isExpand = formData.function === 'expand';
  const isSuperResolution = formData.function === 'super_resolution';
  const isDoodle = formData.function === 'doodle';
  const isStylization = formData.function === 'stylization_all' || formData.function === 'description_edit';
  const isColorization = formData.function === 'colorization';

  return (
    <div className="h-fit">
      {/* 基础图像上传 */}
      <div className="space-y-2">
        <Label htmlFor="preset-filter" className="text-sm font-medium text-foreground">
          参考图片
          <span className="text-danger ml-1">*</span>
        </Label>
        <PictureCardForm
          value={baseImageFiles}
          onChange={onBaseImageChange}
          maxCount={1}
          className="w-full"
          onUploadComplete={(result) => {
            if (result.success) {
              formData.base_image_url = result.file?.url!;
            }
          }}
          onUploadError={(error, file) => {
            console.error('上传失败:', error, file);
          }}
        />
        <p className="text-xs text-default-500">
          支持JPG、PNG、WEBP等格式，大小不超过10MB
        </p>
      </div>

      {/* 功能选择 */}
      <Select
        label="编辑功能"
        labelPlacement="outside"
        placeholder="选择图像编辑功能"
        selectedKeys={[formData.function]}
        onSelectionChange={(keys) => {
          const selectedFunction = Array.from(keys)[0] as DashscopeImageEditFunction;
          handleInputChange('function', selectedFunction);
        }}
        isRequired
        renderValue={(items) => {
          return items.map((item) => {
            const option = FUNCTION_OPTIONS.find(opt => opt.value === item.key);
            return (
              <div key={item.key} className="flex items-center gap-2">
                <span className={`text-lg ${option?.color}`}>{option?.icon}</span>
                <div className="flex flex-col">
                  <span>{option?.label}</span>
                  <span className="text-xs text-default-400">{option?.description}</span>
                </div>
              </div>
            );
          });
        }}
      >
        {FUNCTION_OPTIONS.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            startContent={<span className={`text-lg ${option.color}`}>{option.icon}</span>}
            description={option.description}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>

      {/* 蒙版图像URL - 仅局部重绘需要 */}
      {needsMask && (
        <Input
          label="蒙版图像URL"
          placeholder="请输入蒙版图像URL"
          value={formData.mask_image_url || ''}
          onChange={e => handleInputChange('mask_image_url', e.target.value)}
          isRequired
          description="白色区域表示需要编辑的部分，黑色区域表示保持不变"
        />
      )}

      {/* 图像上色预设滤镜 - 仅图像上色功能显示 */}
      {isColorization && (
        <div className="space-y-2">
          <Label htmlFor="preset-filter" className="text-sm font-medium text-foreground">
            预设滤镜
          </Label>
          <Select
            placeholder="选择预设滤镜或自定义"
            selectedKeys={COLORIZATION_PRESETS.find(preset => preset.value === formData.prompt)?.value ? [COLORIZATION_PRESETS.find(preset => preset.value === formData.prompt)!.value] : ['']}
            onSelectionChange={(keys) => {
              const selectedPreset = Array.from(keys)[0] as string;
              if (selectedPreset) {
                handleInputChange('prompt', selectedPreset);
              }
            }}
            renderValue={(items) => {
              return items.map((item) => {
                const preset = COLORIZATION_PRESETS.find(p => p.value === item.key);
                return (
                  <div key={item.key} className="flex items-center gap-2">
                    <span className={`text-lg ${preset?.color}`}>{preset?.icon}</span>
                    <div className="flex flex-col">
                      <span>{preset?.label}</span>
                      <span className="text-xs text-default-400">{preset?.description}</span>
                    </div>
                  </div>
                );
              });
            }}
          >
            {COLORIZATION_PRESETS.map(preset => (
              <SelectItem
                key={preset.value}
                value={preset.value}
                startContent={<span className={`text-lg ${preset.color}`}>{preset.icon}</span>}
                description={preset.description}
              >
                {preset.label}
              </SelectItem>
            ))}
          </Select>
          <p className="text-xs text-default-500">
            选择预设滤镜可快速应用常用的上色风格，也可以选择自定义后手动输入提示词
          </p>
        </div>
      )}

      {/* 提示词 */}
      <Textarea
        label="提示词"
        labelPlacement="outside"
        placeholder={isColorization ? '选择预设滤镜或描述您想要的上色风格...' : '描述您想要生成或编辑的内容...'}
        value={formData.prompt}
        onChange={e => handleInputChange('prompt', e.target.value)}
        isRequired
        maxRows={4}
        description={isColorization ? '描述您想要的上色风格和色彩效果，支持中英文，最多800个字符' : '支持中英文，最多800个字符'}
      />

      {/* 高级参数 */}
      <Accordion variant="splitted" selectionMode="multiple" defaultExpandedKeys={['advanced-params']}>
        <AccordionItem key="advanced-params" aria-label="高级参数" title="高级参数" className="px-0">
          <div className="space-y-4">
            {/* 生成数量 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                生成数量:
                {formData.parameters?.n}
              </label>
              <Slider
                size="sm"
                step={1}
                minValue={1}
                maxValue={4}
                value={formData.parameters?.n || 1}
                onChange={value => handleParameterChange('n', value)}
                className="max-w-md"
              />
            </div>

            {/* 修改强度 - 仅特定功能需要 */}
            {isStylization && (
              <div>
                <Label className="block text-sm font-medium mb-2">
                  修改强度:
                  {' '}
                  {formData.parameters?.strength?.toFixed(2)}
                </Label>
                <Slider
                  size="sm"
                  step={0.1}
                  minValue={0}
                  maxValue={1}
                  value={formData.parameters?.strength || 0.5}
                  onChange={value => handleParameterChange('strength', value)}
                  className="max-w-md"
                />
                <p className="text-xs text-default-500 mt-1">
                  值越接近0越接近原图，值越接近1修改幅度越大
                </p>
              </div>
            )}

            {/* 超分倍数 - 仅图像超分需要 */}
            {isSuperResolution && (
              <div>
                <Label className="block text-sm font-medium mb-2">
                  超分倍数:
                  {' '}
                  {formData.parameters?.upscale_factor}
                  x
                </Label>
                <Slider
                  size="sm"
                  step={1}
                  minValue={1}
                  maxValue={4}
                  value={formData.parameters?.upscale_factor || 1}
                  onChange={value => handleParameterChange('upscale_factor', value)}
                  className="max-w-md"
                />
                <p className="text-xs text-default-500 mt-1">
                  选择图像放大的倍数，倍数越高图像越清晰但处理时间越长
                </p>
              </div>
            )}

            {/* 扩图参数 - 仅扩图功能需要 */}
            {isExpand && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">扩图方向设置</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      向上扩展:
                      {' '}
                      {formData.parameters?.top_scale?.toFixed(1)}
                    </Label>
                    <Slider
                      size="sm"
                      step={0.1}
                      minValue={1.0}
                      maxValue={2.0}
                      value={formData.parameters?.top_scale || 1.0}
                      onChange={value => handleParameterChange('top_scale', value)}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      向下扩展:
                      {' '}
                      {formData.parameters?.bottom_scale?.toFixed(1)}
                    </Label>
                    <Slider
                      size="sm"
                      step={0.1}
                      minValue={1.0}
                      maxValue={2.0}
                      value={formData.parameters?.bottom_scale || 1.0}
                      onChange={value => handleParameterChange('bottom_scale', value)}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      向左扩展:
                      {' '}
                      {formData.parameters?.left_scale?.toFixed(1)}
                    </Label>
                    <Slider
                      size="sm"
                      step={0.1}
                      minValue={1.0}
                      maxValue={2.0}
                      value={formData.parameters?.left_scale || 1.0}
                      onChange={value => handleParameterChange('left_scale', value)}
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-2">
                      向右扩展:
                      {' '}
                      {formData.parameters?.right_scale?.toFixed(1)}
                    </Label>
                    <Slider
                      size="sm"
                      step={0.1}
                      minValue={1.0}
                      maxValue={2.0}
                      value={formData.parameters?.right_scale || 1.0}
                      onChange={value => handleParameterChange('right_scale', value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 线稿选项 - 仅线稿生图需要 */}
            {isDoodle && (
              <Switch
                isSelected={formData.parameters?.is_sketch || false}
                onValueChange={value => handleParameterChange('is_sketch', value)}
              >
                输入图像为线稿图像
              </Switch>
            )}
          </div>
        </AccordionItem>
      </Accordion>

      <Button
        color="primary"
        size="lg"
        startContent={<Wand2 className="w-4 h-4" />}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        onPress={onGenerate}
        isLoading={isGenerating}
        isDisabled={baseImageFiles.length === 0 || !formData.prompt}
      >
        {isGenerating ? '生成中...' : '开始生成'}
      </Button>
    </div>
  );
}
