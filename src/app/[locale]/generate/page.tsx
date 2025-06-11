'use client';

import type { FormUploadFile } from '@/components/upload/picture-card-form';
import type { DashscopeImageEditRequest } from '@/types/dashscope';
import { Button, Card, CardBody, Chip, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { CreditCard, Wallet, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ParameterPanel } from '@/components/generate/ParameterPanel';
import { ResultPanel } from '@/components/generate/ResultPanel';
import StripePayment from '@/components/payments/StripePayment';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { FEATURE_COSTS, useCredits } from '@/hooks/useCredits';
import { useUser } from '@/hooks/useUser';

export default function GeneratePage() {
  const t = useTranslations();
  const { user } = useUser();
  const { credits, loading: creditsLoading, refresh: refreshCredits } = useCredits();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [baseImageFiles, setBaseImageFiles] = useState<FormUploadFile[]>([]);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [imageEditResultId, setImageEditResultId] = useState<string>('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const initialFormData: DashscopeImageEditRequest = {
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
  };

  const [formData, setFormData] = useState<DashscopeImageEditRequest>(initialFormData);

  // 积分套餐数据
  const creditPlans = [
    {
      id: 'basic',
      name: t('common.plans.basic.name'),
      description: t('common.plans.basic.description'),
      credits: 100,
      price: 19,
      popular: false,
      stripe_price_id: 'price_basic',
    },
    {
      id: 'standard',
      name: t('common.plans.standard.name'),
      description: t('common.plans.standard.description'),
      credits: 500,
      price: 79,
      popular: true,
      stripe_price_id: 'price_standard',
    },
    {
      id: 'premium',
      name: t('common.plans.premium.name'),
      description: t('common.plans.premium.description'),
      credits: 1200,
      price: 159,
      popular: false,
      stripe_price_id: 'price_premium',
    },
  ];

  const handleFormDataChange = (data: DashscopeImageEditRequest) => {
    setFormData(data);
  };

  const handleBaseImageChange = (files: FormUploadFile[]) => {
    setBaseImageFiles(files);
  };

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      base_image_url: formData.base_image_url, // 保留已上传的图片URL
    });
    // 不清空 baseImageFiles，保持已上传的图片
    // setBaseImageFiles([]);
    // 不重置 originalImageUrl，保持图片对比显示
    // setOriginalImageUrl('');
  };

  // 检查积分是否足够
  const checkCredits = () => {
    if (!user) {
      toast.error(t('generate.pleaseLogin'));
      return false;
    }

    const requiredCredits = FEATURE_COSTS[formData.function as keyof typeof FEATURE_COSTS] || 5;
    const currentCredits = credits?.balance || 0;

    if (currentCredits < requiredCredits) {
      setShowCreditModal(true);
      return false;
    }

    return true;
  };

  // 处理充值
  const handleTopUp = (planId: string) => {
    const plan = creditPlans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setShowStripePayment(true);
      setShowCreditModal(false);
    }
  };

  // 支付成功处理
  const handlePaymentSuccess = (credits: number) => {
    toast.success(t('generate.paymentSuccess').replace('{credits}', credits.toString()));
    // 刷新积分数据
    refreshCredits();
    setShowStripePayment(false);
    setSelectedPlan(null);
  };

  // 关闭支付弹窗
  const handleClosePayment = () => {
    setShowStripePayment(false);
    setSelectedPlan(null);
  };

  const handleGenerate = async () => {
    // 检查积分
    if (!checkCredits()) {
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    // 保存原图URL用于对比显示
    if (formData.base_image_url) {
      setOriginalImageUrl(formData.base_image_url);
    }

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

      const result: any = await response.json();
      if (result.success && result.data?.output?.results) {
        const imageUrls = result.data.output.results.map((item: any) => item.url);
        setGeneratedImages(imageUrls);

        // 设置 imageEditResultId 用于实时订阅
        if (result.data?.imageEditResultId) {
          setImageEditResultId(result.data.imageEditResultId);
        }

        // 生成成功后重置表单（但保留原图URL用于对比显示）
        resetForm();

        // 刷新积分数据
        refreshCredits();

        // 显示成功提示
        toast.success(t('generate.generateSuccess'));
      } else {
        throw new Error(result.error || t('generate.generateFailed'));
      }
    } catch (error) {
      // 显示错误提示
      toast.error(error instanceof Error ? error.message : t('generate.generateFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* 标题区域 */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-md">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-400 dark:to-gray-200 bg-clip-text text-transparent">
                  {t('generate.title')}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('generate.subtitle')}
                </p>
              </div>
            </div>

            {/* 积分显示 */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm shadow-sm border border-gray-200 dark:border-gray-700">
                  <Wallet className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-medium">
                    {creditsLoading ? '...' : credits?.balance || 0}
                    {' '}
                    {t('profile.credits')}
                  </span>
                </div>
                <Button
                  size="sm"
                  color="default"
                  variant="flat"
                  onPress={() => setShowCreditModal(true)}
                  startContent={<CreditCard className="w-4 h-4" />}
                  className="shadow-sm"
                >
                  {t('generate.topUp')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto p-4 pt-6">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-[calc(100vh-140px)] rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"
        >
          {/* 左侧参数面板 */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="overflow-y-auto p-4 h-full">
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
          <ResizableHandle withHandle className="bg-gray-200 dark:bg-gray-800" />

          {/* 右侧结果展示区域 */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full overflow-y-auto p-4">
              <ResultPanel
                isGenerating={isGenerating}
                generatedImages={generatedImages}
                originalImageUrl={originalImageUrl}
                onGenerate={handleGenerate}
                imageEditResultId={imageEditResultId}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* 积分不足弹窗 */}
      <Modal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} size="2xl">
        <ModalContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
          <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-400 dark:to-gray-200 bg-clip-text text-transparent">{t('generate.insufficientCredits')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('generate.selectCreditPackage')}</p>
          </ModalHeader>
          <ModalBody className="pb-6 pt-4">
            <div className="space-y-4">
              {creditPlans.map(plan => (
                <Card
                  key={plan.id}
                  className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all cursor-pointer border border-gray-200 dark:border-gray-800 ${plan.popular ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 shadow-md' : 'shadow-sm'}`}
                  isPressable
                  onPress={() => handleTopUp(plan.id)}
                >
                  <CardBody className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{plan.name}</h4>
                          {plan.popular && (
                            <Chip size="sm" color="default" className="shadow-sm">{t('generate.recommended')}</Chip>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                        <p className="text-sm font-medium mt-1 text-gray-700 dark:text-gray-300">
                          {plan.credits}
                          {' '}
                          {t('profile.credits')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-400 dark:to-gray-200 bg-clip-text text-transparent">
                          ¥
                          {plan.price}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ¥
                          {(plan.price / plan.credits * 100).toFixed(1)}
                          /100
                          {t('profile.credits')}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Stripe 支付弹窗 */}
      {showStripePayment && selectedPlan && (
        <StripePayment
          isOpen={showStripePayment}
          onClose={handleClosePayment}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
