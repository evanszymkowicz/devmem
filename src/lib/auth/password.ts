import bcrypt from "bcryptjs";

// Centralized bcrypt cost factor so hashing stays consistent across the app
// (registration, future password changes). Coding standards require >= 14.
export const BCRYPT_COST_FACTOR = 14;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
