/**
 * Generates a UUID v4 string
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
  // Simple UUID generation that doesn't rely on crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 