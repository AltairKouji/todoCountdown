// File: src/utils/date.ts
import type { RepeatType } from "../types";

export const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
};

// 计算"剩余天数"：以本地日期为准，严格按"自然日差"计算。
// 例：今天 26 日，目标 27 日 => 返回 1。
// 使用 UTC 日起点避免夏令时导致的 23/25 小时问题。
const DAY = 24 * 60 * 60 * 1000;
const toUtcDayStart = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

export const daysLeft = (iso: string) => {
  const now = new Date();
  const target = new Date(iso);
  const diff = (toUtcDayStart(target) - toUtcDayStart(now)) / DAY;
  return Math.trunc(diff); // diff 此时应为整数；trunc 更稳健
};

// 根据重复类型计算下一次发生的日期
export const getNextOccurrence = (baseDate: string, repeatType?: RepeatType): string => {
  if (!repeatType || repeatType === 'none') {
    return baseDate;
  }

  const now = new Date();
  const base = new Date(baseDate);

  if (repeatType === 'weekly') {
    // 每周循环：找到下一个相同星期几的日期
    const targetDay = base.getDay(); // 0-6 (周日-周六)
    const today = now.getDay();

    // 计算距离下一次目标星期几的天数
    let daysUntilNext = targetDay - today;
    if (daysUntilNext <= 0) {
      daysUntilNext += 7; // 如果已经过了，则下周
    }

    const next = new Date(now);
    next.setDate(now.getDate() + daysUntilNext);
    return next.toISOString();
  }

  if (repeatType === 'yearly') {
    // 每年循环：找到下一次相同月日的日期
    const nextYear = new Date(now.getFullYear(), base.getMonth(), base.getDate());

    // 如果今年的日期已经过了，则使用明年的
    if (nextYear <= now) {
      nextYear.setFullYear(now.getFullYear() + 1);
    }

    return nextYear.toISOString();
  }

  return baseDate;
};