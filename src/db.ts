// File: src/db.ts
import Dexie, { Table } from "dexie";
import type { Todo, Countdown } from "./types";

class AppDB extends Dexie {
  todos!: Table<Todo, string>;
  countdowns!: Table<Countdown, string>;
  constructor() {
    super("pwa_todo_countdown");
    this.version(1).stores({ todos: "id, isDone, dueAt", countdowns: "id, targetDate" });
  }
}
export const db = new AppDB();
export const nowIso = () => new Date().toISOString();
export const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);