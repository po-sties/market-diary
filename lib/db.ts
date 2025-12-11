import { createClient, Client } from "@libsql/client";

// Tursoデータベースクライアント（シングルトン）
let client: Client | null = null;

export function getDb(): Client {
    if (!client) {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url) {
            throw new Error("TURSO_DATABASE_URL is not set");
        }

        client = createClient({
            url,
            authToken,
        });
    }
    return client;
}

// テーブル初期化（アプリ起動時に実行）
export async function initializeDatabase(): Promise<void> {
    const db = getDb();

    // watchlistテーブル
    await db.execute(`
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            name TEXT NOT NULL,
            exchange TEXT,
            category TEXT NOT NULL,
            tags TEXT NOT NULL,
            thesis TEXT NOT NULL,
            risk TEXT,
            notes TEXT,
            conviction INTEGER,
            positionSize TEXT,
            addedDate TEXT NOT NULL,
            status TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // diaryテーブル
    await db.execute(`
        CREATE TABLE IF NOT EXISTS diary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            ticker TEXT,
            broker TEXT,
            quantity REAL,
            price REAL,
            currency TEXT,
            content TEXT NOT NULL,
            tags TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Watchlist型定義
export interface WatchlistRecord {
    id: number;
    ticker: string;
    name: string;
    exchange: string | null;
    category: string;
    tags: string;
    thesis: string;
    risk: string | null;
    notes: string | null;
    conviction: number | null;
    positionSize: string | null;
    addedDate: string;
    status: string | null;
    createdAt: string;
    updatedAt: string;
}

// Diary型定義
export interface DiaryRecord {
    id: number;
    date: string;
    type: "buy" | "sell" | "note";
    ticker: string | null;
    broker: string | null;
    quantity: number | null;
    price: number | null;
    currency: string | null;
    content: string;
    tags: string | null;
    createdAt: string;
    updatedAt: string;
}

// Row型からWatchlistRecordへの変換
function rowToWatchlist(row: Record<string, unknown>): WatchlistRecord {
    return {
        id: row.id as number,
        ticker: row.ticker as string,
        name: row.name as string,
        exchange: row.exchange as string | null,
        category: row.category as string,
        tags: row.tags as string,
        thesis: row.thesis as string,
        risk: row.risk as string | null,
        notes: row.notes as string | null,
        conviction: row.conviction as number | null,
        positionSize: row.positionSize as string | null,
        addedDate: row.addedDate as string,
        status: row.status as string | null,
        createdAt: row.createdAt as string,
        updatedAt: row.updatedAt as string,
    };
}

// Row型からDiaryRecordへの変換
function rowToDiary(row: Record<string, unknown>): DiaryRecord {
    return {
        id: row.id as number,
        date: row.date as string,
        type: row.type as "buy" | "sell" | "note",
        ticker: row.ticker as string | null,
        broker: row.broker as string | null,
        quantity: row.quantity as number | null,
        price: row.price as number | null,
        currency: row.currency as string | null,
        content: row.content as string,
        tags: row.tags as string | null,
        createdAt: row.createdAt as string,
        updatedAt: row.updatedAt as string,
    };
}

// ===== Watchlist CRUD =====

export async function getAllWatchlist(options?: {
    category?: string;
    status?: string;
    search?: string;
}): Promise<WatchlistRecord[]> {
    const db = getDb();
    let sql = "SELECT * FROM watchlist WHERE 1=1";
    const params: string[] = [];

    if (options?.category) {
        sql += " AND category = ?";
        params.push(options.category);
    }
    if (options?.status) {
        sql += " AND status = ?";
        params.push(options.status);
    }
    if (options?.search) {
        sql += " AND (ticker LIKE ? OR name LIKE ?)";
        params.push(`%${options.search}%`, `%${options.search}%`);
    }

    sql += " ORDER BY addedDate DESC, id DESC";

    const result = await db.execute({ sql, args: params });
    return result.rows.map((row) => rowToWatchlist(row as unknown as Record<string, unknown>));
}

export async function getWatchlistById(id: number): Promise<WatchlistRecord | undefined> {
    const db = getDb();
    const result = await db.execute({
        sql: "SELECT * FROM watchlist WHERE id = ?",
        args: [id],
    });
    if (result.rows.length === 0) return undefined;
    return rowToWatchlist(result.rows[0] as unknown as Record<string, unknown>);
}

export async function getWatchlistByTicker(ticker: string): Promise<WatchlistRecord | undefined> {
    const db = getDb();
    const result = await db.execute({
        sql: "SELECT * FROM watchlist WHERE ticker = ?",
        args: [ticker],
    });
    if (result.rows.length === 0) return undefined;
    return rowToWatchlist(result.rows[0] as unknown as Record<string, unknown>);
}

export async function createWatchlist(data: {
    ticker: string;
    name: string;
    exchange?: string | null;
    category: string;
    tags: string;
    thesis: string;
    risk?: string | null;
    notes?: string | null;
    conviction?: number | null;
    positionSize?: string | null;
    addedDate: string;
    status?: string | null;
}): Promise<WatchlistRecord> {
    const db = getDb();
    const now = new Date().toISOString();

    const result = await db.execute({
        sql: `INSERT INTO watchlist (ticker, name, exchange, category, tags, thesis, risk, notes, conviction, positionSize, addedDate, status, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            data.ticker,
            data.name,
            data.exchange || null,
            data.category,
            data.tags,
            data.thesis,
            data.risk || null,
            data.notes || null,
            data.conviction ?? null,
            data.positionSize || null,
            data.addedDate,
            data.status || null,
            now,
            now,
        ],
    });

    const id = Number(result.lastInsertRowid);
    const record = await getWatchlistById(id);
    if (!record) {
        throw new Error("Failed to create watchlist record");
    }
    return record;
}

export async function updateWatchlist(id: number, data: Partial<Omit<WatchlistRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<WatchlistRecord | undefined> {
    const db = getDb();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const args: unknown[] = [];

    if (data.ticker !== undefined) { fields.push("ticker = ?"); args.push(data.ticker); }
    if (data.name !== undefined) { fields.push("name = ?"); args.push(data.name); }
    if (data.exchange !== undefined) { fields.push("exchange = ?"); args.push(data.exchange); }
    if (data.category !== undefined) { fields.push("category = ?"); args.push(data.category); }
    if (data.tags !== undefined) { fields.push("tags = ?"); args.push(data.tags); }
    if (data.thesis !== undefined) { fields.push("thesis = ?"); args.push(data.thesis); }
    if (data.risk !== undefined) { fields.push("risk = ?"); args.push(data.risk); }
    if (data.notes !== undefined) { fields.push("notes = ?"); args.push(data.notes); }
    if (data.conviction !== undefined) { fields.push("conviction = ?"); args.push(data.conviction); }
    if (data.positionSize !== undefined) { fields.push("positionSize = ?"); args.push(data.positionSize); }
    if (data.addedDate !== undefined) { fields.push("addedDate = ?"); args.push(data.addedDate); }
    if (data.status !== undefined) { fields.push("status = ?"); args.push(data.status); }

    fields.push("updatedAt = ?");
    args.push(now);
    args.push(id);

    await db.execute({
        sql: `UPDATE watchlist SET ${fields.join(", ")} WHERE id = ?`,
        args,
    });

    return getWatchlistById(id);
}

export async function deleteWatchlist(id: number): Promise<boolean> {
    const db = getDb();
    const result = await db.execute({
        sql: "DELETE FROM watchlist WHERE id = ?",
        args: [id],
    });
    return result.rowsAffected > 0;
}

// ===== Diary CRUD =====

export async function getAllDiary(options?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    ticker?: string;
}): Promise<DiaryRecord[]> {
    const db = getDb();
    let sql = "SELECT * FROM diary WHERE 1=1";
    const params: string[] = [];

    if (options?.startDate) {
        sql += " AND date >= ?";
        params.push(options.startDate);
    }
    if (options?.endDate) {
        sql += " AND date <= ?";
        params.push(options.endDate);
    }
    if (options?.type) {
        sql += " AND type = ?";
        params.push(options.type);
    }
    if (options?.ticker) {
        sql += " AND ticker = ?";
        params.push(options.ticker);
    }

    sql += " ORDER BY date DESC, id DESC";

    const result = await db.execute({ sql, args: params });
    return result.rows.map((row) => rowToDiary(row as unknown as Record<string, unknown>));
}

export async function getDiaryById(id: number): Promise<DiaryRecord | undefined> {
    const db = getDb();
    const result = await db.execute({
        sql: "SELECT * FROM diary WHERE id = ?",
        args: [id],
    });
    if (result.rows.length === 0) return undefined;
    return rowToDiary(result.rows[0] as unknown as Record<string, unknown>);
}

export async function createDiary(data: {
    date: string;
    type: "buy" | "sell" | "note";
    ticker?: string | null;
    broker?: string | null;
    quantity?: number | null;
    price?: number | null;
    currency?: string | null;
    content: string;
    tags?: string | null;
}): Promise<DiaryRecord> {
    const db = getDb();
    const now = new Date().toISOString();

    const result = await db.execute({
        sql: `INSERT INTO diary (date, type, ticker, broker, quantity, price, currency, content, tags, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            data.date,
            data.type,
            data.ticker || null,
            data.broker || null,
            data.quantity ?? null,
            data.price ?? null,
            data.currency || null,
            data.content,
            data.tags || null,
            now,
            now,
        ],
    });

    const id = Number(result.lastInsertRowid);
    const record = await getDiaryById(id);
    if (!record) {
        throw new Error("Failed to create diary record");
    }
    return record;
}

export async function updateDiary(id: number, data: Partial<Omit<DiaryRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DiaryRecord | undefined> {
    const db = getDb();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const args: unknown[] = [];

    if (data.date !== undefined) { fields.push("date = ?"); args.push(data.date); }
    if (data.type !== undefined) { fields.push("type = ?"); args.push(data.type); }
    if (data.ticker !== undefined) { fields.push("ticker = ?"); args.push(data.ticker); }
    if (data.broker !== undefined) { fields.push("broker = ?"); args.push(data.broker); }
    if (data.quantity !== undefined) { fields.push("quantity = ?"); args.push(data.quantity); }
    if (data.price !== undefined) { fields.push("price = ?"); args.push(data.price); }
    if (data.currency !== undefined) { fields.push("currency = ?"); args.push(data.currency); }
    if (data.content !== undefined) { fields.push("content = ?"); args.push(data.content); }
    if (data.tags !== undefined) { fields.push("tags = ?"); args.push(data.tags); }

    fields.push("updatedAt = ?");
    args.push(now);
    args.push(id);

    await db.execute({
        sql: `UPDATE diary SET ${fields.join(", ")} WHERE id = ?`,
        args,
    });

    return getDiaryById(id);
}

export async function deleteDiary(id: number): Promise<boolean> {
    const db = getDb();
    const result = await db.execute({
        sql: "DELETE FROM diary WHERE id = ?",
        args: [id],
    });
    return result.rowsAffected > 0;
}

// ===== Batch Operations =====

export async function createWatchlistBatch(records: Array<{
    ticker: string;
    name: string;
    exchange?: string | null;
    category: string;
    tags: string;
    thesis: string;
    risk?: string | null;
    notes?: string | null;
    conviction?: number | null;
    positionSize?: string | null;
    addedDate: string;
    status?: string | null;
}>): Promise<number> {
    const db = getDb();
    const now = new Date().toISOString();

    let created = 0;
    for (const data of records) {
        try {
            await db.execute({
                sql: `INSERT OR REPLACE INTO watchlist (ticker, name, exchange, category, tags, thesis, risk, notes, conviction, positionSize, addedDate, status, createdAt, updatedAt)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    data.ticker,
                    data.name,
                    data.exchange || null,
                    data.category,
                    data.tags,
                    data.thesis,
                    data.risk || null,
                    data.notes || null,
                    data.conviction ?? null,
                    data.positionSize || null,
                    data.addedDate,
                    data.status || null,
                    now,
                    now,
                ],
            });
            created++;
        } catch (error) {
            console.error(`Failed to insert watchlist ${data.ticker}:`, error);
        }
    }

    return created;
}

export async function createDiaryBatch(records: Array<{
    date: string;
    type: "buy" | "sell" | "note";
    ticker?: string | null;
    broker?: string | null;
    quantity?: number | null;
    price?: number | null;
    currency?: string | null;
    content: string;
    tags?: string | null;
}>): Promise<number> {
    const db = getDb();
    const now = new Date().toISOString();

    let created = 0;
    for (const data of records) {
        try {
            await db.execute({
                sql: `INSERT INTO diary (date, type, ticker, broker, quantity, price, currency, content, tags, createdAt, updatedAt)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    data.date,
                    data.type,
                    data.ticker || null,
                    data.broker || null,
                    data.quantity ?? null,
                    data.price ?? null,
                    data.currency || null,
                    data.content,
                    data.tags || null,
                    now,
                    now,
                ],
            });
            created++;
        } catch (error) {
            console.error(`Failed to insert diary:`, error);
        }
    }

    return created;
}
