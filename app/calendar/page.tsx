"use client";

import { useEffect, useState } from "react";
import { DiaryRecord } from "@/lib/db";
import DiaryCard from "@/components/DiaryCard";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    getDay
} from "date-fns";
import { ja } from "date-fns/locale";

export default function CalendarPage() {
    const [diaries, setDiaries] = useState<DiaryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        fetchDiaries();
    }, [currentMonth]);

    async function fetchDiaries() {
        try {
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            const params = new URLSearchParams({
                startDate: format(start, "yyyy-MM-dd"),
                endDate: format(end, "yyyy-MM-dd"),
            });

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

    // カレンダーの日付を生成
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // 月曜始まりにするための空セル
    const startDay = getDay(monthStart);
    const emptyDays = startDay === 0 ? 6 : startDay - 1;

    // 日付ごとの記録をマップ
    const diaryMap = diaries.reduce((acc, d) => {
        if (!acc[d.date]) {
            acc[d.date] = [];
        }
        acc[d.date].push(d);
        return acc;
    }, {} as Record<string, DiaryRecord[]>);

    const selectedDiaries = selectedDate
        ? diaryMap[format(selectedDate, "yyyy-MM-dd")] || []
        : [];

    const weekDays = ["月", "火", "水", "木", "金", "土", "日"];

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
                <h1 className="page-title">カレンダー</h1>
                <p className="page-subtitle">投資活動の履歴を視覚的に確認</p>
            </div>

            <div className="calendar">
                <div className="calendar-header">
                    <button
                        className="btn btn-icon"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <h2 className="calendar-title">
                        {format(currentMonth, "yyyy年M月", { locale: ja })}
                    </h2>
                    <button
                        className="btn btn-icon"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                <div className="calendar-grid">
                    {weekDays.map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                    ))}

                    {Array.from({ length: emptyDays }).map((_, i) => (
                        <div key={`empty-${i}`} className="calendar-day other-month"></div>
                    ))}

                    {days.map(day => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const dayDiaries = diaryMap[dateStr] || [];
                        const hasBuy = dayDiaries.some(d => d.type === "buy");
                        const hasSell = dayDiaries.some(d => d.type === "sell");
                        const hasNote = dayDiaries.some(d => d.type === "note");
                        const isToday = isSameDay(day, new Date());
                        const isSelected = selectedDate && isSameDay(day, selectedDate);

                        return (
                            <div
                                key={dateStr}
                                className={`calendar-day 
                                    ${!isSameMonth(day, currentMonth) ? "other-month" : ""} 
                                    ${isToday ? "today" : ""} 
                                    ${isSelected ? "selected" : ""}
                                    ${dayDiaries.length > 0 ? "has-entry" : ""}
                                    ${hasBuy ? "has-buy" : hasSell ? "has-sell" : hasNote ? "has-note" : ""}`}
                                onClick={() => setSelectedDate(day)}
                            >
                                {format(day, "d")}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 選択した日の記録 */}
            {selectedDate && (
                <div className="mt-4">
                    <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>
                        {format(selectedDate, "M月d日(E)", { locale: ja })}の記録
                    </h3>
                    {selectedDiaries.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <p>この日の記録はありません</p>
                            </div>
                        </div>
                    ) : (
                        <div className="list">
                            {selectedDiaries.map(diary => (
                                <DiaryCard key={diary.id} diary={diary} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 凡例 */}
            <div className="card mt-4">
                <div className="flex gap-4" style={{ fontSize: "0.875rem" }}>
                    <div className="flex gap-2">
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }}></span>
                        <span>買い</span>
                    </div>
                    <div className="flex gap-2">
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }}></span>
                        <span>売り</span>
                    </div>
                    <div className="flex gap-2">
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#3b82f6" }}></span>
                        <span>所感</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
