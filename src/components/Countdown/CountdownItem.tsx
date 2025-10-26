// File: src/components/Countdown/CountdownItem.tsx
import React from "react";
import type { Countdown } from "../../types";
import { daysLeft } from "../../utils/date";

type Props = { item: Countdown; onDelete: (id: string) => void; };
const label = (iso: string) => { const d = daysLeft(iso); if (d > 0) return `还有 ${d} 天`; if (d === 0) return "就是今天！"; return `已经过去 ${Math.abs(d)} 天`; };

export default function CountdownItem({ item, onDelete }: Props) {
  return (
    <li className="item">
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