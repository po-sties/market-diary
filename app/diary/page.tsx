"use client";

import { useEffect, useState } from "react";
import { DiaryRecord } from "@/lib/db";
import DiaryCard from "@/components/DiaryCard";
import { getToday } from "@/lib/utils";
import { diaryTypes, brokers, currencies } from "@/lib/tags";

export default function DiaryPage() {
    const [diaries, setDiaries] = useState<DiaryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        type: "",
        ticker: "",
    });
    const [showForm, setShowForm] = useState(false);
    const [editingDiary, setEditingDiary] = useState<DiaryRecord | null>(null);

    const [formData, setFormData] = useState({
        date: getToday(),
        type: "note" as "buy" | "sell" | "note",
        ticker: "",
        broker: "",
        quantity: "",
        price: "",
        currency: "USD",
        content: "",
        tags: "",
    });

    useEffect(() => {
        fetchDiaries();
    }, [filter]);

    async function fetchDiaries() {
        try {
            const params = new URLSearchParams();
            if (filter.type) params.set("type", filter.type);
            if (filter.ticker) params.set("ticker", filter.ticker);

            const res = await fetch(`/api/diary?${params}`);
            if (res.ok) {
                const data = await res.json();
                setDiaries(data);
            }
        } catch (error) {
            console.error("Failed to fetch diaries:", error);
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            date: getToday(),
            type: "note",
            ticker: "",
            broker: "",
            quantity: "",
            price: "",
            currency: "USD",
            content: "",
            tags: "",
        });
        setEditingDiary(null);
    }

    function handleEdit(diary: DiaryRecord) {
        setFormData({
            date: diary.date,
            type: diary.type,
            ticker: diary.ticker || "",
            broker: diary.broker || "",
            quantity: diary.quantity?.toString() || "",
            price: diary.price?.toString() || "",
            currency: diary.currency || "USD",
            content: diary.content,
            tags: diary.tags || "",
        });
        setEditingDiary(diary);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            date: formData.date,
            type: formData.type,
            ticker: formData.ticker || null,
            broker: formData.broker || null,
            quantity: formData.quantity ? parseFloat(formData.quantity) : null,
            price: formData.price ? parseFloat(formData.price) : null,
            currency: formData.currency || null,
            content: formData.content,
            tags: formData.tags || null,
        };

        try {
            const url = editingDiary ? `/api/diary?id=${editingDiary.id}` : "/api/diary";
            const method = editingDiary ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                resetForm();
                setShowForm(false);
                fetchDiaries();
            }
        } catch (error) {
            console.error("Failed to save diary:", error);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("この記録を削除しますか？")) return;

        try {
            const res = await fetch(`/api/diary?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchDiaries();
            }
        } catch (error) {
            console.error("Failed to delete diary:", error);
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">投資日記</h1>
                    <p className="page-subtitle">売買記録と所感を管理</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                >
                    <span className="material-symbols-outlined">add</span>
                    新規記録
                </button>
            </div>

            {/* フィルター */}
            <div className="filter-bar">
                <select
                    value={filter.type}
                    onChange={e => setFilter({ ...filter, type: e.target.value })}
                >
                    <option value="">すべての種別</option>
                    {diaryTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <input
                    type="search"
                    placeholder="ティッカーで検索..."
                    value={filter.ticker}
                    onChange={e => setFilter({ ...filter, ticker: e.target.value.toUpperCase() })}
                />
            </div>

            {/* 入力フォーム */}
            {showForm && (
                <div className="card mb-4">
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                        {editingDiary ? "記録を編集" : "新規記録"}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-2 mb-3">
                            <div className="form-group">
                                <label className="form-label">日付</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">種別</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as "buy" | "sell" | "note" })}
                                    required
                                >
                                    {diaryTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {(formData.type === "buy" || formData.type === "sell") && (
                            <>
                                <div className="grid grid-2 mb-3">
                                    <div className="form-group">
                                        <label className="form-label">ティッカー</label>
                                        <input
                                            type="text"
                                            placeholder="例: AAPL"
                                            value={formData.ticker}
                                            onChange={e => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">証券会社</label>
                                        <select
                                            value={formData.broker}
                                            onChange={e => setFormData({ ...formData, broker: e.target.value })}
                                        >
                                            <option value="">選択してください</option>
                                            {brokers.map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-3 mb-3">
                                    <div className="form-group">
                                        <label className="form-label">数量</label>
                                        <input
                                            type="number"
                                            placeholder="100"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">価格</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="150.00"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">通貨</label>
                                        <select
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        >
                                            {currencies.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group mb-3">
                            <label className="form-label">内容</label>
                            <textarea
                                rows={4}
                                placeholder="判断理由やマーケットの所感を記録..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label className="form-label">タグ（カンマ区切り）</label>
                            <input
                                type="text"
                                placeholder="例: AI, 半導体, 高成長"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">
                                <span className="material-symbols-outlined">save</span>
                                {editingDiary ? "更新" : "記録"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => { resetForm(); setShowForm(false); }}
                            >
                                キャンセル
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 日記一覧 */}
            {diaries.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <div className="empty-state-title">記録がありません</div>
                        <p>新規記録ボタンから投資日記を始めましょう</p>
                    </div>
                </div>
            ) : (
                <div className="list">
                    {diaries.map(diary => (
                        <DiaryCard
                            key={diary.id}
                            diary={diary}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
