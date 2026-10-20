import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");

  await pool.query(`
        CREATE TABLE IF NOT EXISTS documents(
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL, 
            content TEXT NOT NULL,
            embedding VECTOR(768) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    console.log("Database and documents table are ready.");
}
