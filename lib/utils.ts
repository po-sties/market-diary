import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import { ja } from "date-fns/locale";

// 日付フォーマット
export function formatDate(date: string | Date, formatStr: string = "yyyy-MM-dd"): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, formatStr, { locale: ja });
}

export function formatDateJP(date: string | Date): string {
    return formatDate(date, "M月d日(E)");
}

export function formatDateFull(date: string | Date): string {
    return formatDate(date, "yyyy年M月d日(E)");
}

// 今日の日付
export function getToday(): string {
    return format(new Date(), "yyyy-MM-dd");
}

// 期間取得
export function getDateRange(period: "week" | "month" | "year" | "all"): { startDate: string; endDate: string } | null {
    const today = new Date();

    switch (period) {
        case "week":
            return {
                startDate: format(subDays(today, 7), "yyyy-MM-dd"),
                endDate: format(today, "yyyy-MM-dd"),
            };
        case "month":
            return {
                startDate: format(subDays(today, 30), "yyyy-MM-dd"),
                endDate: format(today, "yyyy-MM-dd"),
            };
        case "year":
            return {
                startDate: format(subMonths(today, 12), "yyyy-MM-dd"),
                endDate: format(today, "yyyy-MM-dd"),
            };
        case "all":
            return null;
    }
}

// 週の開始日・終了日
export function getWeekRange(date: Date): { start: Date; end: Date } {
    return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
    };
}

// 月の開始日・終了日
export function getMonthRange(date: Date): { start: Date; end: Date } {
    return {
        start: startOfMonth(date),
        end: endOfMonth(date),
    };
}

// 損益計算
export function calculatePnL(buyPrice: number, sellPrice: number, quantity: number): number {
    return (sellPrice - buyPrice) * quantity;
}

// 損益率計算
export function calculatePnLPercent(buyPrice: number, sellPrice: number): number {
    if (buyPrice === 0) return 0;
    return ((sellPrice - buyPrice) / buyPrice) * 100;
}

// 通貨フォーマット
export function formatCurrency(amount: number, currency: string = "JPY"): string {
    const formatter = new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "JPY" ? 0 : 2,
        maximumFractionDigits: currency === "JPY" ? 0 : 2,
    });
    return formatter.format(amount);
}

// 数値フォーマット（カンマ区切り）
export function formatNumber(num: number, decimals: number = 0): string {
    return new Intl.NumberFormat("ja-JP", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

// パーセントフォーマット
export function formatPercent(num: number, decimals: number = 2): string {
    return `${num >= 0 ? "+" : ""}${num.toFixed(decimals)}%`;
}

// ユニークIDを生成
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 日付が有効かチェック
export function isValidDate(dateString: string): boolean {
    const d = parseISO(dateString);
    return !isNaN(d.getTime());
}

// 配列をユニークにする
export function unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

// オブジェクト配列をキーでグループ化
export function groupBy<T, K extends keyof T>(arr: T[], key: K): Record<string, T[]> {
    return arr.reduce((acc, item) => {
        const k = String(item[key]);
        if (!acc[k]) {
            acc[k] = [];
        }
        acc[k].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}
