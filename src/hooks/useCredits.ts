'use client';

import type {
  AddCreditsRequest,
  CreditTransaction,
  CreditTransactionResponse,
  DeductCreditsRequest,
  FeatureCreditCost,
  RefundCreditsRequest,
  UserCredits,
} from '@/types/database';
import { useCallback, useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUser } from './useUser';

// 各功能消耗的积分配置
export const FEATURE_COSTS: FeatureCreditCost = {
  // 图像编辑功能
  stylization_all: 5,
  stylization_local: 6,
  description_edit: 8,
  description_edit_with_mask: 10,
  remove_watermark: 3,
  expand: 4,
  super_resolution: 7,
  colorization: 6,
  doodle: 5,
  control_cartoon_feature: 7,
  // 视频动画功能
  liveportrait_animation: 15,
  emoji_animation: 12,
};

/**
 * 用户积分钩子函数
 * 用于管理用户积分的获取、消费和相关操作
 */
export function useCredits() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const supabase = createSupabaseClient();

  // 强制刷新积分数据
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // 获取用户积分信息
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!user?.id) {
        setCredits(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 获取用户积分信息
        const { data, error } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setCredits(data as UserCredits);
        } else {
          // 如果用户没有积分记录，则创建一个初始记录
          const { data: newCredit, error: createError } = await supabase
            .from('user_credits')
            .insert({
              user_id: user.id,
              balance: 0,
              lifetime_earned: 0,
              lifetime_spent: 0,
            })
            .select('*')
            .single();

          if (createError) {
            throw createError;
          }
          setCredits(newCredit as UserCredits);
        }
      } catch (err: any) {
        console.warn('获取用户积分失败:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCredits();
  }, [user?.id, supabase, refreshTrigger]);

  // 获取用户最近的交易记录
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!user?.id) {
        setRecentTransactions([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          throw error;
        }
        setRecentTransactions(data as CreditTransaction[]);
      } catch (err: any) {
        console.warn('获取交易记录失败:', err.message);
      }
    };

    fetchRecentTransactions();
  }, [user?.id, supabase, refreshTrigger]);

  // 获取用户所有交易记录(分页)
  const fetchTransactions = useCallback(
    async (page = 1, limit = 20) => {
      if (!user?.id) {
        return { data: [], pagination: { total: 0 } };
      }

      try {
        const offset = (page - 1) * limit;

        // 获取总数
        const { count } = await supabase
          .from('credit_transactions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 获取分页数据
        const { data, error } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          throw error;
        }

        setTransactions(data as CreditTransaction[]);

        return {
          data: data as CreditTransaction[],
          pagination: {
            total: count || 0,
            page,
            limit,
            totalPages: count ? Math.ceil(count / limit) : 0,
          },
        };
      } catch (err: any) {
        console.warn('获取交易记录失败:', err.message);
        return { data: [], pagination: { total: 0 } };
      }
    },
    [user?.id, supabase],
  );

  // 检查用户是否有足够的积分
  const hasEnoughCredits = useCallback(
    (amount: number) => {
      if (!credits) {
        return false;
      }
      return credits.balance >= amount;
    },
    [credits],
  );

  // 根据功能类型获取所需积分
  const getFeatureCost = useCallback(
    (featureType: keyof FeatureCreditCost) => {
      return FEATURE_COSTS[featureType] || 0;
    },
    [],
  );

  // 消费积分
  const deductCredits = useCallback(
    async (request: DeductCreditsRequest): Promise<CreditTransactionResponse> => {
      if (!user?.id) {
        return {
          success: false,
          error: '用户未登录',
          data: { transactionId: '', newBalance: 0 },
        };
      }

      try {
        // 调用存储过程扣除积分
        const { data, error } = await supabase.rpc('deduct_user_credits', {
          p_user_id: user.id,
          p_amount: request.amount,
          p_type: request.type,
          p_description: request.description || '',
          p_reference_id: request.referenceId,
          p_metadata: request.metadata,
        });

        if (error) {
          throw error;
        }

        // 刷新积分数据
        refresh();

        return {
          success: true,
          data: {
            transactionId: data.transaction_id,
            newBalance: data.new_balance,
          },
        };
      } catch (err: any) {
        console.warn('扣除积分失败:', err.message);
        return {
          success: false,
          error: err.message,
          data: { transactionId: '', newBalance: 0 },
        };
      }
    },
    [user?.id, supabase, refresh],
  );

  // 添加积分
  const addCredits = useCallback(
    async (request: AddCreditsRequest): Promise<CreditTransactionResponse> => {
      if (!user?.id) {
        return {
          success: false,
          error: '用户未登录',
          data: { transactionId: '', newBalance: 0 },
        };
      }

      try {
        // 调用存储过程添加积分
        const { data, error } = await supabase.rpc('add_user_credits', {
          p_user_id: user.id,
          p_amount: request.amount,
          p_type: request.type,
          p_description: request.description || '',
          p_reference_id: request.referenceId,
          p_metadata: request.metadata,
        });

        if (error) {
          throw error;
        }

        // 刷新积分数据
        refresh();

        return {
          success: true,
          data: {
            transactionId: data.transaction_id,
            newBalance: data.new_balance,
          },
        };
      } catch (err: any) {
        console.warn('添加积分失败:', err.message);
        return {
          success: false,
          error: err.message,
          data: { transactionId: '', newBalance: 0 },
        };
      }
    },
    [user?.id, supabase, refresh],
  );

  // 退款/返还积分
  const refundCredits = useCallback(
    async (request: RefundCreditsRequest): Promise<CreditTransactionResponse> => {
      if (!user?.id) {
        return {
          success: false,
          error: '用户未登录',
          data: { transactionId: '', newBalance: 0 },
        };
      }

      try {
        // 调用存储过程退还积分
        const { data, error } = await supabase.rpc('refund_user_credits', {
          p_transaction_id: request.transactionId,
          p_reason: request.reason,
        });

        if (error) {
          throw error;
        }

        // 刷新积分数据
        refresh();

        return {
          success: true,
          data: {
            transactionId: data.refund_transaction_id,
            newBalance: data.new_balance,
          },
        };
      } catch (err: any) {
        console.warn('退还积分失败:', err.message);
        return {
          success: false,
          error: err.message,
          data: { transactionId: '', newBalance: 0 },
        };
      }
    },
    [user?.id, supabase, refresh],
  );

  return {
    credits,
    loading,
    error,
    recentTransactions,
    transactions,
    fetchTransactions,
    hasEnoughCredits,
    getFeatureCost,
    deductCredits,
    addCredits,
    refundCredits,
    refresh,
  };
}
