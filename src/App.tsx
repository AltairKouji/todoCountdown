// File: src/App.tsx
import React from "react";
import "./styles.css";
import TodoSection from "./components/Todo/TodoSection";
import CountdownSection from "./components/Countdown/CountdownSection";

export default function App() {
  return (
    <main className="container">
      <header className="header">
        <div style={{ fontSize: 28 }}>🌤️ 清爽待办 & 倒数日</div>
        <div className="subtle" style={{ fontSize: 12 }}>离线可用 · 本地存储 · 无广告</div>
      </header>

      <TodoSection />
      <CountdownSection />

      <footer className="meta">架构: React · Vite · vite-plugin-pwa · IndexedDB</footer>
    </main>
  );
}
