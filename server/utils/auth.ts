import crypto from "crypto";

/**
 * Generate a random password with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
 * @param length Length of the password (default: 12)
 * @returns Random password string
 */
export function generateRandomPassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each type
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to randomize the position of guaranteed characters
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generate a secure random onboarding token
 * @returns Random hex string (32 bytes = 64 hex characters)
 */
export function generateOnboardingToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate the plan price in euros
 * Updated pricing: Basic €12,95 / Pro €24,00
 * @param plan Plan name (basic or pro)
 * @returns Price as string in format "12.95" or "24.00"
 */
export function getPlanPrice(plan: string): string {
  return plan === "pro" ? "24.00" : "12.95";
}

/**
 * Generate a unique affiliate referral code
 * Format: OR-XXXXXX (6 uppercase alphanumeric characters)
 * @returns Referral code string
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
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
