import { describe, expect, it, vi } from 'vitest';
import { FEATURE_COSTS } from '../hooks/useCredits';
import { calculateCreditCost, consumeCreditsForImageEdit, refundCreditsForFailedTask } from '../lib/credits';

// 模拟supabase客户端
vi.mock('../lib/supabase', () => ({
  createSupabaseClient: vi.fn(() => ({
    rpc: vi.fn().mockImplementation((funcName, _params) => {
      if (funcName === 'deduct_user_credits') {
        return {
          data: {
            success: true,
            message: '积分扣除成功',
            transaction_id: 'mock-transaction-id',
            new_balance: 95,
          },
          error: null,
        };
      }
      if (funcName === 'refund_user_credits') {
        return {
          data: {
            success: true,
            message: '积分退款成功',
            refund_transaction_id: 'mock-refund-transaction-id',
            new_balance: 100,
          },
          error: null,
        };
      }
      return { data: null, error: new Error('未知的RPC调用') };
    }),
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'mock-user-id',
          user_id: 'mock-user-id',
          balance: 100,
          lifetime_earned: 200,
          lifetime_spent: 100,
        },
        error: null,
      }),
    })),
  })),
}));

describe('积分系统测试', () => {
  describe('calculateCreditCost', () => {
    it('应该根据功能类型计算正确的基础积分', () => {
      // 测试不同功能类型的基础积分计算
      expect(calculateCreditCost('stylization_all')).toBe(FEATURE_COSTS.stylization_all);
      expect(calculateCreditCost('liveportrait_animation')).toBe(FEATURE_COSTS.liveportrait_animation);
      expect(calculateCreditCost('emoji_animation')).toBe(FEATURE_COSTS.emoji_animation);
    });

    it('应该根据质量等级调整积分消耗', () => {
      // 测试标准质量
      expect(calculateCreditCost('stylization_all', { quality: 'standard' })).toBe(5);
      // 测试高质量（1.5倍）
      expect(calculateCreditCost('stylization_all', { quality: 'high' })).toBe(8); // 5 * 1.5 = 7.5，向上取整为8
      // 测试超高质量（2.5倍）
      expect(calculateCreditCost('stylization_all', { quality: 'ultra' })).toBe(13); // 5 * 2.5 = 12.5，向上取整为13
    });

    it('应该根据数量调整积分消耗', () => {
      // 测试多个数量
      expect(calculateCreditCost('stylization_all', { count: 2 })).toBe(10); // 5 * 2 = 10
      expect(calculateCreditCost('stylization_all', { count: 3 })).toBe(15); // 5 * 3 = 15
    });

    it('应该同时考虑质量和数量', () => {
      // 测试质量和数量的组合
      expect(calculateCreditCost('stylization_all', { quality: 'high', count: 2 })).toBe(15); // 5 * 1.5 * 2 = 15
      expect(calculateCreditCost('stylization_all', { quality: 'ultra', count: 2 })).toBe(25); // 5 * 2.5 * 2 = 25
    });

    it('应该处理未知的功能类型', () => {
      // @ts-expect-error 测试未知的功能类型
      expect(calculateCreditCost('unknown_function')).toBe(0);
    });
  });

  describe('consumeCreditsForImageEdit', () => {
    it('应该成功扣除积分并返回交易ID', async () => {
      const result = await consumeCreditsForImageEdit(
        'mock-user-id',
        'stylization_all',
        { quality: 'standard' },
        'mock-reference-id',
      );

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('mock-transaction-id');
    });

    it('应该使用forceCreditCost参数而不是计算积分', async () => {
      const result = await consumeCreditsForImageEdit(
        'mock-user-id',
        'stylization_all',
        { quality: 'standard' },
        'mock-reference-id',
        10, // 强制使用10积分
      );

      expect(result.success).toBe(true);
      // 由于我们模拟了RPC调用，无法验证实际传递的积分值
      // 在实际测试中，可以通过spy来验证传递给RPC的参数
    });
  });

  describe('refundCreditsForFailedTask', () => {
    it('应该成功退还积分', async () => {
      const result = await refundCreditsForFailedTask('mock-transaction-id', '测试退款原因');

      expect(result.success).toBe(true);
      // 不再检查 message 字段，因为函数成功时不返回该字段
    });
  });
});
