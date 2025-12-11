import { NextRequest, NextResponse } from "next/server";
import {
    initializeDatabase,
    getAllDiary,
    getDiaryById,
    createDiary,
    updateDiary,
    deleteDiary
} from "@/lib/db";

// GET: 日記一覧取得
export async function GET(request: NextRequest) {
    try {
        await initializeDatabase();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;
        const type = searchParams.get("type") || undefined;
        const ticker = searchParams.get("ticker") || undefined;

        const diaries = await getAllDiary({ startDate, endDate, type, ticker });
        return NextResponse.json(diaries);
    } catch (error) {
        console.error("GET /api/diary error:", error);
        return NextResponse.json({ error: "Failed to fetch diaries" }, { status: 500 });
    }
}

// POST: 新規日記作成
export async function POST(request: NextRequest) {
    try {
        await initializeDatabase();

        const body = await request.json();
        const diary = await createDiary({
            date: body.date,
            type: body.type,
            ticker: body.ticker,
            broker: body.broker,
            quantity: body.quantity,
            price: body.price,
            currency: body.currency,
            content: body.content,
            tags: body.tags,
        });

        return NextResponse.json(diary, { status: 201 });
    } catch (error) {
        console.error("POST /api/diary error:", error);
        return NextResponse.json({ error: "Failed to create diary" }, { status: 500 });
    }
}

// PUT: 日記更新
export async function PUT(request: NextRequest) {
    try {
        await initializeDatabase();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const body = await request.json();
        const diary = await updateDiary(parseInt(id), body);

        if (!diary) {
            return NextResponse.json({ error: "Diary not found" }, { status: 404 });
        }

        return NextResponse.json(diary);
    } catch (error) {
        console.error("PUT /api/diary error:", error);
        return NextResponse.json({ error: "Failed to update diary" }, { status: 500 });
    }
}

// DELETE: 日記削除
export async function DELETE(request: NextRequest) {
    try {
        await initializeDatabase();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const success = await deleteDiary(parseInt(id));

        if (!success) {
            return NextResponse.json({ error: "Diary not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/diary error:", error);
        return NextResponse.json({ error: "Failed to delete diary" }, { status: 500 });
    }
}
