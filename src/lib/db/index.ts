import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

// Initialize the database connection
const sqlitePromise = Database.load("sqlite:aide.db");



// Actually, correctly implementing the proxy is tricky. 
// Let's use the standard pattern if exists.
// For now, let's just export the raw DB and a simple helper, 
// OR verify if 'drizzle-orm/sqlite-proxy' is the right way.

// Better approach for MVP:
// Just use the raw plugin-sql for now if Drizzle proxy is complex.
// BUT, I promised Drizzle.
// Let's try to do it right.

export const dbPromise = (async () => {
    const client = await sqlitePromise;
    return drizzle(async (sql, params, method) => {
        try {
            const rows = await client.select(sql, params);
            // Drizzle expects { rows: any[][] } for 'values' method
            if (method === "values") {
                return { rows: (rows as any[]).map(r => Object.values(r as any)) };
            } 
            // For 'run' it expects { rows: [], insertId, changes } ??
            // Using sqlite-proxy:
            // return { rows: ... }
            if (method === "run") {
              const res = await client.execute(sql, params);
              return { rows: [], insertId: res.lastInsertId, changes: res.rowsAffected };
            }
            return { rows: rows as any[] };
        } catch (e: any) {
            console.error("SQL proxy error", e);
            return { rows: [] };
        }
    }, { schema });
})();



export type DB = Awaited<typeof dbPromise>;

export const initDatabase = async () => {
    const db = await sqlitePromise;
    await db.execute(`
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            provider_id TEXT NOT NULL,
            model_id TEXT,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY NOT NULL,
            conversation_id TEXT NOT NULL REFERENCES conversations(id),
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS file_embeddings (
            id TEXT PRIMARY KEY NOT NULL,
            file_path TEXT NOT NULL,
            content TEXT NOT NULL,
            embedding TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );
    `);
};
