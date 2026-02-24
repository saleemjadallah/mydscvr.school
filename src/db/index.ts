import { Client } from "pg";

function resolveSsl(connectionString: string | undefined) {
  if (!connectionString) return false;

  let hostname: string | null = null;
  try {
    hostname = new URL(connectionString).hostname;
  } catch {
    hostname = null;
  }

  const sslConfig = {
    rejectUnauthorized: false,
    ...(hostname ? { servername: hostname } : {}),
  };

  if (process.env.PGSSLMODE === "disable" || process.env.DATABASE_SSL === "false") {
    return false;
  }

  if (process.env.PGSSLMODE === "require" || process.env.DATABASE_SSL === "true") {
    return sslConfig;
  }

  try {
    const host = hostname ?? new URL(connectionString).hostname;
    const isLocalHost =
      host === "localhost" || host === "127.0.0.1" || host === "::1";
    return isLocalHost ? false : sslConfig;
  } catch {
    return sslConfig;
  }
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  const ssl = resolveSsl(connectionString);
  return new Client({
    connectionString,
    ssl,
  });
}

function serializeError(error: unknown) {
  const e = error as Record<string, unknown> | null;
  return {
    name: error instanceof Error ? error.name : null,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : null,
    code: e?.code ?? null,
    errno: e?.errno ?? null,
    syscall: e?.syscall ?? null,
    address: e?.address ?? null,
    port: e?.port ?? null,
    detail: e?.detail ?? null,
    hint: e?.hint ?? null,
  };
}

export const db = {
  query: async (text: string, params?: unknown[]) => {
    const client = createClient();
    try {
      await client.connect();
      return await client.query(text, params);
    } catch (error) {
      console.error("[db] Query failed", {
        queryPreview: text.replace(/\s+/g, " ").trim().slice(0, 180),
        paramsCount: params?.length ?? 0,
        error: serializeError(error),
      });
      throw error;
    } finally {
      await client.end().catch((endError: unknown) => {
        console.error("[db] Client end failed", serializeError(endError));
      });
    }
  },
  getClient: async () => {
    try {
      const client = createClient();
      await client.connect();
      return client;
    } catch (error) {
      console.error("[db] Connect failed", serializeError(error));
      throw error;
    }
  },
};

export default db;
