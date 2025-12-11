"use client";

import { useEffect, useState } from "react";
import { DiaryRecord } from "@/lib/db";
import DiaryCard from "@/components/DiaryCard";
import { formatDateFull, getToday } from "@/lib/utils";
import { diaryTypes, brokers, currencies } from "@/lib/tags";

export default function HomePage() {
    const [diaries, setDiaries] = useState<DiaryRecord[]>([]);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // フォーム状態
    const [formData, setFormData] = useState({
        type: "note" as "buy" | "sell" | "note",
        ticker: "",
        broker: "",
        quantity: "",
        price: "",
        currency: "USD",
        content: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [diaryRes, watchlistRes] = await Promise.all([
                fetch(`/api/diary?limit=5`),
                fetch(`/api/watchlist`),
            ]);

            if (diaryRes.ok) {
                const data = await diaryRes.json();
                setDiaries(data);
            }
            if (watchlistRes.ok) {
                const data = await watchlistRes.json();
                setWatchlistCount(data.length);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const res = await fetch("/api/diary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: getToday(),
                    type: formData.type,
                    ticker: formData.ticker || null,
                    broker: formData.broker || null,
                    quantity: formData.quantity ? parseFloat(formData.quantity) : null,
                    price: formData.price ? parseFloat(formData.price) : null,
                    currency: formData.currency || null,
                    content: formData.content,
                    tags: null,
                }),
            });

            if (res.ok) {
                setFormData({
                    type: "note",
                    ticker: "",
                    broker: "",
                    quantity: "",
                    price: "",
                    currency: "USD",
                    content: "",
                });
                setShowForm(false);
                fetchData();
            }
        } catch (error) {
            console.error("Failed to create diary:", error);
        }
    }

    const todayDiaries = diaries.filter(d => d.date === getToday());
    const todayBuys = todayDiaries.filter(d => d.type === "buy").length;
    const todaySells = todayDiaries.filter(d => d.type === "sell").length;

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">MarketDiary</h1>
                <p className="page-subtitle">{formatDateFull(new Date())}</p>
            </div>

            {/* サマリーカード */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-card-label">今日の取引</div>
                    <div className="summary-card-value">
                        <span className="text-success">{todayBuys}件</span>
                        {" / "}
                        <span className="text-error">{todaySells}件</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">今日の記録</div>
                    <div className="summary-card-value">{todayDiaries.length}件</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">ウォッチリスト</div>
                    <div className="summary-card-value">{watchlistCount}銘柄</div>
                </div>
            </div>

            {/* クイック入力 */}
            <div className="card mb-4">
                <div className="flex-between mb-3">
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>クイック入力</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <span className="material-symbols-outlined">
                            {showForm ? "close" : "add"}
                        </span>
                        {showForm ? "閉じる" : "新規記録"}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-3 mb-3">
                            {diaryTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`tab ${formData.type === type.value ? "active" : ""}`}
                                    onClick={() => setFormData({ ...formData, type: type.value as "buy" | "sell" | "note" })}
                                    style={formData.type === type.value ? { borderBottom: `3px solid ${type.color}` } : {}}
                                >
                                    {type.label}
                                </button>
                            ))}
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
                            <label className="form-label">
                                {formData.type === "note" ? "マーケット所感" : "判断理由"}
                            </label>
                            <textarea
                                rows={3}
                                placeholder={formData.type === "note"
                                    ? "今日のマーケットについて..."
                                    : "なぜこのタイミングで取引したか..."}
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">
                            <span className="material-symbols-outlined">save</span>
                            記録する
                        </button>
                    </form>
                )}
            </div>

            {/* 最新の日記 */}
            <div className="card">
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    最新の記録
                </h2>
                {diaries.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <div className="empty-state-title">記録がありません</div>
                        <p>上のフォームから投資日記を記録しましょう</p>
                    </div>
                ) : (
                    <div className="list">
                        {diaries.slice(0, 5).map(diary => (
                            <DiaryCard key={diary.id} diary={diary} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
