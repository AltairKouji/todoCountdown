// src/main.tsx —— 注册 SW & 渲染 App
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js'); // 由构建产物提供
  });
}

createRoot(document.getElementById('root')!).render(<App />);