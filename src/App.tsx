// File: src/App.tsx
import React, { useEffect, useState } from "react";
import "./styles.css";
import TodoSection from "./components/Todo/TodoSection";
import CountdownSection from "./components/Countdown/CountdownSection";
import { ensureAuthenticated } from "./supabase";

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // 确保用户已登录（自动匿名登录）
    ensureAuthenticated()
      .then(() => {
        setIsAuthReady(true);
      })
      .catch((error) => {
        console.error('认证失败:', error);
        // 即使认证失败也显示界面，让用户看到错误信息
        setIsAuthReady(true);
      });
  }, []);

  if (!isAuthReady) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🌤️ 加载中...</div>
          <div className="subtle">正在连接到云端数据库</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <div style={{ fontSize: 28 }}>🌤️ 清爽待办 & 倒数日</div>
        <div className="subtle" style={{ fontSize: 12 }}>云端同步 · 跨设备访问 · 无广告</div>
      </header>

      <TodoSection />
      <CountdownSection />

      <footer className="meta">架构: React · Vite · Supabase · PWA</footer>
    </main>
  );
}
