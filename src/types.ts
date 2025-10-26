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

export type Countdown = {
  id: string;
  title: string;
  targetDate: string; // ISO (日期)
  color?: string; // e.g. "#0ea5e9"
  createdAt: string; // ISO
};