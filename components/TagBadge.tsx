interface TagBadgeProps {
    tag: string;
    onRemove?: () => void;
    onClick?: () => void;
    selected?: boolean;
}

export default function TagBadge({ tag, onRemove, onClick, selected }: TagBadgeProps) {
    return (
        <span
            className={`tag-badge ${selected ? "selected" : ""} ${onClick ? "clickable" : ""}`}
            onClick={onClick}
        >
            {tag}
            {onRemove && (
                <button
                    className="tag-remove"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    ×
                </button>
            )}
        </span>
    );
}
