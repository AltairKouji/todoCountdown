import React, { useEffect, useMemo, useState } from "react";
import type { Countdown, RepeatType } from "../../types";
import CountdownItem from "./CountdownItem";
import { getCountdowns, addCountdown, updateCountdown, deleteCountdown, subscribeCountdowns } from "../../supabase";
import { daysLeft, getNextOccurrence } from "../../utils/date";
import { exportToJSON, formatDateForExport } from "../../utils/export";

export default function CountdownSection() {
  const [items, setItems] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState("#0ea5e9");
  const [repeatType, setRepeatType] = useState<RepeatType>("none");

  // 加载 countdowns
  const loadCountdowns = async () => {
    try {
      const data = await getCountdowns();
      // 转换数据库字段名为应用字段名
      const mapped: Countdown[] = data.map(row => ({
        id: row.id,
        title: row.title,
        targetDate: row.target_date,
        color: row.color || undefined,
        repeatType: (row.repeat_type as RepeatType) || 'none',
        createdAt: row.created_at,
      }));
      setItems(mapped);
    } catch (error) {
      console.error('加载 countdowns 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadCountdowns();

    // 订阅实时更新
    const unsubscribe = subscribeCountdowns(() => {
      loadCountdowns();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 自动刷新：每小时刷新一次 + 午夜后立刻再刷新一次
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((x) => x + 1);

    // 每小时刷新一次，保证跨小时时"还有X天"逐步接近变化点
    const hourly = setInterval(bump, 60 * 60 * 1000);

    // 到下一个午夜 00:00:05 自动刷新（加 5 秒缓冲，避免时钟抖动）
    const scheduleMidnight = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 5, 0); // 今天 24:00:05
      const ms = next.getTime() - now.getTime();
      return setTimeout(() => {
        bump();
        midnightTimer = scheduleMidnight(); // 继续排下一个午夜
      }, ms);
    };
    let midnightTimer = scheduleMidnight();

    return () => {
      clearInterval(hourly);
      clearTimeout(midnightTimer);
    };
  }, []);

  const sorted = useMemo(() => {
    if (!items) return [] as Countdown[];
    return [...items].sort(
      (a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );
  }, [items]);

  // 按紧急程度分组
  const grouped = useMemo(() => {
    const expired: Countdown[] = [];
    const today: Countdown[] = [];
    const urgent: Countdown[] = [];   // 1-3天
    const soon: Countdown[] = [];     // 4-7天
    const future: Countdown[] = [];   // 8天+

    sorted.forEach((item) => {
      // 根据重复类型计算实际显示的日期
      const displayDate = getNextOccurrence(item.targetDate, item.repeatType);
      const days = daysLeft(displayDate);

      // 循环事件永远不会过期
      if (days < 0 && (!item.repeatType || item.repeatType === 'none')) {
        expired.push(item);
      } else if (days === 0) {
        today.push(item);
      } else if (days <= 3) {
        urgent.push(item);
      } else if (days <= 7) {
        soon.push(item);
      } else {
        future.push(item);
      }
    });

    return { expired, today, urgent, soon, future };
  }, [sorted]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    try {
      await addCountdown({
        title: title.trim(),
        targetDate: new Date(date).toISOString(),
        color,
        repeatType,
      });
      setTitle("");
      setDate("");
      setRepeatType("none");
      // 立即刷新列表
      await loadCountdowns();
    } catch (error) {
      console.error('添加 countdown 失败:', error);
      alert('添加失败，请重试');
    }
  };

  const remove = async (id: string) => {
    if (confirm("确认删除这个倒数日？")) {
      try {
        await deleteCountdown(id);
        // 立即刷新列表
        await loadCountdowns();
      } catch (error) {
        console.error('删除 countdown 失败:', error);
      }
    }
  };

  const handleUpdate = async (id: string, updates: { title?: string; targetDate?: string }) => {
    try {
      await updateCountdown(id, updates);
      // 立即刷新列表
      await loadCountdowns();
    } catch (error) {
      console.error('更新 countdown 失败:', error);
      alert('更新失败，请重试');
    }
  };

  const handleExport = () => {
    if (items.length === 0) {
      alert('没有数据可导出');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];

    // 导出为JSON
    const jsonData = items.map(item => {
      const displayDate = getNextOccurrence(item.targetDate, item.repeatType);
      const days = daysLeft(displayDate);
      const repeatTypeText = item.repeatType === 'weekly' ? '每周循环' :
                             item.repeatType === 'yearly' ? '每年循环' : '不重复';

      return {
        标题: item.title,
        目标日期: new Date(item.targetDate).toLocaleDateString('zh-CN'),
        重复类型: repeatTypeText,
        剩余天数: days >= 0 ? `${days}天` : `已过期${Math.abs(days)}天`,
        创建时间: formatDateForExport(item.createdAt),
      };
    });

    exportToJSON(jsonData, `倒数日_${timestamp}.json`);
  };

  // 渲染分组标题和列表的辅助函数
  const renderGroup = (title: string, items: Countdown[], emoji: string) => {
    if (items.length === 0) return null;
    return (
      <div key={title} style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#64748b',
          marginBottom: 8,
          paddingLeft: 4,
        }}>
          {emoji} {title} ({items.length})
        </div>
        <ul className="list">
          {items.map((c) => (
            <CountdownItem key={c.id} item={c} onDelete={remove} onUpdate={handleUpdate} />
          ))}
        </ul>
      </div>
    );
  };

  const hasAnyCountdowns = sorted.length > 0;

  return (
    <section className="section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="h2" style={{ margin: 0 }}>倒数日</h2>
        {hasAnyCountdowns && (
          <button
            onClick={handleExport}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              backgroundColor: 'white',
              color: '#64748b',
              cursor: 'pointer',
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
            📥 导出
          </button>
        )}
      </div>
      <form onSubmit={add} className="card">
        <div className="field">
          <input
            className="ui-input"
            placeholder="事件标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="field">
          <input
            className="ui-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}>
            <select
              className="ui-input"
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              style={{ width: '100%' }}
            >
              <option value="none">不重复</option>
              <option value="weekly">每周循环</option>
              <option value="yearly">每年循环</option>
            </select>
          </div>
          <div className="field" style={{ width: 60, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input
              className="ui-input"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              title="颜色"
              style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', cursor: 'pointer' }}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          添加
        </button>
      </form>

      {!hasAnyCountdowns && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#94a3b8',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 15, marginBottom: 4 }}>还没有倒数日</div>
          <div style={{ fontSize: 13 }}>添加一个重要的日子吧 🎯</div>
        </div>
      )}

      {hasAnyCountdowns && (
        <div>
          {renderGroup('就是今天', grouped.today, '🎉')}
          {renderGroup('紧急', grouped.urgent, '🔥')}
          {renderGroup('即将到来', grouped.soon, '⏰')}
          {renderGroup('未来', grouped.future, '📅')}
          {renderGroup('已过期', grouped.expired, '⏸️')}
        </div>
      )}
    </section>
  );
}
