// Emergency admin recovery when you're locked out and email isn't working
// (or isn't set up yet). Needs no database connection and no email: it
// prints SQL to paste into phpMyAdmin (Hostinger > Databases > phpMyAdmin >
// your database > SQL) and the one-time link that SQL activates.
//
// Run with: npm run admin:recovery-link -- <your admin email> [site URL]
// (the site URL defaults to https://speednetrdc.com)
//
// The SQL stores only a SHA-256 of the link's token, so the SQL itself is
// harmless; the printed LINK is the secret — open it yourself, don't share
// it. It works once and expires 1 hour after you run the SQL. The SQL also
// clears all sign-in rate limits, in case repeated wrong passwords are what
// locked you out. It never sets or prints a password: you choose a new one
// on the link's page.
import { createHash, randomBytes } from "node:crypto";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!/^[^\s@'"\\]+@[^\s@'"\\]+\.[^\s@'"\\]+$/.test(email)) {
  console.error("Usage: npm run admin:recovery-link -- <your admin email> [site URL, default https://speednetrdc.com]");
  process.exit(1);
}

const token = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(token).digest("hex");
const appUrl = (process.argv[3] || "https://speednetrdc.com").replace(/\/$/, "");

console.log("1. Paste this into phpMyAdmin's SQL tab for the SpeedNetRDC database and run it:\n");
console.log(`INSERT INTO staff_tokens (staff_id, purpose, token_hash, new_email, expires_at, created_at)
  SELECT id, 'password_reset', '${tokenHash}', NULL, UTC_TIMESTAMP() + INTERVAL 1 HOUR, UTC_TIMESTAMP()
  FROM staff_members WHERE email = '${email}' AND deactivated_at IS NULL;
DELETE FROM auth_rate_limits;`);
console.log(`\n   It should report "1 row inserted". 0 rows means no active account uses ${email}.`);
console.log("\n2. Within the hour, open this link yourself and choose a new password (it works once):\n");
console.log(`${appUrl}/admin/set-password?token=${token}`);
