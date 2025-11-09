# 📝 如何在 Supabase 中创建用户

由于本应用限定家人朋友使用，无需公开注册系统。您可以直接在 Supabase Dashboard 中手动创建用户账号。

## 🔧 步骤一：关闭匿名登录（重要）

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 左侧菜单点击 **Authentication** → **Providers**
4. 找到 **Anonymous sign-in**
5. **关闭**匿名登录开关
6. 点击 **Save**

## 👥 步骤二：创建用户账号

### 方式 A：通过 Dashboard 界面创建（推荐）

1. 在 Supabase Dashboard 左侧菜单点击 **Authentication** → **Users**
2. 点击右上角 **Add user** 按钮
3. 选择 **Create new user**
4. 填写信息：
   - **Email**: 填写一个"虚拟邮箱"作为用户名
     - 示例：`dad@family.local`、`mom@family.local`、`son@family.local`
     - 或使用真实邮箱也可以
   - **Password**: 设置密码（至少 6 位）
   - **Auto Confirm User**: ✅ **勾选此项**（非常重要！）
5. 点击 **Create user**

### 方式 B：通过 SQL 批量创建

如果需要创建多个用户，可以在 **SQL Editor** 中执行：

```sql
-- 创建用户函数（需要管理员权限）
-- 注意：这需要在 Supabase SQL Editor 中以管理员身份执行

-- 创建用户 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'dad@family.local',  -- 用户名（邮箱格式）
  crypt('password123', gen_salt('bf')),  -- 密码
  NOW(),  -- 自动确认
  NOW(),
  NOW(),
  '',
  ''
);

-- 创建用户 2
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'mom@family.local',  -- 用户名（邮箱格式）
  crypt('password456', gen_salt('bf')),  -- 密码
  NOW(),
  NOW(),
  NOW(),
  '',
  ''
);
```

**注意**：上面的 SQL 方法比较复杂，**推荐使用方式 A（Dashboard 界面）**。

## 📱 步骤三：用户登录

创建用户后，用户可以使用以下信息登录应用：

- **用户名**：填写创建时的邮箱（如 `dad@family.local`）
- **密码**：填写创建时设置的密码

## 💡 用户名显示

登录后，应用底部会显示：`已登录: dad`（自动从邮箱中提取 `@` 前面的部分）

如果您想显示更友好的名字（比如"爸爸"、"妈妈"），可以：
1. 将邮箱设为 `papa@family.local`、`mama@family.local`
2. 或后续我可以帮您添加一个"用户资料"表来存储真实姓名

## 🔐 修改密码

如果需要修改用户密码：

1. 在 Supabase Dashboard → **Authentication** → **Users**
2. 找到对应用户，点击进入详情
3. 点击 **Reset Password** 或直接编辑
4. 设置新密码
5. 保存

## 📋 推荐的用户命名规则

为了便于识别，建议使用统一的邮箱格式：

```
dad@family.local      -> 爸爸
mom@family.local      -> 妈妈
brother@family.local  -> 哥哥
sister@family.local   -> 姐姐
grandpa@family.local  -> 爷爷
```

或者使用真实姓名拼音：
```
zhangsan@family.local  -> 张三
lisi@family.local      -> 李四
```

## ✅ 创建完成

创建用户后：
1. 部署最新代码到 Vercel
2. 打开应用会看到登录界面
3. 使用创建的用户名和密码登录
4. 登录成功后即可使用！

---

**提示**：每个用户的数据是完全隔离的，张三看不到李四的待办事项，反之亦然。
