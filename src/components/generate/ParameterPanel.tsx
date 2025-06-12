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
  Tooltip,
} from '@heroui/react';
import {
  Building,
  Camera,
  Cherry,
  Coins,
  Eraser,
  Expand,
  Film,
  Flower2,
  Heart,
  Leaf,
  Palette,
  Rainbow,
  Settings,
  Snowflake,
  Sunrise,
  Wand2,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PictureCardForm } from '@/components/upload/picture-card-form';
import { useCredits } from '@/hooks/useCredits';
import { Label } from '../ui/label';

// 导入上传配置
const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpg', 'image/gif', 'image/png', 'image/jpeg', 'image/webp'],
  bucket: 'live-photos',
};

// 验证图片是否符合要求
const validateImage = (file: File, t: ReturnType<typeof useTranslations>): { valid: boolean; error?: string } => {
  // 检查文件大小
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: t('parameterPanel.errors.fileSizeExceeded', { size: (UPLOAD_CONFIG.maxFileSize / 1024 / 1024).toFixed(1) }),
    };
  }

  // 检查文件类型
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: t('parameterPanel.errors.unsupportedFileType', { type: file.type }),
    };
  }

  // 检查图片尺寸（可选，需要先加载图片）
  return { valid: true };
};

const getFunctionOptions = (t: ReturnType<typeof useTranslations>) => [{
  value: 'colorization' as DashscopeImageEditFunction,
  label: t('parameterPanel.functions.colorization.label'),
  icon: <Palette className="w-5 h-5" />,
  description: t('parameterPanel.functions.colorization.description'),
  color: 'text-pink-500',
  defaultPrompt: '', // 图像上色使用滤镜，默认为空
},
// {
//   value: 'control_cartoon_feature',
//   label: '卡通形象垫图',
//   icon: <Eye className="w-5 h-5" />,
//   description: '生成卡通风格图像',
//   color: 'text-purple-500',
// },
// {
//   value: 'description_edit' as DashscopeImageEditFunction,
//   label: t('parameterPanel.functions.description_edit.label'),
//   icon: <Edit3 className="w-5 h-5" />,
//   description: t('parameterPanel.functions.description_edit.description'),
//   color: 'text-blue-500',
// },
// {
//   value: 'description_edit_with_mask',
//   label: '局部重绘',
//   icon: <PaintBucket className="w-5 h-5" />,
//   description: '指定区域重新绘制',
//   color: 'text-orange-500',
// },
// {
//   value: 'doodle',
//   label: '线稿生图',
//   icon: <PenTool className="w-5 h-5" />,
//   description: '将线稿转换为完整图像',
//   color: 'text-green-500',
// },
{
  value: 'expand' as DashscopeImageEditFunction,
  label: t('parameterPanel.functions.expand.label'),
  icon: <Expand className="w-5 h-5" />,
  description: t('parameterPanel.functions.expand.description'),
  color: 'text-indigo-500',
  defaultPrompt: t('parameterPanel.defaultPrompts.expand'),
}, {
  value: 'remove_watermark' as DashscopeImageEditFunction,
  label: t('parameterPanel.functions.remove_watermark.label'),
  icon: <Eraser className="w-5 h-5" />,
  description: t('parameterPanel.functions.remove_watermark.description'),
  color: 'text-red-500',
  defaultPrompt: t('parameterPanel.defaultPrompts.remove_watermark'),
},
// {
//   value: 'stylization_all',
//   label: '全局风格化',
//   icon: <Sparkles className="w-5 h-5" />,
//   description: '改变整体图像风格',
//   color: 'text-yellow-500',
// },
// {
//   value: 'stylization_local',
//   label: '局部风格化',
//   icon: <Brush className="w-5 h-5" />,
//   description: '局部区域风格转换',
//   color: 'text-teal-500',
// },
{
  value: 'super_resolution' as DashscopeImageEditFunction,
  label: t('parameterPanel.functions.super_resolution.label'),
  icon: <Zap className="w-5 h-5" />,
  description: t('parameterPanel.functions.super_resolution.description'),
  color: 'text-cyan-500',
  defaultPrompt: t('parameterPanel.defaultPrompts.super_resolution'),
}];

