// File: src/components/Todo/TodoSection.tsx
import React, { useMemo, useState, useEffect } from "react";
import type { Todo } from "../../types";
import TodoItem from "./TodoItem";
import { getTodos, addTodo as addTodoToSupabase, updateTodo, deleteTodo, subscribeTodos } from "../../supabase";

export default function TodoSection() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState<string>("");

  // 加载 todos
  const loadTodos = async () => {
    try {
      const data = await getTodos();
      // 转换数据库字段名为应用字段名
      const mapped: Todo[] = data.map(row => ({
        id: row.id,
        title: row.title,
        notes: row.notes || undefined,
        isDone: row.is_done,
        dueAt: row.due_at || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      setTodos(mapped);
    } catch (error) {
      console.error('加载 todos 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadTodos();

    // 订阅实时更新
    const unsubscribe = subscribeTodos(() => {
      loadTodos();
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
    try {
      await addTodoToSupabase({
        title: title.trim(),
        notes: notes.trim() || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      setTitle("");
      setNotes("");
      setDueAt("");
      // 立即刷新列表
      await loadTodos();
    } catch (error) {
      console.error('添加 todo 失败:', error);
      alert('添加失败，请重试');
    }
  };

  const toggleDone = async (id: string, value: boolean) => {
    try {
      await updateTodo(id, { isDone: value });
      // 立即刷新列表
      await loadTodos();
    } catch (error) {
      console.error('更新 todo 失败:', error);
    }
  };

  const remove = async (id: string) => {
    if (confirm("确认删除这条待办？")) {
      try {
        await deleteTodo(id);
        // 立即刷新列表
        await loadTodos();
      } catch (error) {
        console.error('删除 todo 失败:', error);
      }
    }
  };

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