import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Check if DATABASE_URL is set
const DATABASE_URL = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle> | null = null;

if (DATABASE_URL) {
  try {
    // Disable prefetch as it is not supported for "Transaction" pool mode
    const client = postgres(DATABASE_URL, { prepare: false });
    db = drizzle(client, { schema });
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Helper function to check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!DATABASE_URL && !!db;
}

// Helper function to get database or throw error
export function getDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is not configured. Please set DATABASE_URL in your environment variables.");
  }
  return db!;
}

// Export db for backward compatibility (but prefer using getDatabase())
export { db };
