// File: src/sw-update.tsx
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA Service Worker registered');
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        backgroundColor: '#0ea5e9',
        color: 'white',
        padding: '16px 20px',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        maxWidth: 320,
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        🎉 发现新版本
      </div>
      <div style={{ fontSize: 13, opacity: 0.95, marginBottom: 12 }}>
        应用已更新，点击刷新使用新功能
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleUpdate}
          style={{
            flex: 1,
            backgroundColor: 'white',
            color: '#0ea5e9',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          立即更新
        </button>
        <button
          onClick={handleClose}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          稍后
        </button>
      </div>
    </div>
  );
}
