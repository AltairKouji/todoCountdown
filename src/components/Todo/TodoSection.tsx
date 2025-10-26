// File: src/components/Todo/TodoSection.tsx
import React, { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, nowIso, uid } from "../../db";
import type { Todo } from "../../types";
import TodoItem from "./TodoItem";

export default function TodoSection() {
  const todos = useLiveQuery(() => db.todos.toArray(), []);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState<string>("");

  const sorted = useMemo(() => {
    if (!todos) return [] as Todo[];
    return [...todos].sort((a, b) => {
      if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
      const da = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
      const dbb = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
      if (da !== dbb) return da - dbb;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [todos]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const t: Todo = { id: uid(), title: title.trim(), notes: notes.trim() || undefined, isDone: false, dueAt: dueAt ? new Date(dueAt).toISOString() : undefined, createdAt: nowIso(), updatedAt: nowIso() };
    await db.todos.add(t);
    setTitle(""); setNotes(""); setDueAt("");
  };

  const toggleDone = async (id: string, value: boolean) => { await db.todos.update(id, { isDone: value, updatedAt: nowIso() }); };
  const remove = async (id: string) => { if (confirm("确认删除这条待办？")) await db.todos.delete(id); };

  return (
    <section className="section">
      <h2 className="h2">待办</h2>
      <form onSubmit={addTodo} className="card">
        <div className="field">
          <input className="ui-input" placeholder="待办标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <input className="ui-input" placeholder="备注（可选）" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="field">
          <input className="ui-input" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">添加</button>
      </form>

      <ul className="list">
        {sorted.map((t) => (<TodoItem key={t.id} todo={t} onToggle={toggleDone} onDelete={remove} />))}
      </ul>
    </section>
  );
}