import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json(
        { success: true, message: "Logout successful" },
        { status: 200 }
    );

    // セッションCookieを削除
    response.cookies.delete("market-diary-session");

    return response;
}
