import crypto from "crypto";

function cryptoRandInt(max: number): number {
  return crypto.randomInt(0, max);
}

/**
 * Generate a cryptographically secure random password.
 * Uses crypto.randomInt — NOT Math.random.
 */
export function generateRandomPassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + special;

  const chars: string[] = [
    uppercase[cryptoRandInt(uppercase.length)],
    lowercase[cryptoRandInt(lowercase.length)],
    numbers[cryptoRandInt(numbers.length)],
    special[cryptoRandInt(special.length)],
  ];

  for (let i = chars.length; i < length; i++) {
    chars.push(allChars[cryptoRandInt(allChars.length)]);
  }

  // Fisher-Yates shuffle using crypto
  for (let i = chars.length - 1; i > 0; i--) {
    const j = cryptoRandInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

/**
 * Generate a secure random onboarding token
 * @returns Random hex string (32 bytes = 64 hex characters)
 */
export function generateOnboardingToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate the plan price in euros (incl. 21% BTW)
 * Excl. BTW: Basis €14,95 / Pro €59,00
 * Incl. BTW: Basis €18,09 / Pro €71,39
 * Mollie rekent altijd incl. BTW af; frontend toont excl. BTW.
 * @param plan Plan name (basic or pro)
 * @returns Price as string incl. BTW, e.g. "18.09" or "71.39"
 */
export function getPlanPrice(plan: string): string {
  if (plan === "pro" || plan === "coaching") return "71.39";
  return "18.09";
}

/**
 * Generate a unique affiliate referral code
 * Format: OR-XXXXXX (6 uppercase alphanumeric characters)
 * @returns Referral code string
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `OR-${code}`;
}

/**
 * Get the plan name in a readable format
 * @param plan Plan name (basic or pro)
 * @returns Readable plan name
 */
export function getPlanDisplayName(plan: string): string {
  return plan === "pro" ? "OpenRegio Pro" : "OpenRegio Basic";
}
