"use client";

import { useEffect, useState } from "react";
import { WatchlistRecord } from "@/lib/db";
import StockCard from "@/components/StockCard";
import { categories, statuses } from "@/lib/tags";
import { getToday } from "@/lib/utils";

export default function WatchlistPage() {
    const [stocks, setStocks] = useState<WatchlistRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [filter, setFilter] = useState({
        category: "",
        status: "",
        search: "",
    });
    const [showForm, setShowForm] = useState(false);
    const [editingStock, setEditingStock] = useState<WatchlistRecord | null>(null);

    const [formData, setFormData] = useState({
        ticker: "",
        name: "",
        exchange: "",
        category: "",
        tags: "",
        thesis: "",
        risk: "",
        notes: "",
        conviction: "",
        status: "監視",
    });

    useEffect(() => {
        fetchStocks();
    }, [filter]);

    async function fetchStocks() {
        try {
            const params = new URLSearchParams();
            if (filter.category) params.set("category", filter.category);
            if (filter.status) params.set("status", filter.status);
            if (filter.search) params.set("search", filter.search);

            const res = await fetch(`/api/watchlist?${params}`);
            if (res.ok) {
                const data = await res.json();
                setStocks(data);
            }
        } catch (error) {
            console.error("Failed to fetch stocks:", error);
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            ticker: "",
            name: "",
            exchange: "",
            category: "",
            tags: "",
            thesis: "",
            risk: "",
            notes: "",
            conviction: "",
            status: "監視",
        });
        setEditingStock(null);
    }

    function handleEdit(stock: WatchlistRecord) {
        setFormData({
            ticker: stock.ticker,
            name: stock.name,
            exchange: stock.exchange || "",
            category: stock.category,
            tags: stock.tags,
            thesis: stock.thesis,
            risk: stock.risk || "",
            notes: stock.notes || "",
            conviction: stock.conviction?.toString() || "",
            status: stock.status || "監視",
        });
        setEditingStock(stock);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            ticker: formData.ticker,
            name: formData.name,
            exchange: formData.exchange || null,
            category: formData.category,
            tags: formData.tags,
            thesis: formData.thesis,
            risk: formData.risk || null,
            notes: formData.notes || null,
            conviction: formData.conviction ? parseInt(formData.conviction) : null,
            positionSize: null,
            addedDate: editingStock?.addedDate || getToday(),
            status: formData.status || null,
        };

        try {
            const url = editingStock ? `/api/watchlist?id=${editingStock.id}` : "/api/watchlist";
            const method = editingStock ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                resetForm();
                setShowForm(false);
                fetchStocks();
            }
        } catch (error) {
            console.error("Failed to save stock:", error);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("この銘柄を削除しますか？")) return;

        try {
            const res = await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchStocks();
            }
        } catch (error) {
            console.error("Failed to delete stock:", error);
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
                    <h1 className="page-title">ウォッチリスト</h1>
                    <p className="page-subtitle">{stocks.length}銘柄を監視中</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                >
                    <span className="material-symbols-outlined">add</span>
                    銘柄追加
                </button>
            </div>

            {/* フィルター */}
            <div className="filter-bar">
                <select
                    value={filter.category}
                    onChange={e => setFilter({ ...filter, category: e.target.value })}
                >
                    <option value="">すべてのカテゴリ</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    value={filter.status}
                    onChange={e => setFilter({ ...filter, status: e.target.value })}
                >
                    <option value="">すべてのステータス</option>
                    {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <input
                    type="search"
                    placeholder="銘柄を検索..."
                    value={filter.search}
                    onChange={e => setFilter({ ...filter, search: e.target.value })}
                />
            </div>

            {/* 入力フォーム */}
            {showForm && (
                <div className="card mb-4">
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                        {editingStock ? "銘柄を編集" : "銘柄を追加"}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-3 mb-3">
                            <div className="form-group">
                                <label className="form-label">ティッカー *</label>
                                <input
                                    type="text"
                                    placeholder="例: AAPL"
                                    value={formData.ticker}
                                    onChange={e => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">会社名 *</label>
                                <input
                                    type="text"
                                    placeholder="例: Apple Inc."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">取引所</label>
                                <input
                                    type="text"
                                    placeholder="例: NASDAQ"
                                    value={formData.exchange}
                                    onChange={e => setFormData({ ...formData, exchange: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-3 mb-3">
                            <div className="form-group">
                                <label className="form-label">カテゴリ *</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">選択してください</option>
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">自信度（1-5）</label>
                                <select
                                    value={formData.conviction}
                                    onChange={e => setFormData({ ...formData, conviction: e.target.value })}
                                >
                                    <option value="">選択してください</option>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <option key={n} value={n}>{n} - {"★".repeat(n)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">ステータス</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {statuses.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group mb-3">
                            <label className="form-label">タグ *（カンマ区切り）</label>
                            <input
                                type="text"
                                placeholder="例: US, AI, 半導体, 高成長"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label className="form-label">投資仮説 *</label>
                            <textarea
                                rows={3}
                                placeholder="なぜこの銘柄に注目しているか..."
                                value={formData.thesis}
                                onChange={e => setFormData({ ...formData, thesis: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label className="form-label">リスク</label>
                            <textarea
                                rows={2}
                                placeholder="想定されるリスク..."
                                value={formData.risk}
                                onChange={e => setFormData({ ...formData, risk: e.target.value })}
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label className="form-label">メモ・参考URL</label>
                            <textarea
                                rows={2}
                                placeholder="参考情報のURL等..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">
                                <span className="material-symbols-outlined">save</span>
                                {editingStock ? "更新" : "追加"}
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

            {/* 銘柄一覧 */}
            {stocks.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <div className="empty-state-title">銘柄がありません</div>
                        <p>銘柄追加ボタンから監視銘柄を追加しましょう</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-2">
                    {stocks.map(stock => (
                        <StockCard
                            key={stock.id}
                            stock={stock}
                            expanded={expandedId === stock.id}
                            onToggle={() => setExpandedId(expandedId === stock.id ? null : stock.id)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
