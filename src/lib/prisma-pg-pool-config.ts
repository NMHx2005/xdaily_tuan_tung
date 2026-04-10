import { parse } from "pg-connection-string";
import type { PoolConfig } from "pg";

/**
 * Cấu hình pool cho `@prisma/adapter-pg`.
 * Supabase + Node: đôi khi gặp `self-signed certificate in certificate chain` — đặt
 * `DATABASE_SSL_REJECT_UNAUTHORIZED=false` trong .env (chỉ khi cần; production ưu tiên mạng/CA đúng).
 *
 * Lưu ý: `pg` merge `parse(connectionString)` sau `config`, nên `ssl` cùng object `{ connectionString }`
 * bị ghi đè bởi `sslmode` trong URL. Khi nới lỏng TLS phải dùng object đã parse + ghi đè `ssl` sau cùng.
 */
export function getPrismaPgPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false") {
    return { connectionString };
  }

  const parsed = parse(connectionString) as PoolConfig;
  return {
    ...parsed,
    ssl: { rejectUnauthorized: false },
  };
}
