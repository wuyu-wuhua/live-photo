'use client';

import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

export default function PricingPage() {
  const t = useTranslations();
  const [selectedPlan, setSelectedPlan] = useState('pro'); // 默认选中Pro计划

  // 定价计划数据
  const plans = [
    {
      cta: t('pricing.free.cta'),
      description: t(
        'pricing.free.description',
      ),
      features: [
        t('pricing.free.features.watermarked'),
        t('pricing.free.features.resolution'),
        t('pricing.free.features.previews'),
        t('pricing.free.features.filters'),
      ],
      id: 'free',
      name: t('pricing.free.name'),
      popular: false,
      price: {
        monthly: t('pricing.free.price.monthly'),
        yearly: t('pricing.free.price.yearly'),
      },
    },
    {
      cta: t('pricing.pro.cta'),
      description: t(
        'pricing.pro.description',
      ),
      features: [
        t('pricing.pro.features.credits'),
        t(
          'pricing.pro.features.highRes',
        ),
        t('pricing.pro.features.noWatermark'),
        t('pricing.pro.features.rollover'),
        t('pricing.pro.features.filters'),
      ],
      id: 'pro',
      name: t('pricing.pro.name'),
      popular: true,
      price: {
        monthly: t('pricing.pro.price.monthly'),
        yearly: t('pricing.pro.price.yearly'),
      },
      savingLabel: t('pricing.pro.savingLabel'),
    },
    {
      cta: t('pricing.onetime.cta'),
      description: t(
        'pricing.onetime.description',
      ),
      features: [
        t('pricing.onetime.features.credits'),
        t(
          'pricing.onetime.features.highRes',
        ),
        t('pricing.onetime.features.noWatermark'),
        t('pricing.onetime.features.validity'),
        t('pricing.onetime.features.filters'),
      ],
      id: 'onetime',
      name: t('pricing.onetime.name'),
      popular: false,
      price: {
        monthly: t('pricing.onetime.price.value'),
        yearly: null,
      },
      priceDetail: t('pricing.onetime.priceDetail'),
    },
  ];

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
          {t(
            'pricing.subtitle',
          )}
        </p>
      </div>

      <div
        className={`
          mt-16 grid gap-8
          md:grid-cols-3
        `}
      >
        {plans.map(plan => (
          <Card
            key={plan.id}
            className={`
                relative cursor-pointer transition-all duration-200
                ${selectedPlan === plan.id
            ? 'border-primary shadow-lg shadow-primary/10'
            : 'hover:border-primary/50 hover:shadow-md'
          }
              `}
            isPressable
            onPress={() => setSelectedPlan(plan.id)}
          >
            <CardHeader
              className={`
                  ${plan.popular ? 'pt-8' : 'pt-6'}
                `}
            >
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <p className="text-default-500 pt-1.5">{plan.description}</p>
            </CardHeader>
            <CardBody className="flex-grow">
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-bold">{plan.price.monthly}</span>
                {plan.price.yearly && (
                  <span className="text-default-500 ml-1">
                    /
                    {t('pricing.month')}
                  </span>
                )}
              </div>
              {plan.price.yearly && (
                <div className="mb-6 flex items-center gap-2">
                  <div className="text-default-500 text-sm">
                    {t('pricing.billedAnnually')}
                    {' '}
                    <span className="font-medium">{plan.price.yearly}</span>
                  </div>
                  {plan.savingLabel && (
                    <div
                      className={`
                        rounded-full bg-primary/10 px-2 py-0.5 text-xs
                        font-medium text-primary
                      `}
                    >
                      {plan.savingLabel}
                    </div>
                  )}
                </div>
              )}
              {plan.priceDetail && (
                <div className="text-default-500 mb-6 text-sm">
                  {plan.priceDetail}
                </div>
              )}
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li className="flex items-center gap-2" key={i}>
                    <Check
                      className={`
                        h-4 w-4
                        ${
                  selectedPlan === plan.id
                    ? 'text-primary'
                    : `text-default-500`
                  }
                      `}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter className="mt-6">
              <Button
                className="w-full"
                color={selectedPlan === plan.id ? 'primary' : 'default'}
                variant={selectedPlan === plan.id ? 'solid' : 'bordered'}
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
              {t(
                'pricing.faq.answer1',
              )}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              {t('pricing.faq.question2')}
            </h3>
            <p className="text-default-500 mt-2 text-sm">
              {t(
                'pricing.faq.answer2',
              )}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              {t(
                'pricing.faq.question3',
              )}
            </h3>
            <p className="text-default-500 mt-2 text-sm">
              {t(
                'pricing.faq.answer3',
              )}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              {t(
                'pricing.faq.question4',
              )}
            </h3>
            <p className="text-default-500 mt-2 text-sm">
              {t(
                'pricing.faq.answer4',
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
