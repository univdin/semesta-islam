/**
 * SEMESTA ISLAM — Private Document & Security Helper Utilities
 * Governed by docs/08_SECURITY_COMPLIANCE.md & DECISION-04 / DECISION-05
 */

import { Sha256Regex } from '@/lib/validations';

/**
 * Calculates SHA-256 hex fingerprint of an ArrayBuffer in browser or Node.js environment
 */
export async function calculateSha256(buffer: ArrayBuffer): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Server-side Node.js fallback
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
}

/**
 * Verifies if string is valid SHA-256 format
 */
export function isValidSha256(hash: string): boolean {
  return Sha256Regex.test(hash);
}

/**
 * Security Rule: Private document signed URL duration (Default 900 seconds / 15 minutes)
 */
export const SIGNED_URL_EXPIRATION_SECONDS = 900;
