"use client";

import { useEffect, useState } from "react";
import { DiaryRecord } from "@/lib/db";
import { formatNumber, formatCurrency, getDateRange } from "@/lib/utils";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#10b981", "#ef4444", "#6366f1", "#f59e0b", "#8b5cf6", "#06b6d4"];

export default function StatsPage() {
    const [diaries, setDiaries] = useState<DiaryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"week" | "month" | "year" | "all">("month");

    useEffect(() => {
        fetchDiaries();
    }, [period]);

    async function fetchDiaries() {
        try {
            const params = new URLSearchParams();
            const dateRange = getDateRange(period);
            if (dateRange) {
                params.set("startDate", dateRange.startDate);
                params.set("endDate", dateRange.endDate);
            }

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

    // 統計計算
    const buys = diaries.filter(d => d.type === "buy");
    const sells = diaries.filter(d => d.type === "sell");
    const notes = diaries.filter(d => d.type === "note");

    const totalBuyVolume = buys.reduce((sum, d) => sum + (d.quantity || 0) * (d.price || 0), 0);
    const totalSellVolume = sells.reduce((sum, d) => sum + (d.quantity || 0) * (d.price || 0), 0);

    // 日別取引件数
    const dailyData = diaries.reduce((acc, d) => {
        const date = d.date;
        if (!acc[date]) {
            acc[date] = { date, buys: 0, sells: 0, notes: 0 };
        }
        if (d.type === "buy") acc[date].buys++;
        else if (d.type === "sell") acc[date].sells++;
        else acc[date].notes++;
        return acc;
    }, {} as Record<string, { date: string; buys: number; sells: number; notes: number }>);

    const chartData = Object.values(dailyData)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14);

    // 種別分布
    const typeData = [
        { name: "買い", value: buys.length, color: "#22c55e" },
        { name: "売り", value: sells.length, color: "#ef4444" },
        { name: "所感", value: notes.length, color: "#3b82f6" },
    ].filter(d => d.value > 0);

    // ティッカー別取引回数
    const tickerData = diaries
        .filter(d => d.ticker)
        .reduce((acc, d) => {
            const ticker = d.ticker!;
            if (!acc[ticker]) acc[ticker] = 0;
            acc[ticker]++;
            return acc;
        }, {} as Record<string, number>);

    const topTickers = Object.entries(tickerData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

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
                <h1 className="page-title">分析</h1>
                <p className="page-subtitle">投資パフォーマンスの可視化</p>
            </div>

            {/* 期間選択 */}
            <div className="tabs">
                {(["week", "month", "year", "all"] as const).map(p => (
                    <button
                        key={p}
                        className={`tab ${period === p ? "active" : ""}`}
                        onClick={() => setPeriod(p)}
                    >
                        {p === "week" ? "週間" : p === "month" ? "月間" : p === "year" ? "年間" : "全期間"}
                    </button>
                ))}
            </div>

            {/* サマリーカード */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-card-label">総記録数</div>
                    <div className="summary-card-value">{formatNumber(diaries.length)}件</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">買い取引</div>
                    <div className="summary-card-value text-success">{formatNumber(buys.length)}件</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">売り取引</div>
                    <div className="summary-card-value text-error">{formatNumber(sells.length)}件</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">買い総額</div>
                    <div className="summary-card-value">{formatCurrency(totalBuyVolume, "USD")}</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card-label">売り総額</div>
                    <div className="summary-card-value">{formatCurrency(totalSellVolume, "USD")}</div>
                </div>
            </div>

            {/* 日別取引チャート */}
            <div className="chart-container">
                <div className="chart-title">日別取引件数</div>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="date"
                                stroke="var(--foreground-secondary)"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value.slice(5)}
                            />
                            <YAxis stroke="var(--foreground-secondary)" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: "var(--card-bg)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px"
                                }}
                            />
                            <Bar dataKey="buys" name="買い" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="sells" name="売り" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="notes" name="所感" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="empty-state">
                        <p>データがありません</p>
                    </div>
                )}
            </div>

            <div className="grid grid-2">
                {/* 種別分布 */}
                <div className="chart-container">
                    <div className="chart-title">記録種別の分布</div>
                    {typeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <p>データがありません</p>
                        </div>
                    )}
                </div>

                {/* トップ銘柄 */}
                <div className="chart-container">
                    <div className="chart-title">取引回数トップ5銘柄</div>
                    {topTickers.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={topTickers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis type="number" stroke="var(--foreground-secondary)" tick={{ fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" stroke="var(--foreground-secondary)" tick={{ fontSize: 12 }} width={60} />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--card-bg)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px"
                                    }}
                                />
                                <Bar dataKey="value" name="回数" fill="var(--primary)" radius={[0, 4, 4, 0]}>
                                    {topTickers.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <p>データがありません</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
