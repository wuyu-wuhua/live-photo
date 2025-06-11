import type { DeductCreditsRequest, ImageEditFunction, ImageEditResult } from '@/types/database';
import { FEATURE_COSTS } from '@/hooks/useCredits';
import { createSupabaseClient } from './supabase';

/**
 * 根据功能类型计算所需的积分
 */
export function calculateCreditCost(
  featureType: ImageEditFunction | 'liveportrait_animation' | 'emoji_animation',
  options?: { quality?: 'standard' | 'high' | 'ultra'; count?: number },
): number {
  const baseCost = FEATURE_COSTS[featureType] || 0;
  const { quality = 'standard', count = 1 } = options || {};

  // 根据质量等级调整积分消耗
  let qualityMultiplier = 1;
  if (quality === 'high') {
    qualityMultiplier = 1.5;
  }
  if (quality === 'ultra') {
    qualityMultiplier = 2.5;
  }

  // 数量乘以单价和质量系数
  return Math.ceil(baseCost * qualityMultiplier * count);
}

/**
 * 为图像编辑消费积分
 */
export async function consumeCreditsForImageEdit(
  userId: string,
  editFunction: ImageEditFunction,
  options?: { quality?: 'standard' | 'high' | 'ultra'; count?: number },
  referenceId?: string,
): Promise<{ success: boolean; message?: string; transactionId?: string }> {
  try {
    const supabase = createSupabaseClient();
    const creditCost = calculateCreditCost(editFunction, options);

    // 准备扣除积分的请求
    const request: DeductCreditsRequest = {
      userId,
      amount: creditCost,
      type: 'IMAGE_GENERATION',
      description: `图像编辑: ${editFunction}`,
      referenceId,
      metadata: {
        function: editFunction,
        quality: options?.quality || 'standard',
        count: options?.count || 1,
      },
    };

    // 调用存储过程扣除积分
    const { data, error } = await supabase.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: request.amount,
      p_type: request.type,
      p_description: request.description || '',
      p_reference_id: request.referenceId,
      p_metadata: request.metadata,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      transactionId: data.transaction_id,
    };
  } catch (err: any) {
    console.warn('为图像编辑消费积分失败:', err.message);
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * 为视频动画消费积分
 */
export async function consumeCreditsForAnimation(
  userId: string,
  animationType: 'liveportrait_animation' | 'emoji_animation',
  imageResult: ImageEditResult,
  options?: { quality?: 'standard' | 'high' | 'ultra' },
): Promise<{ success: boolean; message?: string; transactionId?: string }> {
  try {
    const supabase = createSupabaseClient();
    const creditCost = calculateCreditCost(animationType, options);

    // 准备扣除积分的请求
    const request: DeductCreditsRequest = {
      userId,
      amount: creditCost,
      type: 'VIDEO_GENERATION',
      description: `视频动画: ${animationType === 'liveportrait_animation' ? '口型匹配' : '人像动画'}`,
      referenceId: imageResult.id,
      metadata: {
        animationType,
        imageResultId: imageResult.id,
        quality: options?.quality || 'standard',
      },
    };

    // 调用存储过程扣除积分
    const { data, error } = await supabase.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: request.amount,
      p_type: request.type,
      p_description: request.description || '',
      p_reference_id: request.referenceId,
      p_metadata: request.metadata,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      transactionId: data.transaction_id,
    };
  } catch (err: any) {
    console.warn('为视频动画消费积分失败:', err.message);
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * 处理失败时的积分退款
 */
export async function refundCreditsForFailedTask(
  transactionId: string,
  reason: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = createSupabaseClient();

    // 调用存储过程退还积分
    const { error } = await supabase.rpc('refund_user_credits', {
      p_transaction_id: transactionId,
      p_reason: reason,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
    };
  } catch (err: any) {
    console.warn('积分退款失败:', err.message);
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * 检查用户是否有足够的积分进行特定操作
 */
export async function checkUserCredits(
  userId: string,
  requiredAmount: number,
): Promise<{ hasEnough: boolean; currentBalance?: number; deficit?: number }> {
  try {
    const supabase = createSupabaseClient();

    // 获取用户当前积分
    const { data, error } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw error;
    }

    const currentBalance = data?.balance || 0;
    const hasEnough = currentBalance >= requiredAmount;

    return {
      hasEnough,
      currentBalance,
      deficit: hasEnough ? 0 : requiredAmount - currentBalance,
    };
  } catch (err: any) {
    console.warn('检查用户积分失败:', err.message);
    return {
      hasEnough: false,
    };
  }
}

/**
 * 生成动画前的积分检查和消费
 */
export async function prepareAnimationGeneration(
  userId: string,
  imageResult: ImageEditResult,
  animationType: 'liveportrait_animation' | 'emoji_animation',
  options?: { quality?: 'standard' | 'high' | 'ultra' },
): Promise<{
    canProceed: boolean;
    message?: string;
    transactionId?: string;
    creditCost?: number;
  }> {
  try {
    // 计算所需积分
    const creditCost = calculateCreditCost(animationType, options);

    // 检查用户积分是否足够
    const { hasEnough, currentBalance, deficit } = await checkUserCredits(userId, creditCost);

    if (!hasEnough) {
      return {
        canProceed: false,
        message: `积分不足，需要${creditCost}积分，当前余额${currentBalance}积分，还差${deficit}积分`,
        creditCost,
      };
    }

    // 消费积分
    const { success, message, transactionId } = await consumeCreditsForAnimation(
      userId,
      animationType,
      imageResult,
      options,
    );

    if (!success) {
      return {
        canProceed: false,
        message: message || '积分消费失败',
        creditCost,
      };
    }

    return {
      canProceed: true,
      transactionId,
      creditCost,
    };
  } catch (err: any) {
    console.warn('准备生成动画失败:', err.message);
    return {
      canProceed: false,
      message: err.message,
    };
  }
}
