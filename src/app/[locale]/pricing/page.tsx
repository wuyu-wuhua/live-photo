'use client';

import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react';
import { Check, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import StripePayment from '@/components/payments/StripePayment';
import { useCredits } from '@/hooks/useCredits';
import { useUser } from '@/hooks/useUser';

export default function PricingPage() {
  const t = useTranslations();
  const { user } = useUser();
  const { credits, refresh } = useCredits();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showStripePayment, setShowStripePayment] = useState(false);

  // 积分套餐数据 - 基于profile页面的creditPlans
  const creditPlans = [
    {
      id: 'basic',
      name: t('common.plans.basic.name'),
      description: t('common.plans.basic.description'),
      credits: 100,
      price: 9.99,
      popular: false,
      stripe_price_id: 'price_basic',
      features: [
        t('pricing.features.credits', { count: 100 }),
        t('pricing.features.imageEdit'),
        t('pricing.features.videoAnimation'),
        t('pricing.features.highRes'),
        t('pricing.features.noWatermark'),
      ],
      cta: t('pricing.cta.basic'),
    },
    {
      id: 'standard',
      name: t('common.plans.standard.name'),
      description: t('common.plans.standard.description'),
      credits: 500,
      price: 29.99,
      popular: true,
      stripe_price_id: 'price_standard',
      features: [
        t('pricing.features.credits', { count: 500 }),
        t('pricing.features.imageEdit'),
        t('pricing.features.videoAnimation'),
        t('pricing.features.highRes'),
        t('pricing.features.noWatermark'),
        t('pricing.features.priority'),
      ],
      cta: t('pricing.cta.standard'),
      savingLabel: t('pricing.popular'),
    },
    {
      id: 'premium',
      name: t('common.plans.premium.name'),
      description: t('common.plans.premium.description'),
      credits: 1000,
      price: 49.99,
      popular: false,
      stripe_price_id: 'price_premium',
      features: [
        t('pricing.features.credits', { count: 1000 }),
        t('pricing.features.imageEdit'),
        t('pricing.features.videoAnimation'),
        t('pricing.features.highRes'),
        t('pricing.features.noWatermark'),
        t('pricing.features.priority'),
        t('pricing.features.support'),
      ],
      cta: t('pricing.cta.premium'),
    },
  ];

  // 处理购买
  const handlePurchase = (planId: string) => {
    if (!user) {
      // 如果用户未登录，跳转到登录页面
      window.location.href = '/auth/sign-in';
      return;
    }

    const plan = creditPlans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setShowStripePayment(true);
    }
  };

  // 支付成功处理
  const handlePaymentSuccess = (credits: number) => {
    console.warn(t('pricing.paymentSuccess', { credits }));
    // 刷新积分数据
    refresh();
    setShowStripePayment(false);
    setSelectedPlan(null);
  };

  // 关闭支付弹窗
  const handleClosePayment = () => {
    setShowStripePayment(false);
    setSelectedPlan(null);
  };

  return (
    <div
      className={`
        container mx-auto max-w-7xl px-4 py-16
        sm:px-6
        lg:px-8
      `}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h1
          className={`
            text-4xl font-bold tracking-tight
            sm:text-5xl
          `}
        >
          {t('pricing.title')}
        </h1>
        <p className="text-default-500 mt-6 text-lg">
          {t('pricing.subtitle')}
        </p>

        {/* 当前积分显示 */}
        {user && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {t('pricing.currentCredits')}
                :
                {credits?.balance || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        className={`
          mt-16 grid gap-8
          md:grid-cols-3
        `}
      >
        {creditPlans.map(plan => (
          <Card
            key={plan.id}
            className={`
                relative transition-all duration-300 hover:scale-105 hover:shadow-xl
                ${plan.popular
            ? 'border-primary shadow-lg shadow-primary/20 z-10 scale-105 md:scale-105 bg-gradient-to-br from-primary/5 to-primary/10 hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/15'
            : 'hover:border-primary hover:shadow-lg hover:bg-primary/5 hover:scale-105'
          }
              `}
          >
            {plan.popular && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-2 rounded-full shadow-lg border border-white/20 backdrop-blur-sm">
                  <span className="text-sm">
                    ⭐
                    {plan.savingLabel}
                  </span>
                </div>
              </div>
            )}

            <CardHeader
              className={`
                  ${plan.popular ? 'pt-12' : 'pt-6'}
                `}
            >
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="text-default-500 pt-1.5">{plan.description}</p>
            </CardHeader>

            <CardBody className="flex-grow">
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-bold">
                  $
                  {plan.price}
                </span>
                <span className="text-default-500 ml-1">
                  /
                  {' '}
                  {plan.credits}
                  {' '}
                  {t('pricing.credits')}
                </span>
              </div>

              <div className="mb-6">
                <div className="text-sm text-default-500">
                  {t('pricing.pricePerCredit')}
                  : $
                  {(plan.price / plan.credits).toFixed(3)}
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li className="flex items-center gap-2" key={i}>
                    <Check
                      className={`
                        h-4 w-4 text-primary
                      `}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardBody>

            <CardFooter className="mt-6">
              <Button
                className={`w-full transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl'
                    : 'hover:bg-primary hover:text-white hover:border-primary hover:shadow-md'
                }`}
                color={plan.popular ? 'primary' : 'default'}
                variant={plan.popular ? 'solid' : 'bordered'}
                onPress={() => handlePurchase(plan.id)}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-default-100 mt-16 rounded-xl p-8">
        <h2 className="text-2xl font-bold">
          {t('pricing.faq.title')}
        </h2>
        <div
          className={`
            mt-6 grid gap-6
            md:grid-cols-2
          `}
        >
          <div>
            <h3 className="font-semibold">
              {t('pricing.faq.question1')}
            </h3>
            <p className="text-default-500 mt-2 text-sm">
              {t('pricing.faq.answer1')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              {t('pricing.faq.question2')}
            </h3>
            <p className="text-default-500 mt-2 text-sm">
              {t('pricing.faq.answer2')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              {t('pricing.faq.question3')}
            </h3>
            <p className="text-default-500 mt-2 text-sm">
              {t('pricing.faq.answer3')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              {t('pricing.faq.question4')}
            </h3>
            <p className="text-default-500 mt-2 text-sm">
              {t('pricing.faq.answer4')}
            </p>
          </div>
        </div>
      </div>

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
