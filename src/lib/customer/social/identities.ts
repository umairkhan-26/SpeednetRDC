import type { RowDataPacket } from "mysql2/promise";
import { getPool, toMySQLDateTime } from "@/lib/staff/db";
import type { SocialProvider } from "./providers";

// customer_identities: a Google or Apple account whose owner proved, by an
// emailed link, which address their orders use. Written only then.

export async function findLinkedEmail(provider: SocialProvider, subject: string): Promise<string | null> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { email: string })[]>(
    "SELECT email FROM customer_identities WHERE provider = ? AND subject = ?",
    [provider, subject]
  );
  return rows[0]?.email ?? null;
}

export async function linkIdentity(provider: SocialProvider, subject: string, email: string): Promise<void> {
  const pool = await getPool();
  await pool.query(
    "INSERT INTO customer_identities (provider, subject, email, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email)",
    [provider, subject, email, toMySQLDateTime(new Date())]
  );
}
