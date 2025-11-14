// File: src/db.ts
import Dexie, { Table } from "dexie";
import type { Todo, Countdown, Activity, TimeEntry } from "./types";

class AppDB extends Dexie {
  todos!: Table<Todo, string>;
  countdowns!: Table<Countdown, string>;
  activities!: Table<Activity, string>;
  timeEntries!: Table<TimeEntry, string>;
  constructor() {
    super("pwa_todo_countdown");
    this.version(1).stores({ todos: "id, isDone, dueAt", countdowns: "id, targetDate" });
    // 版本 2: 添加时间追踪表
    this.version(2).stores({
      todos: "id, isDone, dueAt",
      countdowns: "id, targetDate",
      activities: "id, createdAt",
      timeEntries: "id, activityId, date, createdAt"
    });
  }
}
export const db = new AppDB();
export const nowIso = () => new Date().toISOString();
export const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);