import type { AuthError, Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

// 认证响应类型
export type AuthResponse = {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
};

// 创建Supabase客户端实例
const supabase = createClient();

/**
 * 用户注册
 * @param email 邮箱
 * @param password 密码
 * @returns Promise<AuthResponse>
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // 如果注册成功且用户存在，给新用户赠送10点积分
    if (data.user && !error) {
      try {
        await supabase.rpc('add_user_credits', {
          p_user_id: data.user.id,
          p_amount: 10,
          p_type: 'BONUS',
          p_description: '新用户注册奖励',
          p_reference_id: `signup_${data.user.id}`,
          p_metadata: { source: 'new_user_registration' },
        });
      } catch (creditError) {
        // 积分赠送失败不影响注册流程
        console.error('新用户积分赠送失败:', creditError);
      }
    }

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error) {
    console.error('注册错误:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * 用户登录
 * @param email 邮箱
 * @param password 密码
 * @returns Promise<AuthResponse>
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error) {
    console.error('登录错误:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * GitHub第三方登录
 * @returns Promise<AuthResponse>
 */
export async function signInWithGitHub(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error) {
    console.error('GitHub登录错误:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * Google第三方登录
 * @returns Promise<AuthResponse>
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error) {
    console.error('Google登录错误:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * 用户登出
 * @returns Promise<{ error: AuthError | null }>
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('登出错误:', error);
    return { error: error as AuthError };
  }
}

/**
 * 获取当前用户
 * @returns Promise<User | null>
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('获取用户错误:', error);
    return null;
  }
}

/**
 * 获取当前会话
 * @returns Promise<Session | null>
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('获取会话错误:', error);
    return null;
  }
}

/**
 * 重置密码
 * @param email 邮箱
 * @returns Promise<{ error: AuthError | null }>
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  } catch (error) {
    console.error('重置密码错误:', error);
    return { error: error as AuthError };
  }
}

/**
 * 监听认证状态变化
 * @param callback 回调函数
 * @returns 取消订阅函数
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

/**
 * 双因素认证
 * @param factorId 因素ID
 * @param challengeId 挑战ID
 * @param code 验证码
 * @returns Promise<AuthResponse>
 */
export async function twoFactor(
  factorId: string,
  challengeId: string,
  code: string,
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error) {
    console.error('双因素认证错误:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}
