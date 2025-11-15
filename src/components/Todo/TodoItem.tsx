// File: src/components/Todo/TodoItem.tsx
import React, { useState } from "react";
import type { Todo } from "../../types";
import { formatDateTime } from "../../utils/date";

type Props = {
  todo: Todo;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; notes?: string; dueAt?: string }) => void;
};

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editNotes, setEditNotes] = useState(todo.notes || '');
  const [editDueAt, setEditDueAt] = useState(todo.dueAt || '');

  const handleSave = () => {
    if (!editTitle.trim()) {
      alert('标题不能为空');
      return;
    }
    onUpdate(todo.id, {
      title: editTitle.trim(),
      notes: editNotes.trim() || undefined,
      dueAt: editDueAt || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditNotes(todo.notes || '');
    setEditDueAt(todo.dueAt || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="标题"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: 14,
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              marginBottom: 8,
              boxSizing: 'border-box',
            }}
          />
          <input
            type="text"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="备注（可选）"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: 14,
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              marginBottom: 8,
              boxSizing: 'border-box',
            }}
          />
          <input
            type="datetime-local"
            value={editDueAt}
            onChange={(e) => setEditDueAt(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: 14,
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>
            保存
          </button>
          <button onClick={handleCancel} className="btn" style={{ flex: 1, background: '#e5e7eb' }}>
            取消
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="item">
      <label style={{ display: "flex", gap: 8, alignItems: "start", flex: 1 }}>
        <input type="checkbox" checked={todo.isDone} onChange={(e) => onToggle(todo.id, e.target.checked)} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, textDecoration: todo.isDone ? "line-through" : "none" }}>{todo.title}</div>
          {todo.notes && <div className="subtle" style={{ fontSize: 12 }}>{todo.notes}</div>}
          <div style={{ color: "#888", fontSize: 12 }}>{todo.dueAt ? `到期：${formatDateTime(todo.dueAt)}` : ""}</div>
        </div>
      </label>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => setIsEditing(true)} className="btn" style={{ fontSize: 12, padding: '6px 10px', background: '#f1f5f9' }}>
          编辑
        </button>
        <button onClick={() => onDelete(todo.id)} className="btn btn-danger" style={{ fontSize: 12, padding: '6px 10px' }}>
          删除
        </button>
      </div>
    </li>
  );
}