const getColorizationPresets = (t: ReturnType<typeof useTranslations>) => [
  {
    value: '',
    label: t('parameterPanel.presets.custom.label'),
    icon: <Settings className="w-5 h-5" />,
    description: t('parameterPanel.presets.custom.description'),
    color: 'text-gray-500',
  },
  {
    value: t('parameterPanel.presets.natural.value'),
    label: t('parameterPanel.presets.natural.label'),
    icon: <Leaf className="w-5 h-5" />,
    description: t('parameterPanel.presets.natural.description'),
    color: 'text-green-500',
  },
  {
    value: t('parameterPanel.presets.warm.value'),
    label: t('parameterPanel.presets.warm.label'),
    icon: <Sunrise className="w-5 h-5" />,
    description: t('parameterPanel.presets.warm.description'),
    color: 'text-orange-500',
  },
  {
    value: t('parameterPanel.presets.cool.value'),
    label: t('parameterPanel.presets.cool.label'),
    icon: <Snowflake className="w-5 h-5" />,
    description: t('parameterPanel.presets.cool.description'),
    color: 'text-blue-500',
  },
  {
    value: t('parameterPanel.presets.vintage.value'),
    label: t('parameterPanel.presets.vintage.label'),
    icon: <Camera className="w-5 h-5" />,
    description: t('parameterPanel.presets.vintage.description'),
    color: 'text-amber-600',
  },
  {
    value: t('parameterPanel.presets.vibrant.value'),
    label: t('parameterPanel.presets.vibrant.label'),
    icon: <Rainbow className="w-5 h-5" />,
    description: t('parameterPanel.presets.vibrant.description'),
    color: 'text-rainbow bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent',
  },
  {
    value: t('parameterPanel.presets.soft.value'),
    label: t('parameterPanel.presets.soft.label'),
    icon: <Flower2 className="w-5 h-5" />,
    description: t('parameterPanel.presets.soft.description'),
    color: 'text-pink-400',
  },
  {
    value: t('parameterPanel.presets.cinematic.value'),
    label: t('parameterPanel.presets.cinematic.label'),
    icon: <Film className="w-5 h-5" />,
    description: t('parameterPanel.presets.cinematic.description'),
    color: 'text-purple-600',
  },
  {
    value: t('parameterPanel.presets.japanese.value'),
    label: t('parameterPanel.presets.japanese.label'),
    icon: <Cherry className="w-5 h-5" />,
    description: t('parameterPanel.presets.japanese.description'),
    color: 'text-rose-400',
  },
  {
    value: t('parameterPanel.presets.korean.value'),
    label: t('parameterPanel.presets.korean.label'),
    icon: <Heart className="w-5 h-5" />,
    description: t('parameterPanel.presets.korean.description'),
    color: 'text-pink-500',
  },
  {
    value: t('parameterPanel.presets.historical.value'),
    label: t('parameterPanel.presets.historical.label'),
    icon: <Building className="w-5 h-5" />,
    description: t('parameterPanel.presets.historical.description'),
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
  const { credits, getFeatureCost, hasEnoughCredits } = useCredits();
  const t = useTranslations();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);

  const FUNCTION_OPTIONS = getFunctionOptions(t);
  const COLORIZATION_PRESETS = getColorizationPresets(t);

  const handleInputChange = (field: keyof DashscopeImageEditRequest, value: unknown) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleParameterChange = (field: string, value: unknown) => {
    onFormDataChange({
      ...formData,
      parameters: {
        ...formData.parameters,
        [field]: value,
      },
    });
  };

  // 当功能选择变化时，设置对应的默认提示词
  const handleFunctionChange = (selectedFunction: DashscopeImageEditFunction) => {
    const option = FUNCTION_OPTIONS.find(opt => opt.value === selectedFunction);
    const newPrompt = option?.defaultPrompt || '';

    // 设置功能和对应的默认提示词
    handleInputChange('function', selectedFunction);

    // 如果是图像上色功能，不自动设置提示词，保留滤镜选择
    if (selectedFunction !== 'colorization') {
      handleInputChange('prompt', newPrompt);
    }
  };

  const needsMask = formData.function === 'description_edit_with_mask';
  const isExpand = formData.function === 'expand';
  const isSuperResolution = formData.function === 'super_resolution';
  const isDoodle = formData.function === 'doodle';
  const isStylization = formData.function === 'stylization_all' || formData.function === 'description_edit';
  const isColorization = formData.function === 'colorization';

  // 计算当前选择功能所需积分
  const creditCost = formData.function ? getFeatureCost(formData.function) : 0;
  const hasEnoughCreditForGeneration = hasEnoughCredits(creditCost);

  // 判断按钮是否禁用
  const isButtonDisabled
    = baseImageFiles.length === 0
      || !hasEnoughCreditForGeneration
      || isGenerating;

  // 按钮提示文本
  const getButtonTooltip = () => {
    if (baseImageFiles.length === 0) {
      return t('parameterPanel.tooltipUploadImage');
    }
    if (!hasEnoughCreditForGeneration) {
      return t('parameterPanel.tooltipInsufficientCredits', { cost: creditCost, balance: credits?.balance || 0 });
    }
    return '';
  };

  return (
    <div className="h-fit space-y-6">
      {/* 基础图像上传 */}
      <div className="space-y-2">
        <Label htmlFor="preset-filter" className="text-sm font-medium text-foreground">
          {t('parameterPanel.referenceImage')}
          <span className="text-danger ml-1">*</span>
        </Label>
        <PictureCardForm
          value={baseImageFiles}
          onChange={(files) => {
            // 如果是新上传的文件，进行验证
            if (files.length > baseImageFiles.length) {
              const { file }: any = files[files.length - 1];
              if (file) {
                const validation = validateImage(file, t);
                if (!validation.valid) {
                  setImageValidationError(validation.error || null);
                  return; // 不更新状态，阻止上传
                }
              }
            }
            // 清除错误
            setImageValidationError(null);
            onBaseImageChange(files);
          }}
          maxCount={1}
          className="w-full"
          onUploadComplete={(result) => {
            if (result.success) {
              if (result.file?.url) {
                onFormDataChange({
                  ...formData,
                  base_image_url: result.file.url,
                });
              }
            }
          }}
          onUploadError={(error, file) => {
            console.error('上传失败:', error, file);
            setUploadError(error);
          }}
        />
        <p className="text-xs text-default-500">
          {t('parameterPanel.referenceImageDescription')}
        </p>
        {imageValidationError && (
          <p className="text-xs text-danger mt-1">{imageValidationError}</p>
        )}
        {uploadError && (
          <p className="text-xs text-danger mt-1">{uploadError}</p>
        )}
      </div>

      {/* 功能选择 */}
      <div className="space-y-2">
        <Select
          label={t('parameterPanel.editFunction')}
          labelPlacement="outside"
          placeholder={t('parameterPanel.selectEditFunction')}
          selectedKeys={[formData.function]}
          onSelectionChange={(keys) => {
            const selectedFunction = Array.from(keys)[0] as DashscopeImageEditFunction;
            handleFunctionChange(selectedFunction);
          }}
          isRequired
          className="mb-2"
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
              startContent={<span className={`text-lg ${option.color}`}>{option.icon}</span>}
              description={option.description}
            >
              {option.label}
            </SelectItem>
          ))}
        </Select>
        {formData.function && (
          <div className="text-xs text-success-500 mt-1">
            {t(`parameterPanel.functions.${formData.function}.description`)}
          </div>
        )}
      </div>

      {/* 蒙版图像URL - 仅局部重绘需要 */}
      {needsMask && (
        <div className="space-y-2">
          <Input
            label={t('parameterPanel.maskImageUrl')}
            placeholder={t('parameterPanel.maskImagePlaceholder')}
            value={formData.mask_image_url || ''}
            onChange={e => handleInputChange('mask_image_url', e.target.value)}
            isRequired
            description={t('parameterPanel.maskImageDescription')}
          />
        </div>
      )}

      {/* 图像上色预设滤镜 - 仅图像上色功能显示 */}
      {isColorization && (
        <div className="space-y-2">
          <Label htmlFor="preset-filter" className="text-sm font-medium text-foreground">
            {t('parameterPanel.presetFilter')}
          </Label>
          <Select
            placeholder={t('parameterPanel.selectPresetFilter')}
            selectedKeys={formData.prompt ? [formData.prompt] : ['']}
            onSelectionChange={(keys) => {
              const selectedPreset = Array.from(keys)[0] as string;
              if (selectedPreset) {
                handleInputChange('prompt', selectedPreset);
              }
            }}
            className="mb-2"
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
                startContent={<div className={`text-lg ${preset.color}`}>{preset.icon}</div>}
                description={preset.description}
              >
                {preset.label}
              </SelectItem>
            ))}
          </Select>
          <p className="text-xs text-default-500">
            {t('parameterPanel.presetFilterDescription')}
          </p>
        </div>
      )}

      {/* 删除提示词输入框 */}

      {/* 高级参数 */}
      <div className="space-y-2">
        <Accordion variant="splitted" selectionMode="multiple" defaultExpandedKeys={['advanced-params']}>
          <AccordionItem key="advanced-params" aria-label={t('parameterPanel.advancedParams')} title={t('parameterPanel.advancedParams')} className="px-0">
            <div className="space-y-4">
              {/* 生成数量 */}
              {/* <div>
              <label className="block text-sm font-medium mb-2">
                {t('parameterPanel.generateCount')}
                :
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
            </div> */}

              {/* 修改强度 - 仅特定功能需要 */}
              {isStylization && (
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    {t('parameterPanel.modifyStrength')}
                    :
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
                    {t('parameterPanel.modifyStrengthDescription')}
                  </p>
                </div>
              )}

              {/* 超分倍数 - 仅图像超分需要 */}
              {isSuperResolution && (
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    {t('parameterPanel.upscaleFactor')}
                    :
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
                    {t('parameterPanel.upscaleFactorDescription')}
                  </p>
                </div>
              )}

              {/* 扩图参数 - 仅扩图功能需要 */}
              {isExpand && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">{t('parameterPanel.expandDirection')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-2">
                        {t('parameterPanel.expandUp')}
                        :
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
                        {t('parameterPanel.expandDown')}
                        :
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
                        {t('parameterPanel.expandLeft')}
                        :
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
                        {t('parameterPanel.expandRight')}
                        :
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
                  {t('parameterPanel.isSketch')}
                </Switch>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-6">
        <Tooltip content={getButtonTooltip()} isDisabled={!isButtonDisabled || isGenerating}>
          <Button
            color="primary"
            size="lg"
            startContent={<Wand2 className="w-4 h-4" />}
            endContent={(
              <div className="flex items-center">
                <Coins className="w-4 h-4 mr-1" />
                {creditCost}
              </div>
            )}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onPress={onGenerate}
            isLoading={isGenerating}
            isDisabled={isButtonDisabled}
          >
            {isGenerating ? t('parameterPanel.generating') : t('parameterPanel.startGenerate')}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
