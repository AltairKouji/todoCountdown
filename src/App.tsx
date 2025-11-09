// File: src/App.tsx
import React, { useEffect, useState } from "react";
import "./styles.css";
import TodoSection from "./components/Todo/TodoSection";
import CountdownSection from "./components/Countdown/CountdownSection";
import LoginForm from "./components/Auth/LoginForm";
import { supabase, getCurrentUser } from "./supabase";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 检查登录状态
  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  useEffect(() => {
    checkUser();

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 登出
  const handleLogout = async () => {
    if (confirm("确认退出登录？")) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🌤️ 加载中...</div>
          <div className="subtle">正在连接到云端数据库</div>
        </div>
      </main>
    );
  }

  // 未登录：显示登录表单
  if (!user) {
    return <LoginForm onLoginSuccess={checkUser} />;
  }

  // 已登录：显示主应用
  return (
    <main className="container">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 28 }}>🌤️ 清爽待办 & 倒数日</div>
            <div className="subtle" style={{ fontSize: 12 }}>云端同步 · 跨设备访问</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn"
            style={{ fontSize: 14 }}
          >
            退出登录
          </button>
        </div>
      </header>

      <TodoSection />
      <CountdownSection />

      <footer className="meta">
        已登录: {user.email?.split('@')[0]} · React · Vite · Supabase
      </footer>
    </main>
  );
}
