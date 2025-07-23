import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { confirmPayment } from '@/lib/stripe-server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId }: any = await request.json();

    // 验证用户身份
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing payment intent ID' },
        { status: 400 },
      );
    }

    // 确认支付状态
    const paymentIntent = await confirmPayment(paymentIntentId);

    // 添加调试日志
    console.log('🔍 支付确认信息:', {
      paymentIntentId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      planId: paymentIntent.metadata.planId,
      planName: paymentIntent.metadata.planName,
    });

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed', status: paymentIntent.status },
        { status: 400 },
      );
    }

    // 更新支付意图状态
    const { error: updateError } = await supabase
      .from('stripe_payment_intents')
      .update({
        status: paymentIntent.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentIntentId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating payment intent:', updateError);
    }

    // 获取支付元数据
    const metadata = paymentIntent.metadata;
    const planId = metadata.planId;
    const planName = metadata.planName;

    // 根据planId确定积分数量
    let credits = 0;
    switch (planId) {
      case 'basic':
        credits = 100;
        break;
      case 'standard':
        credits = 500;
        break;
      case 'premium':
        credits = 1000;
        break;
      case 'subscription':
        credits = 2000;
        break;
      default:
        // 如果没有匹配的套餐，根据金额计算积分（1美元=60积分）
        credits = Math.floor((paymentIntent.amount / 100) * 60);
    }

    // 添加积分到用户账户
    const { data: creditResult, error: creditError } = await supabase.rpc(
      'add_user_credits',
      {
        p_user_id: user.id,
        p_amount: credits,
        p_type: 'PURCHASE',
        p_description: `充值积分: ${planName || '自定义套餐'}`,
        p_reference_id: paymentIntentId,
        p_metadata: {
          paymentIntentId,
          planId,
          planName,
          stripeAmount: paymentIntent.amount,
        },
      },
    );

    if (creditError) {
      console.error('Error adding credits:', creditError);
      return NextResponse.json(
        { error: 'Failed to add credits' },
        { status: 500 },
      );
    }

    // 添加支付成功日志
    console.log('✅ 支付成功完成:', {
      paymentIntentId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      credits,
      planId,
      planName,
      transactionId: creditResult?.transaction_id,
    });

    return NextResponse.json({
      success: true,
      credits,
      transactionId: creditResult?.transaction_id,
      message: `成功充值 ${credits} 积分`,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
