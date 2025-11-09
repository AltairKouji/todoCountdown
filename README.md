# 🌤️ 清爽待办 & 倒数日

一个简洁优雅的 PWA 应用，支持待办事项管理和倒数日记录。数据存储在 Supabase 云端，支持跨设备同步。

## ✨ 功能特性

- 📝 **待办事项管理**
  - 添加、编辑、删除待办事项
  - 设置截止时间和备注
  - 自动排序（未完成优先，按截止时间排序）
  - 完成状态切换

- ⏰ **倒数日记录**
  - 添加重要事件倒数日
  - 自定义颜色标记
  - 自动计算剩余天数
  - 午夜自动刷新

- 🔄 **云端同步**
  - 数据存储在 Supabase PostgreSQL
  - 支持跨设备访问
  - 实时数据同步
  - 自动匿名登录

- 📱 **PWA 支持**
  - 可安装到桌面/主屏幕
  - 离线访问支持（Service Worker）
  - 响应式设计

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **数据库**: Supabase (PostgreSQL)
- **PWA**: vite-plugin-pwa + Workbox
- **部署**: Vercel

## 📦 安装与开发

### 前置要求

- Node.js 16+
- Supabase 账号

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd todoCountdown
npm install
```

### 2. 配置 Supabase

#### 2.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 等待数据库初始化完成

#### 2.2 执行数据库迁移

1. 打开 Supabase Dashboard
2. 进入 `SQL Editor`
3. 执行 `supabase-schema.sql` 文件中的 SQL 脚本

这会创建以下内容：
- `todos` 表（待办事项）
- `countdowns` 表（倒数日）
- Row Level Security (RLS) 策略
- 索引和触发器

#### 2.3 启用匿名登录

1. 在 Supabase Dashboard 中，进入 `Authentication` → `Providers`
2. 启用 `Anonymous sign-in`

#### 2.4 获取 API 密钥

1. 在 Supabase Dashboard 中，进入 `Settings` → `API`
2. 复制以下信息：
   - `Project URL`
   - `anon public` key

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入您的 Supabase 凭据：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

## 🏗️ 构建与部署

### 本地构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 部署到 Vercel

#### 方法 1: 通过 Vercel Dashboard

1. 访问 [Vercel](https://vercel.com)
2. 导入您的 Git 仓库
3. 在 `Environment Variables` 中添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 点击 `Deploy`

#### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 设置环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 生产环境部署
vercel --prod
```

## 📁 项目结构

```
todoCountdown/
├── src/
│   ├── components/
│   │   ├── Todo/
│   │   │   ├── TodoSection.tsx      # 待办区域组件
│   │   │   └── TodoItem.tsx         # 待办项组件
│   │   └── Countdown/
│   │       ├── CountdownSection.tsx # 倒数日区域组件
│   │       └── CountdownItem.tsx    # 倒数日项组件
│   ├── utils/
│   │   └── date.ts                  # 日期工具函数
│   ├── App.tsx                      # 主应用组件
│   ├── main.tsx                     # 应用入口
│   ├── types.ts                     # TypeScript 类型定义
│   ├── supabase.ts                  # Supabase 客户端和工具函数
│   ├── supabase-types.ts            # Supabase 数据库类型
│   └── styles.css                   # 全局样式
├── public/                          # 静态资源
├── supabase-schema.sql              # 数据库迁移脚本
├── .env.example                     # 环境变量示例
├── vite.config.ts                   # Vite 配置
└── package.json                     # 项目依赖
```

## 🔐 安全说明

- 使用匿名登录，每个设备会自动创建独立的匿名用户
- 数据通过 Row Level Security (RLS) 隔离，用户只能访问自己的数据
- 所有 API 请求通过 HTTPS 加密
- `anon` key 是公开的，可以安全地在前端使用

## 🔄 从 IndexedDB 迁移

如果您之前使用的是 IndexedDB 版本，迁移步骤如下：

1. 在浏览器开发者工具中导出现有数据
2. 通过 Supabase Dashboard 的 `Table Editor` 手动导入
3. 或者编写迁移脚本（可以参考 `src/db.ts` 中的旧数据结构）

## 🛠️ 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## 📝 License

MIT

---

**Enjoy! 🎉**
