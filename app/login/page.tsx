"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // ログイン成功 - 元のページまたはホームにリダイレクト
                router.push(from);
                router.refresh();
            } else {
                setError(data.error || "ログインに失敗しました");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("ログインに失敗しました");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>📈 MarketDiary</h1>
                    <p>投資判断の記録と分析</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">ユーザー名</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">パスワード</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "ログイン中..." : "ログイン"}
                    </button>
                </form>

                <div className="login-footer">
                    <p>環境変数で設定された認証情報を入力してください</p>
                </div>
            </div>

            <style jsx>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                }

                .login-card {
                    background: var(--card-bg);
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 100%;
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .login-header h1 {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--foreground);
                }

                .login-header p {
                    color: var(--foreground-secondary);
                    font-size: 14px;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .login-error {
                    padding: 12px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid #ef4444;
                    border-radius: 8px;
                    color: #ef4444;
                    font-size: 14px;
                    text-align: center;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--foreground);
                }

                .form-group input {
                    padding: 12px 16px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 16px;
                    background: var(--background);
                    color: var(--foreground);
                    transition: border-color 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--primary);
                }

                .form-group input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .login-button {
                    padding: 14px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .login-button:hover:not(:disabled) {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                }

                .login-button:active:not(:disabled) {
                    transform: translateY(0);
                }

                .login-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .login-footer {
                    margin-top: 24px;
                    text-align: center;
                }

                .login-footer p {
                    font-size: 12px;
                    color: var(--foreground-secondary);
                }

                @media (max-width: 480px) {
                    .login-card {
                        padding: 24px;
                    }

                    .login-header h1 {
                        font-size: 24px;
                    }
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
