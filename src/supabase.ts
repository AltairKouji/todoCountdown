// File: src/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 调试信息：检查环境变量是否正确加载
console.log('🔍 Supabase 配置检查:');
console.log('  URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '❌ 未设置');
console.log('  Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ 未设置');

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `
❌ 缺少 Supabase 环境变量！

请检查：
1. Vercel Dashboard → Settings → Environment Variables
2. 确认已添加：
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
3. 添加后需要重新部署（Deployments → Redeploy）

当前状态：
- VITE_SUPABASE_URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}
- VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ 已设置' : '❌ 未设置'}
  `;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// 创建 Supabase 客户端
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// =============================================
// 认证工具函数
// =============================================

/**
 * 匿名登录（如果未登录则自动创建匿名用户）
 */
export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous sign-in error:', error);
    throw error;
  }
  return data;
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * 确保用户已登录（如未登录则自动匿名登录）
 */
export async function ensureAuthenticated() {
  const user = await getCurrentUser();
  if (!user) {
    return await signInAnonymously();
  }
  return { user };
}

// =============================================
// Todos 数据操作
// =============================================

export async function getTodos() {
  await ensureAuthenticated();

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addTodo(todo: {
  title: string;
  notes?: string;
  dueAt?: string;
}) {
  await ensureAuthenticated();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: user!.id,
      title: todo.title,
      notes: todo.notes,
      due_at: todo.dueAt,
      is_done: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTodo(id: string, updates: {
  title?: string;
  notes?: string;
  isDone?: boolean;
  dueAt?: string;
}) {
  await ensureAuthenticated();

  const payload: any = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.isDone !== undefined) payload.is_done = updates.isDone;
  if (updates.dueAt !== undefined) payload.due_at = updates.dueAt;

  const { data, error } = await supabase
    .from('todos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTodo(id: string) {
  await ensureAuthenticated();

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// Countdowns 数据操作
// =============================================

export async function getCountdowns() {
  await ensureAuthenticated();

  const { data, error } = await supabase
    .from('countdowns')
    .select('*')
    .order('target_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addCountdown(countdown: {
  title: string;
  targetDate: string;
  color?: string;
}) {
  await ensureAuthenticated();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('countdowns')
    .insert({
      user_id: user!.id,
      title: countdown.title,
      target_date: countdown.targetDate,
      color: countdown.color || '#0ea5e9',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCountdown(id: string, updates: {
  title?: string;
  targetDate?: string;
  color?: string;
}) {
  await ensureAuthenticated();

  const payload: any = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.targetDate !== undefined) payload.target_date = updates.targetDate;
  if (updates.color !== undefined) payload.color = updates.color;

  const { data, error } = await supabase
    .from('countdowns')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCountdown(id: string) {
  await ensureAuthenticated();

  const { error } = await supabase
    .from('countdowns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// 实时订阅
// =============================================

export function subscribeTodos(callback: () => void) {
  const channel = supabase
    .channel('todos-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'todos' },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeCountdowns(callback: () => void) {
  const channel = supabase
    .channel('countdowns-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'countdowns' },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
