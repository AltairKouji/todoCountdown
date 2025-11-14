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
-- 7. 创建 activities 表（时间追踪）
-- =============================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '⏱️',
  weekly_goal_minutes INTEGER NOT NULL DEFAULT 180,
  color TEXT DEFAULT '#0ea5e9',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 activities 创建索引
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at);

-- =============================================
-- 8. 创建 time_entries 表（时间记录）
-- =============================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 time_entries 创建索引
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_activity_id ON public.time_entries(activity_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON public.time_entries(created_at DESC);

-- =============================================
-- 9. 启用 Row Level Security (RLS) - 时间追踪表
-- =============================================
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 10. 创建 RLS 策略 - Activities
-- =============================================

-- 允许用户查看自己的 activities
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  USING (auth.uid() = user_id);

-- 允许用户插入自己的 activities
CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的 activities
CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的 activities
CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 11. 创建 RLS 策略 - Time Entries
-- =============================================

-- 允许用户查看自己的 time entries
CREATE POLICY "Users can view own time_entries"
  ON public.time_entries FOR SELECT
  USING (auth.uid() = user_id);

-- 允许用户插入自己的 time entries
CREATE POLICY "Users can insert own time_entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的 time entries
CREATE POLICY "Users can update own time_entries"
  ON public.time_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的 time entries
CREATE POLICY "Users can delete own time_entries"
  ON public.time_entries FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 完成！
-- =============================================
-- 请在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 执行后，您的数据库将准备好用于应用
