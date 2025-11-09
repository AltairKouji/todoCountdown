# 🚀 部署指南

本指南将帮助您完成从 Supabase 配置到 Vercel 部署的全过程。

## 📋 前置准备

确保您已经有以下账号：
- [Supabase](https://supabase.com) 账号
- [Vercel](https://vercel.com) 账号
- [GitHub](https://github.com) 账号（用于连接 Vercel）

## 第一步：配置 Supabase

### 1.1 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 **New Project**
3. 填写项目信息：
   - **Name**: `todo-countdown`（或您喜欢的名字）
   - **Database Password**: 设置一个强密码（请妥善保存）
   - **Region**: 选择离您最近的区域（如 `Singapore` 或 `Tokyo`）
4. 点击 **Create new project**
5. 等待 2-3 分钟，数据库初始化完成

### 1.2 执行数据库迁移

1. 在项目 Dashboard 左侧菜单中，点击 **SQL Editor**
2. 点击 **New query** 创建新查询
3. 打开项目根目录的 `supabase-schema.sql` 文件
4. 复制全部内容，粘贴到 SQL Editor 中
5. 点击右下角的 **Run** 按钮执行
6. 确认执行成功（应该显示 "Success. No rows returned"）

执行后会创建：
- ✅ `todos` 表（待办事项）
- ✅ `countdowns` 表（倒数日）
- ✅ RLS（Row Level Security）策略
- ✅ 索引和触发器

### 1.3 启用匿名登录

1. 在左侧菜单中，点击 **Authentication**
2. 点击 **Providers** 标签
3. 找到 **Anonymous sign-in** 选项
4. 点击右侧的开关，启用匿名登录
5. 点击 **Save** 保存设置

### 1.4 获取 API 密钥

1. 在左侧菜单中，点击 **Settings** (齿轮图标)
2. 点击 **API**
3. 找到以下信息并复制：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public**: 类似 `eyJhbGciOi...` 的长字符串

**⚠️ 重要提示**：
- `anon public` key 是公开的，可以安全地在前端使用
- 不要泄露 `service_role` key，它拥有管理员权限！

## 第二步：本地测试（可选）

在部署到 Vercel 之前，建议先在本地测试：

1. 克隆项目到本地：
   ```bash
   git clone <your-repo-url>
   cd todoCountdown
   npm install
   ```

2. 创建 `.env.local` 文件：
   ```bash
   cp .env.example .env.local
   ```

3. 编辑 `.env.local`，填入您的 Supabase 凭据：
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

5. 打开浏览器访问 `http://localhost:5173`
6. 测试添加待办事项和倒数日功能
7. 确认数据正常保存到 Supabase（可在 Supabase Dashboard 的 **Table Editor** 中查看）

## 第三步：部署到 Vercel

### 方法 A：通过 Vercel Dashboard（推荐）

#### 1. 导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New** → **Project**
3. 在 **Import Git Repository** 中：
   - 如果是第一次使用，点击 **Install** 安装 Vercel GitHub App
   - 选择您的 GitHub 仓库 `todoCountdown`
4. 点击 **Import**

#### 2. 配置项目

在 **Configure Project** 页面：

1. **Project Name**: 保持默认或自定义（如 `my-todo-app`）
2. **Framework Preset**: 应该自动检测为 **Vite**
3. **Root Directory**: 保持默认 `./`
4. **Build Command**: 保持默认 `npm run build`
5. **Output Directory**: 保持默认 `dist`

#### 3. 添加环境变量

在 **Environment Variables** 部分：

1. 点击 **Add** 添加第一个变量：
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: 粘贴您的 Supabase Project URL
   - 确保勾选 **Production**, **Preview**, **Development**

2. 点击 **Add** 添加第二个变量：
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: 粘贴您的 Supabase anon key
   - 确保勾选 **Production**, **Preview**, **Development**

#### 4. 部署

1. 点击 **Deploy** 按钮
2. 等待构建完成（通常 1-2 分钟）
3. 看到 **🎉 Congratulations!** 表示部署成功
4. 点击 **Visit** 查看您的应用

### 方法 B：通过 Vercel CLI

如果您更喜欢命令行：

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
vercel

# 4. 按照提示操作
# - Set up and deploy? Yes
# - Which scope? 选择您的账号
# - Link to existing project? No
# - What's your project's name? todo-countdown
# - In which directory is your code located? ./

# 5. 添加环境变量
vercel env add VITE_SUPABASE_URL
# 粘贴您的 Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# 粘贴您的 Supabase anon key

# 6. 生产部署
vercel --prod
```

## 第四步：验证部署

1. 访问您的 Vercel 应用 URL（如 `https://my-todo-app.vercel.app`）
2. 测试以下功能：
   - ✅ 添加待办事项
   - ✅ 标记完成/未完成
   - ✅ 删除待办
   - ✅ 添加倒数日
   - ✅ 删除倒数日
3. 在 Supabase Dashboard 的 **Table Editor** 中确认数据已保存
4. 在另一个设备或浏览器中打开相同 URL，确认数据同步

## 🔧 后续配置（可选）

### 自定义域名

1. 在 Vercel Dashboard 中，进入项目页面
2. 点击 **Settings** → **Domains**
3. 输入您的域名（如 `todo.yourdomain.com`）
4. 按照提示配置 DNS 记录
5. 等待 DNS 生效（通常几分钟到几小时）

### 自动部署

Vercel 已经自动配置了 Git 集成：
- 推送到 `main` 分支 → 自动部署到生产环境
- 推送到其他分支 → 自动创建预览部署
- Pull Request → 自动创建预览部署

## 🐛 常见问题

### 问题 1: "Missing Supabase environment variables"

**原因**: 环境变量未正确配置

**解决方案**:
1. 检查 Vercel 项目的 **Settings** → **Environment Variables**
2. 确认 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已添加
3. 确认变量名拼写正确（包括 `VITE_` 前缀）
4. 重新部署：在 **Deployments** 页面点击最新部署旁的三点菜单 → **Redeploy**

### 问题 2: "User not authenticated"

**原因**: 匿名登录未启用

**解决方案**:
1. 在 Supabase Dashboard 中，进入 **Authentication** → **Providers**
2. 启用 **Anonymous sign-in**
3. 刷新应用页面

### 问题 3: 数据无法保存

**原因**: RLS 策略未正确配置

**解决方案**:
1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 重新执行 `supabase-schema.sql` 中的所有 SQL
3. 在 **Table Editor** 中检查 `todos` 和 `countdowns` 表是否存在

### 问题 4: 构建失败

**原因**: 依赖安装问题

**解决方案**:
1. 在 Vercel 部署日志中查看具体错误
2. 确认 `package.json` 和 `package-lock.json` 已提交到 Git
3. 尝试在本地运行 `npm run build` 确认能否成功构建

### 问题 5: CORS 错误

**原因**: Supabase 项目配置问题（很少见）

**解决方案**:
1. Supabase 默认允许所有域名访问，一般不会有 CORS 问题
2. 如果确实遇到，在 Supabase Dashboard → **Settings** → **API** 中检查 CORS 配置

## 📊 监控与维护

### Supabase

1. **数据库监控**:
   - Dashboard → **Database** → **Reports**
   - 查看数据库大小、查询性能等

2. **用户统计**:
   - Dashboard → **Authentication** → **Users**
   - 查看匿名用户数量

### Vercel

1. **访问统计**:
   - Project → **Analytics**
   - 查看访问量、地理分布等

2. **部署历史**:
   - Project → **Deployments**
   - 查看所有部署记录，可以回滚到任意版本

## 🎉 完成！

恭喜！您的应用已成功部署。现在您可以：
- 🌐 通过 Vercel URL 访问应用
- 📱 将其添加到手机主屏幕（PWA）
- 🔄 在多个设备间同步数据
- 📝 开始管理您的待办事项和倒数日！

---

如有问题，欢迎提交 Issue 或 Pull Request！
