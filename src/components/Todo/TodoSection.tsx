// File: src/components/Todo/TodoSection.tsx
import React, { useMemo, useState, useEffect } from "react";
import type { Todo } from "../../types";
import TodoItem from "./TodoItem";
import { getTodos, addTodo as addTodoToSupabase, updateTodo, deleteTodo, subscribeTodos } from "../../supabase";
import { exportToJSON, exportToCSV, formatDateForExport } from "../../utils/export";

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

  const handleUpdate = async (id: string, updates: { title?: string; notes?: string; dueAt?: string }) => {
    try {
      await updateTodo(id, updates);
      // 立即刷新列表
      await loadTodos();
    } catch (error) {
      console.error('更新 todo 失败:', error);
      alert('更新失败，请重试');
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

  const handleExport = () => {
    if (todos.length === 0) {
      alert('没有数据可导出');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];

    // 导出为JSON
    const jsonData = todos.map(todo => ({
      标题: todo.title,
      备注: todo.notes || '',
      状态: todo.isDone ? '已完成' : '未完成',
      到期时间: todo.dueAt ? formatDateForExport(todo.dueAt) : '',
      创建时间: formatDateForExport(todo.createdAt),
    }));

    exportToJSON(jsonData, `待办事项_${timestamp}.json`);
  };

  const hasTodos = sorted.length > 0;

  return (
    <section className="section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="h2" style={{ margin: 0 }}>待办</h2>
        {hasTodos && (
          <button
            onClick={handleExport}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              backgroundColor: 'white',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0ea5e9';
              e.currentTarget.style.color = '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            📥 导出
          </button>
        )}
      </div>
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

      {!hasTodos && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#94a3b8',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 15, marginBottom: 4 }}>还没有待办事项</div>
          <div style={{ fontSize: 13 }}>点击上方添加第一个吧</div>
        </div>
      )}

      {hasTodos && (
        <ul className="list">
          {sorted.map((t) => (<TodoItem key={t.id} todo={t} onToggle={toggleDone} onDelete={remove} onUpdate={handleUpdate} />))}
        </ul>
      )}
    </section>
  );
}