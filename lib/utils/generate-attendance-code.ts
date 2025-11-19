/**
 * Generate a unique 4-digit attendance code for students
 * This code is used for self-service attendance check-in
 */

/**
 * Generate a random 4-digit code (1000-9999)
 * @returns A 4-digit string
 */
export function generateAttendanceCode(): string {
  // Generate random number between 1000 and 9999
  const code = Math.floor(1000 + Math.random() * 9000)
  return code.toString()
}

/**
 * Check if an attendance code is already in use
 * @param code - The code to check
 * @param existingCodes - Array of existing codes in the system
 * @returns true if the code is unique, false otherwise
 */
export function isCodeUnique(code: string, existingCodes: string[]): boolean {
  return !existingCodes.includes(code)
}

/**
 * Generate a unique attendance code that doesn't exist in the system
 * @param existingCodes - Array of existing codes
 * @param maxAttempts - Maximum number of generation attempts (default: 100)
 * @returns A unique 4-digit code
 * @throws Error if unable to generate unique code after maxAttempts
 */
export function generateUniqueAttendanceCode(
  existingCodes: string[],
  maxAttempts: number = 100
): string {
  let attempts = 0
  let code: string

  do {
    code = generateAttendanceCode()
    attempts++

    if (attempts >= maxAttempts) {
      throw new Error(
        `Unable to generate unique attendance code after ${maxAttempts} attempts. ` +
        `Total existing codes: ${existingCodes.length}. ` +
        `Consider migrating to a 5-digit system if approaching 9000 students.`
      )
    }
  } while (!isCodeUnique(code, existingCodes))

  return code
}

/**
 * Validate an attendance code format
 * @param code - The code to validate
 * @returns true if valid (4 digits), false otherwise
 */
export function isValidAttendanceCode(code: string): boolean {
  return /^\d{4}$/.test(code)
}
