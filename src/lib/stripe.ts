import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// 缓存不同语言的 Stripe 实例
const stripePromises: Record<string, Promise<Stripe | null>> = {};

/**
 * 获取Stripe实例
 */
export const getStripe = (locale?: string) => {
  const lang = locale === 'zh' ? 'zh' : 'en';
  
  if (!stripePromises[lang]) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
    }

    stripePromises[lang] = loadStripe(publishableKey, {
      locale: lang,
    });
  }
  return stripePromises[lang];
};

/**
 * Stripe配置
 */
export const stripeConfig = {
  currency: 'usd', // 美元
  locale: 'en' as const, // 设置为英文
};
