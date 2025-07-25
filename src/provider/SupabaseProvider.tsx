'use client';

import type { User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// 创建Supabase上下文类型
type SupabaseContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// 创建Supabase上下文
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Supabase提供者组件
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // 初始化用户状态
  useEffect(() => {
    let subscription: any;

    const initUser = async () => {
      try {
        // 获取当前会话
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        // 监听认证状态变化
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setUser(session?.user || null);
          },
        );
        subscription = authSubscription;
      } catch (error) {
        console.error('初始化用户状态错误:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase.auth]);

  // 登录方法
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('登录错误:', error);
      throw error;
    }
  }, [supabase.auth]);

  // 注册方法
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('注册错误:', error);
      throw error;
    }
  }, [supabase.auth]);

  // 登出方法
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('登出错误:', error);
      throw error;
    }
  }, [supabase.auth]);

  // 提供上下文值
  const value = useMemo(() => ({
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }), [user, isLoading, signIn, signUp, signOut]);

  return (
    <SupabaseContext value={value}>
      {children}
    </SupabaseContext>
  );
}

// 使用Supabase上下文的钩子
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase必须在SupabaseProvider内部使用');
  }
  return context;
}
