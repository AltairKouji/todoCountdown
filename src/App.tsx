// File: src/App.tsx
import React, { useEffect, useState } from "react";
import "./styles.css";
import TodoSection from "./components/Todo/TodoSection";
import CountdownSection from "./components/Countdown/CountdownSection";
import LoginForm from "./components/Auth/LoginForm";
import PWAUpdatePrompt from "./sw-update";
import { supabase, getCurrentUser } from "./supabase";

type TabType = 'todo' | 'countdown';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // 从 localStorage 读取上次选择的 tab
    const saved = localStorage.getItem('activeTab');
    return (saved === 'todo' || saved === 'countdown') ? saved : 'todo';
  });

  // 检查登录状态
  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  // 切换 tab 并保存到 localStorage
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
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
      <>
        <main className="container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>🌤️ 加载中...</div>
            <div className="subtle">正在连接到云端数据库</div>
          </div>
        </main>
        <PWAUpdatePrompt />
      </>
    );
  }

  // 未登录：显示登录表单
  if (!user) {
    return (
      <>
        <LoginForm onLoginSuccess={checkUser} />
        <PWAUpdatePrompt />
      </>
    );
  }

  // 已登录：显示主应用
  return (
    <>
      <main className="container">
        <header style={{ position: 'relative', textAlign: 'center', marginBottom: 20, paddingTop: 8 }}>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              fontSize: 13,
              padding: '6px 12px'
            }}
          >
            退出
          </button>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🌤️ 清爽待办 & 倒数日</div>
          <div className="subtle" style={{ fontSize: 12 }}>云端同步 · 跨设备访问</div>
        </header>

        {/* 选项卡导航 */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          padding: '0 4px',
        }}>
          <button
            onClick={() => handleTabChange('todo')}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'todo' ? '#0ea5e9' : '#f1f5f9',
              color: activeTab === 'todo' ? 'white' : '#64748b',
            }}
          >
            ✓ 待办事项
          </button>
          <button
            onClick={() => handleTabChange('countdown')}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'countdown' ? '#0ea5e9' : '#f1f5f9',
              color: activeTab === 'countdown' ? 'white' : '#64748b',
            }}
          >
            ⏰ 倒数日
          </button>
        </div>

        {/* 内容区域 - 带淡入动画 */}
        <div style={{
          animation: 'fadeIn 0.3s ease-in-out',
        }}>
          <style>
            {`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          {activeTab === 'todo' && <TodoSection />}
          {activeTab === 'countdown' && <CountdownSection />}
        </div>

        <footer className="meta">
          已登录: {user.user_metadata?.display_name || user.email?.split('@')[0]} · React · Vite · Supabase
        </footer>
      </main>
      <PWAUpdatePrompt />
    </>
  );
}
