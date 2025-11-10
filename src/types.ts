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