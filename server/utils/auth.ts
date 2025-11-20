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
 * @param plan Plan name (basic or pro)
 * @returns Price as string in format "9.95" or "19.95"
 */
export function getPlanPrice(plan: string): string {
  return plan === "pro" ? "19.95" : "9.95";
}

/**
 * Get the plan name in a readable format
 * @param plan Plan name (basic or pro)
 * @returns Readable plan name
 */
export function getPlanDisplayName(plan: string): string {
  return plan === "pro" ? "OpenRegio Pro" : "OpenRegio Basic";
}
