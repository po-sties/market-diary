// タグマスタ（STOCKS_WATCHLIST_SCHEMA.mdから）

// セクター
export const sectorTags = [
    "AI", "半導体", "電力", "データセンター", "Fintech", "SaaS",
    "医療", "電池", "インフラ", "通信", "光通信", "監視AI", "量子", "EV"
] as const;

// 技術・製品
export const techTags = [
    "SerDes", "AEC", "SSD", "NAND", "DRAM", "AIクラウド",
    "マイクログリッド", "分散発電", "ガスタービン", "光デバイス"
] as const;

// 企業特徴
export const featureTags = [
    "高成長", "高利益率", "キャッシュフロープラス", "赤字",
    "規制産業", "政府案件", "超小型株", "仕手性", "財務弱", "高配当"
] as const;

// 国・地域
export const regionTags = [
    "US", "JP", "CN", "TW", "EU", "Other"
] as const;

// 全タグ
export const allTags = [
    ...sectorTags,
    ...techTags,
    ...featureTags,
    ...regionTags,
] as const;

export type Tag = typeof allTags[number];

// カテゴリマスタ
export const categories = [
    "AIインフラ",
    "AI電力・インフラ",
    "AIソフト",
    "AIフィンテック",
    "次世代計算",
    "半導体",
    "電力インフラ",
    "医療テック",
    "ヘルスケア",
    "EC・中国消費",
    "医薬",
    "化学・半導体材料",
    "成長株",
    "投機枠",
    "指数",
] as const;

export type Category = typeof categories[number];

// 証券会社マスタ
export const brokers = [
    "楽天証券",
    "SBI証券",
    "moomoo証券",
] as const;

export type Broker = typeof brokers[number];

// 通貨マスタ
export const currencies = [
    "JPY",
    "USD",
    "TWD",
] as const;

export type Currency = typeof currencies[number];

// 取引所マスタ
export const exchanges = [
    "NASDAQ",
    "NYSE",
    "NYSE Arca",
    "TSE",
    "TWSE",
] as const;

export type Exchange = typeof exchanges[number];

// ステータスマスタ
export const statuses = [
    "監視",
    "保有",
    "売却済み",
] as const;

export type Status = typeof statuses[number];

// 日記タイプ
export const diaryTypes = [
    { value: "buy", label: "買い", color: "#22c55e" },
    { value: "sell", label: "売り", color: "#ef4444" },
    { value: "note", label: "所感", color: "#3b82f6" },
] as const;

export type DiaryType = "buy" | "sell" | "note";

// タグをカンマ区切り文字列に変換
export function tagsToString(tags: string[]): string {
    return tags.join(", ");
}

// カンマ区切り文字列からタグ配列に変換
export function stringToTags(str: string | null): string[] {
    if (!str) return [];
    return str.split(",").map(t => t.trim()).filter(t => t.length > 0);
}
