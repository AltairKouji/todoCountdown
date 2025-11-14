// File: src/types.ts
export type Todo = {
  id: string;
  title: string;
  notes?: string;
  isDone: boolean;
  dueAt?: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type RepeatType = 'none' | 'weekly' | 'yearly';

export type Countdown = {
  id: string;
  title: string;
  targetDate: string; // ISO (日期)
  color?: string; // e.g. "#0ea5e9"
  repeatType?: RepeatType; // 重复类型
  createdAt: string; // ISO
};

// 时间追踪 - 活动定义
export type Activity = {
  id: string;
  name: string;
  emoji?: string;
  weeklyGoalMinutes: number; // 周目标（分钟）
  color?: string;
  createdAt: string; // ISO
};

// 时间追踪 - 时间记录
export type TimeEntry = {
  id: string;
  activityId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  durationMinutes: number; // 时长（分钟）
  date: string; // 记录日期（YYYY-MM-DD）
  createdAt: string; // ISO
};