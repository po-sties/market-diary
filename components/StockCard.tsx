"use client";

import { WatchlistRecord } from "@/lib/db";
import { stringToTags } from "@/lib/tags";

interface StockCardProps {
    stock: WatchlistRecord;
    onEdit?: (stock: WatchlistRecord) => void;
    onDelete?: (id: number) => void;
    expanded?: boolean;
    onToggle?: () => void;
}

export default function StockCard({ stock, onEdit, onDelete, expanded, onToggle }: StockCardProps) {
    const tags = stringToTags(stock.tags);

    return (
        <div className={`stock-card ${expanded ? "expanded" : ""}`} onClick={onToggle}>
            <div className="stock-card-header">
                <div className="stock-card-ticker">
                    <span className="ticker">{stock.ticker}</span>
                    <span className="exchange">{stock.exchange}</span>
                </div>
                <div className="stock-card-name">{stock.name}</div>
            </div>

            <div className="stock-card-meta">
                <span className="stock-card-category">{stock.category}</span>
                {stock.conviction && (
                    <span className="stock-card-conviction">
                        {"★".repeat(stock.conviction)}{"☆".repeat(5 - stock.conviction)}
                    </span>
                )}
                {stock.status && (
                    <span className={`stock-card-status status-${stock.status}`}>
                        {stock.status}
                    </span>
                )}
            </div>

            <div className="stock-card-tags">
                {tags.slice(0, 5).map((tag, i) => (
                    <span key={i} className="tag-badge">{tag}</span>
                ))}
                {tags.length > 5 && <span className="tag-badge tag-more">+{tags.length - 5}</span>}
            </div>

            {expanded && (
                <div className="stock-card-details">
                    <div className="stock-card-section">
                        <h4>投資仮説</h4>
                        <p>{stock.thesis}</p>
                    </div>

                    {stock.risk && (
                        <div className="stock-card-section">
                            <h4>リスク</h4>
                            <p>{stock.risk}</p>
                        </div>
                    )}

                    {stock.notes && (
                        <div className="stock-card-section">
                            <h4>メモ</h4>
                            <p>{stock.notes}</p>
                        </div>
                    )}

                    {(onEdit || onDelete) && (
                        <div className="stock-card-actions" onClick={e => e.stopPropagation()}>
                            {onEdit && (
                                <button onClick={() => onEdit(stock)} className="btn btn-secondary">
                                    <span className="material-symbols-outlined">edit</span>
                                    編集
                                </button>
                            )}
                            {onDelete && (
                                <button onClick={() => onDelete(stock.id)} className="btn btn-danger">
                                    <span className="material-symbols-outlined">delete</span>
                                    削除
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
