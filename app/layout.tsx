import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
    title: "投資日記 | MarketDiary",
    description: "資産投資の記録・分析・振り返りアプリ",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
                    rel="stylesheet"
                />
            </head>
            <body>
                <ThemeProvider>
                    <Navigation />
                    <main className="main-content">
                        <div className="container">
                            {children}
                        </div>
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}
