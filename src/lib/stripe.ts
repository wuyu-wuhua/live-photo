import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * 获取Stripe实例
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

/**
 * Stripe配置
 */
export const stripeConfig = {
  currency: 'cny', // 人民币
  locale: 'zh' as const,
};
