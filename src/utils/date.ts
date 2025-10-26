// File: src/utils/date.ts
export const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
};

// 计算“剩余天数”：以本地日期为准，严格按“自然日差”计算。
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