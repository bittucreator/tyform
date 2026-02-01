/**
 * Short ID generator for forms
 * Generates URL-friendly short IDs like "wkOeRd", "x7Np2Q"
 */

// Characters to use (alphanumeric, excluding similar-looking chars like 0/O, 1/l/I)
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'
const ID_LENGTH = 6

/**
 * Generate a random short ID
 */
export function generateShortId(length: number = ID_LENGTH): string {
  let result = ''
  const alphabetLength = ALPHABET.length
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabetLength)
    result += ALPHABET[randomIndex]
  }
  
  return result
}

/**
 * Validate if a string is a valid short ID format
 */
export function isValidShortId(id: string): boolean {
  if (!id || id.length < 4 || id.length > 12) return false
  
  // Check if all characters are in our alphabet
  for (const char of id) {
    if (!ALPHABET.includes(char)) return false
  }
  
  return true
}

/**
 * Check if a string looks like a UUID (to distinguish from short IDs)
 */
export function isUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}
