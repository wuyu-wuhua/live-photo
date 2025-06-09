import { createSupabaseClient } from '@/lib/supabase';

// 定义Todo类型
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
  created_at: string;
};

// 创建Todo服务类
export class TodoService {
  private supabase = createSupabaseClient();
  private table = 'todos';

  // 获取当前用户的所有Todo
  async getTodos(): Promise<Todo[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取Todo列表错误:', error);
      throw error;
    }

    return data || [];
  }

  // 获取单个Todo
  async getTodo(id: string): Promise<Todo | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`获取Todo(${id})错误:`, error);
      throw error;
    }

    return data;
  }

  // 创建新Todo
  async createTodo(title: string): Promise<Todo> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert([{ title, completed: false }])
      .select()
      .single();

    if (error) {
      console.error('创建Todo错误:', error);
      throw error;
    }

    return data;
  }

  // 更新Todo
  async updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'created_at' | 'user_id'>>): Promise<Todo> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`更新Todo(${id})错误:`, error);
      throw error;
    }

    return data;
  }

  // 删除Todo
  async deleteTodo(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`删除Todo(${id})错误:`, error);
      throw error;
    }
  }

  // 切换Todo完成状态
  async toggleTodoCompleted(id: string, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed });
  }
}

// 导出单例实例
export const todoService = new TodoService();
