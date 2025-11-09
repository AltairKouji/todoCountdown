// File: src/components/Auth/LoginForm.tsx
import React, { useState } from "react";
import { supabase } from "../../supabase";

type Props = {
  onLoginSuccess: () => void;
};

export default function LoginForm({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setError("用户名或密码错误");
        console.error("登录失败:", error);
      } else {
        onLoginSuccess();
      }
    } catch (err) {
      setError("登录失败，请重试");
      console.error("登录异常:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: "60px auto",
      padding: 20,
    }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌤️</div>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>清爽待办 & 倒数日</h1>
        <p className="subtle" style={{ fontSize: 14 }}>请登录以继续</p>
      </div>

      <form onSubmit={handleLogin} className="card">
        <div className="field">
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            用户名
          </label>
          <input
            className="ui-input"
            type="text"
            placeholder="请输入用户名"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            密码
          </label>
          <input
            className="ui-input"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div style={{
            padding: 12,
            marginBottom: 16,
            backgroundColor: "#fee",
            color: "#c33",
            borderRadius: 6,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <div style={{
        marginTop: 24,
        textAlign: "center",
        fontSize: 12,
        color: "#888"
      }}>
        <p>请联系管理员获取账号</p>
      </div>
    </div>
  );
}
