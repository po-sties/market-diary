import { NextRequest, NextResponse } from "next/server";
import {
    initializeDatabase,
    getAllWatchlist,
    getWatchlistById,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist
} from "@/lib/db";

// GET: ウォッチリスト取得
export async function GET(request: NextRequest) {
    try {
        await initializeDatabase();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") || undefined;
        const status = searchParams.get("status") || undefined;
        const search = searchParams.get("search") || undefined;

        const stocks = await getAllWatchlist({ category, status, search });
        return NextResponse.json(stocks);
    } catch (error) {
        console.error("GET /api/watchlist error:", error);
        return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
    }
}

// POST: 銘柄追加
export async function POST(request: NextRequest) {
    try {
        await initializeDatabase();

        const body = await request.json();
        const stock = await createWatchlist({
            ticker: body.ticker,
            name: body.name,
            exchange: body.exchange,
            category: body.category,
            tags: body.tags,
            thesis: body.thesis,
            risk: body.risk,
            notes: body.notes,
            conviction: body.conviction,
            positionSize: body.positionSize,
            addedDate: body.addedDate,
            status: body.status,
        });

        return NextResponse.json(stock, { status: 201 });
    } catch (error) {
        console.error("POST /api/watchlist error:", error);
        return NextResponse.json({ error: "Failed to create stock" }, { status: 500 });
    }
}

// PUT: 銘柄更新
export async function PUT(request: NextRequest) {
    try {
        await initializeDatabase();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const body = await request.json();
        const stock = await updateWatchlist(parseInt(id), body);

        if (!stock) {
            return NextResponse.json({ error: "Stock not found" }, { status: 404 });
        }

        return NextResponse.json(stock);
    } catch (error) {
        console.error("PUT /api/watchlist error:", error);
        return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
    }
}

// DELETE: 銘柄削除
export async function DELETE(request: NextRequest) {
    try {
        await initializeDatabase();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const success = await deleteWatchlist(parseInt(id));

        if (!success) {
            return NextResponse.json({ error: "Stock not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/watchlist error:", error);
        return NextResponse.json({ error: "Failed to delete stock" }, { status: 500 });
    }
}
