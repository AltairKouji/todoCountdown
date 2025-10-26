// File: src/components/Todo/TodoItem.tsx
import React from "react";
import type { Todo } from "../../types";
import { formatDateTime } from "../../utils/date";

type Props = { todo: Todo; onToggle: (id: string, value: boolean) => void; onDelete: (id: string) => void; };
export default function TodoItem({ todo, onToggle, onDelete }: Props) {
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
      <button onClick={() => onDelete(todo.id)} className="btn btn-danger">删除</button>
    </li>
  );
}