-- =============================================
-- 数据库迁移：添加倒数日循环功能
-- =============================================
-- 请在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- 1. 添加 repeat_type 字段到 countdowns 表
ALTER TABLE public.countdowns
ADD COLUMN IF NOT EXISTS repeat_type TEXT DEFAULT 'none' CHECK (repeat_type IN ('none', 'weekly', 'yearly'));

-- 2. 为现有数据设置默认值
UPDATE public.countdowns
SET repeat_type = 'none'
WHERE repeat_type IS NULL;

-- 3. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_countdowns_repeat_type ON public.countdowns(repeat_type);

-- 完成！
-- 现在你可以创建循环倒数日了：
-- - 'none': 一次性倒数日
-- - 'weekly': 每周循环（如每周六）
-- - 'yearly': 每年循环（如每年新年）
