import React, { useState, useEffect, useMemo } from 'react';
import ActivityItem from './ActivityItem';
import {
  getActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  getTimeEntries,
  addTimeEntry,
  subscribeActivities,
  subscribeTimeEntries,
} from '../../supabase';

type Activity = {
  id: string;
  name: string;
  emoji?: string;
  weekly_goal_minutes: number;
  color?: string;
  created_at: string;
};

type TimeEntry = {
  id: string;
  activity_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  date: string;
  created_at: string;
};

type TimerState = {
  activityId: string;
  activityName: string;
  startTime: string; // ISO
  elapsedSeconds: number;
};

type TimePeriod = 'week' | 'month' | 'all';

export default function TimeTrackingSection() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  // 计时器状态
  const [timerState, setTimerState] = useState<TimerState | null>(() => {
    const saved = localStorage.getItem('activeTimer');
    if (saved) {
      const parsed = JSON.parse(saved);
      // 计算已经过去的时间
      const startTime = new Date(parsed.startTime);
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      return { ...parsed, elapsedSeconds };
    }
    return null;
  });

  // 添加活动表单
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityEmoji, setNewActivityEmoji] = useState('⏱️');
  const [newActivityGoal, setNewActivityGoal] = useState('180'); // 默认3小时
  const [newActivityColor, setNewActivityColor] = useState('#0ea5e9');

  // 快速记录表单
  const [quickRecordActivity, setQuickRecordActivity] = useState('');
  const [quickRecordMinutes, setQuickRecordMinutes] = useState('30');

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 订阅实时更新
  useEffect(() => {
    const unsubActivities = subscribeActivities(() => {
      loadActivities();
    });
    const unsubEntries = subscribeTimeEntries(() => {
      loadTimeEntries();
    });

    return () => {
      unsubActivities();
      unsubEntries();
    };
  }, []);

  // 时间周期变化时重新加载数据
  useEffect(() => {
    if (!loading) {
      loadTimeEntries();
    }
  }, [timePeriod]);

  // 计时器更新
  useEffect(() => {
    if (!timerState) return;

    const interval = setInterval(() => {
      setTimerState((prev) => {
        if (!prev) return null;
        return { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState]);

  // 保存计时器状态到 localStorage
  useEffect(() => {
    if (timerState) {
      localStorage.setItem('activeTimer', JSON.stringify(timerState));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [timerState]);

  // 关闭页面提醒
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timerState) {
        e.preventDefault();
        e.returnValue = '计时器正在运行，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timerState]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadActivities(), loadTimeEntries()]);
    setLoading(false);
  };

  const loadActivities = async () => {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error('加载活动失败:', error);
    }
  };

  const loadTimeEntries = async () => {
    try {
      // 根据时间周期获取时间记录
      let startDate: string | undefined;
      if (timePeriod === 'week') {
        startDate = getWeekStart();
      } else if (timePeriod === 'month') {
        startDate = getMonthStart();
      }
      // timePeriod === 'all' 时 startDate 为 undefined，获取所有记录
      const data = await getTimeEntries(undefined, startDate);
      setTimeEntries(data);
    } catch (error) {
      console.error('加载时间记录失败:', error);
    }
  };

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 周一
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  };

  const getMonthStart = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    return firstDay.toISOString().split('T')[0];
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim()) return;

    try {
      await addActivity({
        name: newActivityName.trim(),
        emoji: newActivityEmoji,
        weeklyGoalMinutes: parseInt(newActivityGoal, 10),
        color: newActivityColor,
      });
      setNewActivityName('');
      setNewActivityEmoji('⏱️');
      setNewActivityGoal('180');
      setNewActivityColor('#0ea5e9');
      setShowAddForm(false);
      // 立即刷新活动列表
      await loadActivities();
    } catch (error) {
      console.error('添加活动失败:', error);
      alert('添加失败，请重试');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('确定要删除此活动吗？相关的时间记录也将被删除。')) return;

    try {
      await deleteActivity(id);
      // 立即刷新活动列表和时间记录
      await Promise.all([loadActivities(), loadTimeEntries()]);
    } catch (error) {
      console.error('删除活动失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleUpdateActivity = async (id: string, updates: { name?: string; weeklyGoalMinutes?: number }) => {
    try {
      await updateActivity(id, updates);
      // 立即刷新活动列表
      await loadActivities();
    } catch (error) {
      console.error('更新活动失败:', error);
      alert('更新失败，请重试');
    }
  };

  const handleStartTimer = (activity: Activity) => {
    if (timerState) {
      alert('已有一个计时器在运行中，请先结束当前计时');
      return;
    }

    setTimerState({
      activityId: activity.id,
      activityName: activity.name,
      startTime: new Date().toISOString(),
      elapsedSeconds: 0,
    });
  };

  const handleStopTimer = async () => {
    if (!timerState) return;

    const endTime = new Date();
    const startTime = new Date(timerState.startTime);
    const durationMinutes = Math.max(1, Math.floor(timerState.elapsedSeconds / 60)); // 至少1分钟

    try {
      await addTimeEntry({
        activityId: timerState.activityId,
        startTime: timerState.startTime,
        endTime: endTime.toISOString(),
        durationMinutes,
        date: endTime.toISOString().split('T')[0],
      });

      setTimerState(null);
      // 立即刷新时间记录
      await loadTimeEntries();
      alert(`计时结束！已记录 ${durationMinutes} 分钟`);
    } catch (error) {
      console.error('保存时间记录失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleQuickRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRecordActivity || !quickRecordMinutes) return;

    const minutes = parseInt(quickRecordMinutes, 10);
    if (minutes <= 0) {
      alert('请输入有效的时长');
      return;
    }

    const now = new Date();
    const startTime = new Date(now.getTime() - minutes * 60 * 1000);

    try {
      await addTimeEntry({
        activityId: quickRecordActivity,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        durationMinutes: minutes,
        date: now.toISOString().split('T')[0],
      });

      setQuickRecordMinutes('30');
      // 立即刷新时间记录
      await loadTimeEntries();
      alert(`已记录 ${minutes} 分钟`);
    } catch (error) {
      console.error('快速记录失败:', error);
      alert('记录失败，请重试');
    }
  };

  // 计算每个活动本周的总时长
  const weeklyMinutesByActivity = useMemo(() => {
    const result: Record<string, number> = {};
    timeEntries.forEach((entry) => {
      if (!result[entry.activity_id]) {
        result[entry.activity_id] = 0;
      }
      result[entry.activity_id] += entry.duration_minutes;
    });
    return result;
  }, [timeEntries]);

  const formatTimerDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: '0 4px' }}>
      {/* 当前计时器 */}
      {timerState && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            borderRadius: 12,
            padding: '16px',
            marginBottom: 20,
            border: '2px solid #fbbf24',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#92400e',
              marginBottom: 8,
            }}
          >
            ⏱️ {timerState.activityName} - 计时中
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#b45309',
              marginBottom: 12,
              fontFamily: 'monospace',
            }}
          >
            {formatTimerDisplay(timerState.elapsedSeconds)}
          </div>
          <button
            onClick={handleStopTimer}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              borderRadius: 8,
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            ■ 结束并保存
          </button>
        </div>
      )}

      {/* 时间周期选择器 */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>
          📊 活动统计
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setTimePeriod('week')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: timePeriod === 'week' ? '#0ea5e9' : '#f1f5f9',
              color: timePeriod === 'week' ? 'white' : '#64748b',
            }}
          >
            本周
          </button>
          <button
            onClick={() => setTimePeriod('month')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: timePeriod === 'month' ? '#0ea5e9' : '#f1f5f9',
              color: timePeriod === 'month' ? 'white' : '#64748b',
            }}
          >
            本月
          </button>
          <button
            onClick={() => setTimePeriod('all')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: timePeriod === 'all' ? '#0ea5e9' : '#f1f5f9',
              color: timePeriod === 'all' ? 'white' : '#64748b',
            }}
          >
            全部时间
          </button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            padding: '32px 16px',
            textAlign: 'center',
            color: '#64748b',
            marginBottom: 20,
          }}
        >
          还没有任何活动，点击下方按钮添加第一个活动吧！
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={{
                id: activity.id,
                name: activity.name,
                emoji: activity.emoji,
                weeklyGoalMinutes: activity.weekly_goal_minutes,
                color: activity.color,
              }}
              weeklyMinutes={weeklyMinutesByActivity[activity.id] || 0}
              isTimerRunning={timerState?.activityId === activity.id}
              onStartTimer={() => handleStartTimer(activity)}
              onDelete={() => handleDeleteActivity(activity.id)}
              onUpdate={handleUpdateActivity}
            />
          ))}
        </div>
      )}

      {/* 添加活动按钮 */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 500,
            border: '2px dashed #cbd5e1',
            borderRadius: 12,
            backgroundColor: 'transparent',
            color: '#64748b',
            cursor: 'pointer',
            marginBottom: 20,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0ea5e9';
            e.currentTarget.style.color = '#0ea5e9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          + 添加新活动
        </button>
      )}

      {/* 添加活动表单 */}
      {showAddForm && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: '16px',
            marginBottom: 20,
            border: '1px solid #e2e8f0',
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>
            添加新活动
          </h4>
          <form onSubmit={handleAddActivity}>
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
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="例如：阅读、练钢琴"
                required
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
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#64748b',
                    marginBottom: 6,
                  }}
                >
                  图标
                </label>
                <input
                  type="text"
                  value={newActivityEmoji}
                  onChange={(e) => setNewActivityEmoji(e.target.value)}
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
              <div style={{ flex: 1 }}>
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
                  value={newActivityGoal}
                  onChange={(e) => setNewActivityGoal(e.target.value)}
                  min="1"
                  required
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
                颜色
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'].map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewActivityColor(color)}
                      style={{
                        width: 32,
                        height: 32,
                        border: newActivityColor === color ? '3px solid #0f172a' : 'none',
                        borderRadius: 8,
                        backgroundColor: color,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                  )
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
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
                添加
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
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
          </form>
        </div>
      )}

      {/* 快速记录 */}
      {activities.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#0f172a' }}>
            ⚡ 快速记录
          </h4>
          <form onSubmit={handleQuickRecord}>
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  color: '#64748b',
                  marginBottom: 6,
                }}
              >
                选择活动
              </label>
              <select
                value={quickRecordActivity}
                onChange={(e) => setQuickRecordActivity(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  outline: 'none',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">请选择...</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.emoji} {activity.name}
                  </option>
                ))}
              </select>
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
                时长（分钟）
              </label>
              <input
                type="number"
                value={quickRecordMinutes}
                onChange={(e) => setQuickRecordMinutes(e.target.value)}
                min="1"
                required
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
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                borderRadius: 8,
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              记录
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
