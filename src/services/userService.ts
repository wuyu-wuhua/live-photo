import type { User } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase';

// 用户服务类
export class UserService {
  private supabase = createSupabaseClient();

  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // 获取会话
  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  // 使用邮箱密码登录
  async signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  // 使用邮箱注册
  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  // 登出
  async signOut() {
    return this.supabase.auth.signOut();
  }

  // 重置密码
  async resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  }

  // 更新用户
  async updateUser(updates: {
    email?: string;
    password?: string;
    data?: { [key: string]: any };
  }) {
    return this.supabase.auth.updateUser(updates);
  }

  // 设置新密码（密码重置后）
  async setNewPassword(password: string) {
    return this.supabase.auth.updateUser({ password });
  }

  // 监听认证状态变化
  onAuthStateChange(callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'PASSWORD_RECOVERY', session: any) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event as any, session);
    });
  }
}

// 导出单例实例
export const userService = new UserService();
