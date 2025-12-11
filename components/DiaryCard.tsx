"use client";

import { DiaryRecord } from "@/lib/db";
import { formatDateJP, formatCurrency } from "@/lib/utils";
import { stringToTags, diaryTypes } from "@/lib/tags";

interface DiaryCardProps {
    diary: DiaryRecord;
    onEdit?: (diary: DiaryRecord) => void;
    onDelete?: (id: number) => void;
}

export default function DiaryCard({ diary, onEdit, onDelete }: DiaryCardProps) {
    const typeInfo = diaryTypes.find(t => t.value === diary.type);
    const tags = stringToTags(diary.tags);

    return (
        <div className="diary-card">
            <div className="diary-card-header">
                <div className="diary-card-date">{formatDateJP(diary.date)}</div>
                <span
                    className="diary-card-type"
                    style={{ backgroundColor: typeInfo?.color || "#666" }}
                >
                    {typeInfo?.label || diary.type}
                </span>
            </div>

            {diary.ticker && (
                <div className="diary-card-ticker">
                    <span className="material-symbols-outlined">sell</span>
                    {diary.ticker}
                    {diary.broker && <span className="diary-card-broker">({diary.broker})</span>}
                </div>
            )}

            {(diary.type === "buy" || diary.type === "sell") && diary.quantity && diary.price && (
                <div className="diary-card-trade">
                    <span>{diary.quantity}株</span>
                    <span>×</span>
                    <span>{formatCurrency(diary.price, diary.currency || "USD")}</span>
                    <span>=</span>
                    <span className="diary-card-total">
                        {formatCurrency(diary.quantity * diary.price, diary.currency || "USD")}
                    </span>
                </div>
            )}

            <div className="diary-card-content">{diary.content}</div>

            {tags.length > 0 && (
                <div className="diary-card-tags">
                    {tags.map((tag, i) => (
                        <span key={i} className="tag-badge">{tag}</span>
                    ))}
                </div>
            )}

            {(onEdit || onDelete) && (
                <div className="diary-card-actions">
                    {onEdit && (
                        <button onClick={() => onEdit(diary)} className="btn-icon">
                            <span className="material-symbols-outlined">edit</span>
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={() => onDelete(diary.id)} className="btn-icon btn-danger">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
