import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe-server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, planId, planName }: any = await request.json();

    // 验证用户身份
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 验证金额
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 },
      );
    }

    // 创建支付意图
    const paymentIntent = await createPaymentIntent({
      amount,
      currency: 'usd', // 明确指定使用美元
      metadata: {
        userId: user.id,
        planId: planId || '',
        planName: planName || '',
        type: 'credit_purchase',
      },
    });

    // 添加调试日志
    console.log('🔍 支付意图创建信息:', {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      planId,
      planName,
      paymentIntentId: paymentIntent.id,
    });

    // 将支付意图保存到数据库
    const { error: dbError } = await supabase
      .from('stripe_payment_intents')
      .insert({
        id: paymentIntent.id,
        user_id: user.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
        created_at: new Date(paymentIntent.created * 1000).toISOString(),
      });

    if (dbError) {
      console.error('Error saving payment intent to database:', dbError);
      // 不阻止支付流程，只记录错误
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
