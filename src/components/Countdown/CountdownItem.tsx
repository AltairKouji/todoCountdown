// File: src/components/Countdown/CountdownItem.tsx
import React from "react";
import type { Countdown } from "../../types";
import { daysLeft } from "../../utils/date";

type Props = { item: Countdown; onDelete: (id: string) => void; };
const label = (iso: string) => { const d = daysLeft(iso); if (d > 0) return `还有 ${d} 天`; if (d === 0) return "就是今天！"; return `已经过去 ${Math.abs(d)} 天`; };

// 根据剩余天数获取样式
const getItemStyle = (targetDate: string) => {
  const days = daysLeft(targetDate);

  // 已过期：灰色淡化
  if (days < 0) {
    return {
      backgroundColor: '#f8fafc',
      borderLeft: '4px solid #cbd5e1',
      opacity: 0.7,
    };
  }

  // 今天：特殊高亮
  if (days === 0) {
    return {
      backgroundColor: '#fef3c7',
      borderLeft: '4px solid #f59e0b',
      boxShadow: '0 0 0 1px #fbbf24 inset',
    };
  }

  // 紧急（1-3天）：红色调
  if (days <= 3) {
    return {
      backgroundColor: '#fef2f2',
      borderLeft: '4px solid #ef4444',
    };
  }

  // 即将到来（4-7天）：橙色调
  if (days <= 7) {
    return {
      backgroundColor: '#fff7ed',
      borderLeft: '4px solid #f97316',
    };
  }

  // 未来：正常
  return {
    backgroundColor: 'white',
    borderLeft: '4px solid #e2e8f0',
  };
};

export default function CountdownItem({ item, onDelete }: Props) {
  const itemStyle = getItemStyle(item.targetDate);

  return (
    <li className="item" style={{
      ...itemStyle,
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <span style={{ width: 12, height: 12, borderRadius: 999, background: item.color || "#0ea5e9" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{item.title}</div>
          <div className="subtle" style={{ fontSize: 12 }}>{new Date(item.targetDate).toLocaleDateString()} ・ {label(item.targetDate)}</div>
        </div>
      </div>
      <button onClick={() => onDelete(item.id)} className="btn btn-danger">删除</button>
    </li>
  );
}