import { Pool } from "pg";

let _pool: Pool | null = null;
function getPool() {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 10,
    });
  }
  return _pool;
}

export const db = {
  query: (text: string, params?: unknown[]) => getPool().query(text, params),
  getClient: () => getPool().connect(),
};

export default db;
