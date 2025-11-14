import React, { useState, useEffect } from 'react';

type ActivityItemProps = {
  activity: {
    id: string;
    name: string;
    emoji?: string;
    weeklyGoalMinutes: number;
    color?: string;
  };
  weeklyMinutes: number;
  isTimerRunning: boolean;
  onStartTimer: () => void;
  onDelete: () => void;
};

export default function ActivityItem({
  activity,
  weeklyMinutes,
  isTimerRunning,
  onStartTimer,
  onDelete,
}: ActivityItemProps) {
  const progress = Math.min(100, Math.round((weeklyMinutes / activity.weeklyGoalMinutes) * 100));
  const hoursSpent = Math.floor(weeklyMinutes / 60);
  const minutesSpent = weeklyMinutes % 60;
  const hoursGoal = Math.floor(activity.weeklyGoalMinutes / 60);
  const minutesGoal = activity.weeklyGoalMinutes % 60;

  const formatTime = (hours: number, minutes: number) => {
    if (hours > 0 && minutes > 0) return `${hours}小时${minutes}分钟`;
    if (hours > 0) return `${hours}小时`;
    return `${minutes}分钟`;
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: '16px',
        marginBottom: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>{activity.emoji || '⏱️'}</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{activity.name}</span>
          {isTimerRunning && (
            <span
              style={{
                fontSize: 12,
                color: '#ef4444',
                fontWeight: 500,
                animation: 'pulse 2s infinite',
              }}
            >
              计时中...
            </span>
          )}
        </div>
        <button
          onClick={onDelete}
          style={{
            padding: '4px 8px',
            fontSize: 12,
            border: 'none',
            borderRadius: 6,
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
          }}
        >
          删除
        </button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 14,
            color: '#64748b',
            marginBottom: 6,
          }}
        >
          {formatTime(hoursSpent, minutesSpent)} / {formatTime(hoursGoal, minutesGoal)}
        </div>
        <div
          style={{
            width: '100%',
            height: 8,
            backgroundColor: '#f1f5f9',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: activity.color || '#0ea5e9',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#94a3b8',
            marginTop: 4,
            textAlign: 'right',
          }}
        >
          {progress}%
        </div>
      </div>

      <button
        onClick={onStartTimer}
        disabled={isTimerRunning}
        style={{
          width: '100%',
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 500,
          border: 'none',
          borderRadius: 8,
          backgroundColor: isTimerRunning ? '#e2e8f0' : activity.color || '#0ea5e9',
          color: isTimerRunning ? '#94a3b8' : 'white',
          cursor: isTimerRunning ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isTimerRunning) {
            e.currentTarget.style.opacity = '0.9';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        {isTimerRunning ? '计时中...' : '▶ 开始计时'}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
