'use client';

import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ImageEditResult, TaskStatus } from '@/types/database';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type SubscriptionCallback<T> = (payload: T) => void;

type UseSupabaseSubscriptionOptions = {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  filterValues?: any[];
};

/**
 * 自定义Hook，用于订阅Supabase数据库变更
 * @param options 订阅选项
 * @param callback 回调函数，当收到变更时调用
 * @returns 订阅状态和错误信息
 */
export function useSupabaseSubscription<T = any>(
  options: UseSupabaseSubscriptionOptions,
  callback: SubscriptionCallback<T>,
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // 创建订阅
    const {
      table,
      schema = 'public',
      event = '*',
      filter,
      filterValues = [],
    } = options;

    try {
      // 创建一个唯一的通道名称
      const channelName = `${schema}:${table}:${event}:${Date.now()}`;

      // 初始化通道
      let subscription = supabase.channel(channelName);

      // 配置postgres_changes监听器
      const pgChangesConfig: any = {
        event,
        schema,
        table,
      };

      // 如果有过滤条件，添加到配置中
      if (filter && filterValues.length > 0) {
        pgChangesConfig.filter = filter;
      }

      // 订阅数据库变更
      subscription = subscription
        .on('postgres_changes', pgChangesConfig, (payload) => {
          // 调用回调函数，传递变更数据
          callback(payload.new as T);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true);
          } else {
            setIsSubscribed(false);
          }
        });

      // 保存通道引用，以便清理
      setChannel(subscription);

      // 清理函数
      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : '订阅失败');
      return () => {};
    }
  }, [options, callback]);

  return { isSubscribed, error };
}

/**
 * 订阅特定图像编辑任务的状态变更
 * @param imageId 图像编辑任务ID
 * @param callback 状态变更回调函数
 * @returns 订阅状态和错误信息
 */
export function useImageEditStatusSubscription(
  imageId: string,
  callback: (result: ImageEditResult) => void,
) {
  return useSupabaseSubscription<ImageEditResult>(
    {
      table: 'image_edit_results',
      event: 'UPDATE',
      filter: 'id=eq.$1',
      filterValues: [imageId],
    },
    callback,
  );
}

/**
 * 订阅特定状态的图像编辑任务
 * @param status 任务状态
 * @param callback 状态变更回调函数
 * @returns 订阅状态和错误信息
 */
export function useImageEditsByStatusSubscription(
  status: TaskStatus,
  callback: (result: ImageEditResult) => void,
) {
  return useSupabaseSubscription<ImageEditResult>(
    {
      table: 'image_edit_results',
      event: 'UPDATE',
      filter: 'status=eq.$1',
      filterValues: [status],
    },
    callback,
  );
}
