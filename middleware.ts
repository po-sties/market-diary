import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // ログインページと静的ファイルは認証不要
    if (
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/favicon')
    ) {
        return NextResponse.next();
    }

    // セッションCookieをチェック
    const session = request.cookies.get('market-diary-session');

    if (!session) {
        // 未認証の場合、ログインページにリダイレクト
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 簡易的なセッション検証（本番環境では暗号化されたトークンを使用すべき）
    const expectedSession = createSessionToken();
    if (session.value !== expectedSession) {
        // セッションが無効な場合
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('market-diary-session');
        return response;
    }

    return NextResponse.next();
}

function createSessionToken(): string {
    // 環境変数から認証情報を取得してトークンを生成
    const username = process.env.AUTH_USERNAME || 'admin';
    const password = process.env.AUTH_PASSWORD || 'password';

    // 簡易的なハッシュ（本番環境ではより強力な暗号化を推奨）
    const token = Buffer.from(`${username}:${password}:market-diary`).toString('base64');
    return token;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next (Next.js internals)
         * - static files (images, etc.)
         */
        '/((?!api|_next|favicon.ico).*)',
    ],
};
