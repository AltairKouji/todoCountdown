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
  timePeriod: 'week' | 'month' | 'all';
  onStartTimer: () => void;
  onDelete: () => void;
  onUpdate: (id: string, updates: { name?: string; weeklyGoalMinutes?: number }) => void;
};

export default function ActivityItem({
  activity,
  weeklyMinutes,
  isTimerRunning,
  timePeriod,
  onStartTimer,
  onDelete,
  onUpdate,
}: ActivityItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activity.name);
  const [editGoal, setEditGoal] = useState(activity.weeklyGoalMinutes.toString());

  // 根据时间周期计算目标值
  const getGoalMinutes = () => {
    if (timePeriod === 'week') return activity.weeklyGoalMinutes;
    if (timePeriod === 'month') return activity.weeklyGoalMinutes * 4; // 一个月约4周
    return 0; // 全部时间不显示目标
  };

  const goalMinutes = getGoalMinutes();
  const progress = goalMinutes > 0 ? Math.min(100, Math.round((weeklyMinutes / goalMinutes) * 100)) : 0;
  const hoursSpent = Math.floor(weeklyMinutes / 60);
  const minutesSpent = weeklyMinutes % 60;
  const hoursGoal = Math.floor(goalMinutes / 60);
  const minutesGoal = goalMinutes % 60;

  const formatTime = (hours: number, minutes: number) => {
    if (hours > 0 && minutes > 0) return `${hours}小时${minutes}分钟`;
    if (hours > 0) return `${hours}小时`;
    return `${minutes}分钟`;
  };

  const handleSave = () => {
    if (!editName.trim()) {
      alert('活动名称不能为空');
      return;
    }
    const goalMinutes = parseInt(editGoal, 10);
    if (isNaN(goalMinutes) || goalMinutes <= 0) {
      alert('请输入有效的目标时长');
      return;
    }
    onUpdate(activity.id, {
      name: editName.trim(),
      weeklyGoalMinutes: goalMinutes,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(activity.name);
    setEditGoal(activity.weeklyGoalMinutes.toString());
    setIsEditing(false);
  };

  if (isEditing) {
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
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            活动名称
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              color: '#64748b',
              marginBottom: 6,
            }}
          >
            周目标（分钟）
          </label>
          <input
            type="number"
            value={editGoal}
            onChange={(e) => setEditGoal(e.target.value)}
            min="1"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              borderRadius: 8,
              backgroundColor: '#0ea5e9',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            保存
          </button>
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 500,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              backgroundColor: 'white',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            取消
          </button>
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              border: 'none',
              borderRadius: 6,
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
          >
            编辑
          </button>
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
      </div>

      <div style={{ marginBottom: 8 }}>
        {timePeriod === 'all' ? (
          // 全部时间：只显示总时长
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: 6,
            }}
          >
            总计：{formatTime(hoursSpent, minutesSpent)}
          </div>
        ) : (
          // 本周/本月：显示目标和进度条
          <>
            <div
              style={{
                fontSize: 14,
                color: '#64748b',
                marginBottom: 6,
              }}
            >
              {formatTime(hoursSpent, minutesSpent)} / {formatTime(hoursGoal, minutesGoal)}
              <span style={{ fontSize: 12, marginLeft: 6, opacity: 0.7 }}>
                ({timePeriod === 'week' ? '本周' : '本月'}目标)
              </span>
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
          </>
        )}
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
