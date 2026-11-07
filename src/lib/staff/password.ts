import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, KEY_LENGTH);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// A real hash of a random throwaway password: checking a password against
// it costs the same as against a real account, so the time a failed sign-in
// takes doesn't reveal whether the email has an account.
const DUMMY_HASH = hashPassword(randomBytes(16).toString("hex"));

/** Like verifyPassword, but takes the same time when there's no stored hash (unknown email, invite not accepted). */
export function verifyPasswordConstantTime(password: string, storedHash: string | null | undefined): boolean {
  const matches = verifyPassword(password, storedHash || DUMMY_HASH);
  return Boolean(storedHash) && matches;
}

export const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 200;

export type NewPasswordProblem = "tooShort" | "tooLong" | "mismatch";

/** What's wrong with a new password (a key under admin.msg.password), or null if it's acceptable. */
export function checkNewPassword(password: string, confirmation: string): NewPasswordProblem | null {
  if (password.length < MIN_PASSWORD_LENGTH) return "tooShort";
  if (password.length > MAX_PASSWORD_LENGTH) return "tooLong";
  if (password !== confirmation) return "mismatch";
  return null;
}

export const PASSWORD_LIMITS = { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH };
