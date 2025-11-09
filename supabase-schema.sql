-- =============================================
-- Supabase 数据库迁移脚本
-- 用于 Todo & Countdown 应用
-- =============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. 创建 todos 表
-- =============================================
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  is_done BOOLEAN DEFAULT false,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 todos 创建索引
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_is_done ON public.todos(is_done);

-- =============================================
-- 2. 创建 countdowns 表
-- =============================================
CREATE TABLE IF NOT EXISTS public.countdowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  color TEXT DEFAULT '#0ea5e9',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 countdowns 创建索引
CREATE INDEX IF NOT EXISTS idx_countdowns_user_id ON public.countdowns(user_id);
CREATE INDEX IF NOT EXISTS idx_countdowns_target_date ON public.countdowns(target_date);

-- =============================================
-- 3. 启用 Row Level Security (RLS)
-- =============================================
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. 创建 RLS 策略 - Todos
-- =============================================

-- 允许用户查看自己的 todos
CREATE POLICY "Users can view own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

-- 允许用户插入自己的 todos
CREATE POLICY "Users can insert own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的 todos
CREATE POLICY "Users can update own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的 todos
CREATE POLICY "Users can delete own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 5. 创建 RLS 策略 - Countdowns
-- =============================================

-- 允许用户查看自己的 countdowns
CREATE POLICY "Users can view own countdowns"
  ON public.countdowns FOR SELECT
  USING (auth.uid() = user_id);

-- 允许用户插入自己的 countdowns
CREATE POLICY "Users can insert own countdowns"
  ON public.countdowns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的 countdowns
CREATE POLICY "Users can update own countdowns"
  ON public.countdowns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的 countdowns
CREATE POLICY "Users can delete own countdowns"
  ON public.countdowns FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 6. 创建自动更新 updated_at 的触发器
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 完成！
-- =============================================
-- 请在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 执行后，您的数据库将准备好用于应用
