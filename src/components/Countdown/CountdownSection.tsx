import React, { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, nowIso, uid } from "../../db";
import type { Countdown } from "../../types";
import CountdownItem from "./CountdownItem";

export default function CountdownSection() {
  const items = useLiveQuery(() => db.countdowns.toArray(), []);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState("#0ea5e9");

  // 自动刷新：每小时刷新一次 + 午夜后立刻再刷新一次
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((x) => x + 1);

    // 每小时刷新一次，保证跨小时时“还有X天”逐步接近变化点
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

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const data: Countdown = {
      id: uid(),
      title: title.trim(),
      targetDate: new Date(date).toISOString(),
      color,
      createdAt: nowIso(),
    };
    await db.countdowns.add(data);
    setTitle("");
    setDate("");
  };

  const remove = async (id: string) => {
    if (confirm("确认删除这个倒数日？")) await db.countdowns.delete(id);
  };

  return (
    <section className="section">
      <h2 className="h2">倒数日</h2>
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
        <div className="field">
          <input
            className="ui-input"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="颜色"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          添加
        </button>
      </form>

      <ul className="list">
        {sorted.map((c) => (
          <CountdownItem key={c.id} item={c} onDelete={remove} />
        ))}
      </ul>
    </section>
  );
}
