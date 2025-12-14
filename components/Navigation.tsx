"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function Navigation() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    const links = [
        { href: "/", label: "ホーム", icon: "home" },
        { href: "/diary", label: "日記", icon: "edit_note" },
        { href: "/watchlist", label: "銘柄", icon: "monitoring" },
        { href: "/stats", label: "分析", icon: "bar_chart" },
        { href: "/calendar", label: "カレンダー", icon: "calendar_month" },
    ];

    return (
        <nav className="nav">
            <div className="nav-container">
                <Link href="/" className="nav-logo">
                    <span className="material-symbols-outlined">trending_up</span>
                    MarketDiary
                </Link>

                <div className="flex gap-2">
                    <div className="nav-links">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${pathname === link.href ? "active" : ""}`}
                            >
                                <span className="material-symbols-outlined">{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label="テーマ切り替え"
                    >
                        <span className="material-symbols-outlined">
                            {theme === "light" ? "dark_mode" : "light_mode"}
                        </span>
                    </button>

                    <button
                        onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" });
                            window.location.href = "/login";
                        }}
                        className="theme-toggle"
                        aria-label="ログアウト"
                        title="ログアウト"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
