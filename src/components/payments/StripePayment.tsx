'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
} from '@heroui/react';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getStripe } from '@/lib/stripe';

type CreditPlan = {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
  stripe_price_id: string;
};

type StripePaymentProps = {
  plan: CreditPlan;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credits: number) => void;
};

function CheckoutForm({ plan, onSuccess, onClose }: Omit<StripePaymentProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const t = useTranslations('profile');

  // 动态配置 CardElement 选项
  const cardElementOptions = {
    style: {
      base: {
        'fontSize': '16px',
        'color': '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // 创建支付意图
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: plan.price,
            planId: plan.id,
            planName: plan.name,
          }),
        });

        const data: any = await response.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(t('payment.createFailed'));
        console.error('Error creating payment intent:', err);
      }
    };

    createPaymentIntent();
  }, [plan]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError(t('payment.formNotLoaded'));
      setIsLoading(false);
      return;
    }

    try {
      // 确认支付
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        },
      );

      if (stripeError) {
        setError(stripeError.message || t('payment.failed'));
        setIsLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // 确认支付成功，添加积分
        const confirmResponse = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        });

        const confirmData: any = await confirmResponse.json();

        if (confirmData.error) {
          setError(confirmData.error);
          setIsLoading(false);
          return;
        }

        // 支付成功
        onSuccess(confirmData.credits);
        onClose();
      }
    } catch (err) {
      setError(t('payment.processingFailed'));
      console.error('Payment error:', err);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 套餐信息 */}
      <div className="p-4 bg-default-50 rounded-lg">
        <h4 className="font-semibold text-lg">{plan.name}</h4>
        <p className="text-sm text-default-500 mt-1">{plan.description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm">
            {t('credits')}
            :
            {plan.credits}
          </span>
          <span className="text-xl font-bold text-primary">
            $
            {plan.price}
          </span>
        </div>
      </div>

      {/* 支付表单 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('payment.cardInfo')}
          </label>
          <div className="p-3 border border-default-200 rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* 支付按钮 */}
      <div className="flex gap-3">
        <Button
          variant="light"
          onPress={onClose}
          className="flex-1"
          disabled={isLoading}
        >
          {t('payment.cancel')}
        </Button>
        <Button
          type="submit"
          color="primary"
          className="flex-1"
          disabled={!stripe || !clientSecret || isLoading}
        >
          {isLoading
            ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span className="ml-2">{t('payment.processing')}</span>
                </>
              )
            : (
                `${t('payment.pay')} $${plan.price}`
              )}
        </Button>
      </div>
    </form>
  );
}

export default function StripePayment({ plan, isOpen, onClose, onSuccess }: StripePaymentProps) {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  const [stripePromise] = useState(() => {
    // 根据当前语言环境设置 Stripe 语言
    return getStripe(locale === 'zh' ? 'zh' : 'en');
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-semibold">{t('profile.payment.securePayment')}</h3>
        </ModalHeader>
        <ModalBody>
          <Elements stripe={stripePromise}>
            <CheckoutForm plan={plan} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
