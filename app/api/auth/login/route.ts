import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // 環境変数から認証情報を取得
        const validUsername = process.env.AUTH_USERNAME || "admin";
        const validPassword = process.env.AUTH_PASSWORD || "market2024";

        // 認証チェック
        if (username === validUsername && password === validPassword) {
            // セッショントークンを生成
            const sessionToken = Buffer.from(
                `${validUsername}:${validPassword}:market-diary`
            ).toString("base64");

            // レスポンスを作成
            const response = NextResponse.json(
                { success: true, message: "Login successful" },
                { status: 200 }
            );

            // セッションCookieを設定（30日間有効）
            response.cookies.set("market-diary-session", sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 30, // 30日
                path: "/",
            });

            return response;
        } else {
            return NextResponse.json(
                { error: "ユーザー名またはパスワードが正しくありません" },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "ログイン処理中にエラーが発生しました" },
            { status: 500 }
        );
    }
}
