# 📦 GitHub Pages 自动部署设置指南

由于 Vercel 在国内访问受限，本指南将帮助你配置 GitHub Pages 自动部署。

## 🚀 第一步：在 GitHub 仓库中设置 Secrets

1. 打开你的 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret** 添加以下两个密钥：

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: 你的 Supabase 项目 URL（从 Vercel 环境变量复制）

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: 你的 Supabase Anon Key（从 Vercel 环境变量复制）

## 📄 第二步：启用 GitHub Pages

1. 在仓库页面，点击 **Settings** → **Pages**
2. 在 **Source** 部分，选择：
   - Source: **GitHub Actions**（不是 Deploy from a branch）
3. 保存设置

## 🔧 第三步：推送代码触发部署

1. 确保所有更改已提交并推送到 main/master 分支
2. GitHub Actions 会自动开始构建和部署
3. 查看部署状态：
   - 仓库页面 → **Actions** 标签
   - 等待 "Deploy to GitHub Pages" workflow 完成

## ✅ 第四步：执行数据库迁移

**重要**：新功能需要数据库更新！

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目 → **SQL Editor**
3. 复制并执行 `supabase-migration-repeat.sql` 中的 SQL：

```sql
-- 添加 repeat_type 字段到 countdowns 表
ALTER TABLE public.countdowns
ADD COLUMN IF NOT EXISTS repeat_type TEXT DEFAULT 'none' CHECK (repeat_type IN ('none', 'weekly', 'yearly'));

-- 为现有数据设置默认值
UPDATE public.countdowns
SET repeat_type = 'none'
WHERE repeat_type IS NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_countdowns_repeat_type ON public.countdowns(repeat_type);
```

4. 点击 **Run** 执行

## 🌐 第五步：访问你的应用

部署完成后，访问地址通常是：
```
https://你的GitHub用户名.github.io/todoCountdown/
```

例如：`https://AltairKouji.github.io/todoCountdown/`

## 🔄 后续更新

每次推送代码到 main/master 分支，GitHub Actions 会自动：
1. 构建最新代码
2. 部署到 GitHub Pages
3. 通常 1-2 分钟后生效

## 🐛 故障排查

### 如果部署失败：

1. **检查 Actions 日志**：
   - 仓库页面 → Actions 标签
   - 点击失败的 workflow 查看错误

2. **检查 Secrets 是否正确**：
   - Settings → Secrets and variables → Actions
   - 确认 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已设置

3. **检查 Pages 设置**：
   - Settings → Pages
   - Source 必须是 "GitHub Actions"

### 如果页面打不开：

1. 确认 GitHub Pages URL 正确
2. 等待 5-10 分钟（DNS 传播）
3. 清除浏览器缓存

## 📝 注意事项

- ✅ 国内可以访问 GitHub Pages
- ✅ 每次 push 自动部署
- ✅ 免费无限流量
- ⚠️ 首次设置需要配置 Secrets
- ⚠️ 部署需要 1-2 分钟

---

**完成后，你的家人就可以通过 GitHub Pages 访问最新版本的应用了！** 🎉
