import { AES, enc } from 'crypto-js';
import CryptoJS from 'crypto-js';

// We'll use a combination of server-side and client-side encryption
// Server-side key will be managed through secure environment variables
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

// Get encryption key from environment variable
const clientEncryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key';

export const encryptionService = {
  // Encrypt sensitive data
  encrypt(data: any): string {
    if (!data) return '';
    
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    return AES.encrypt(stringData, ENCRYPTION_KEY!).toString();
  },

  // Decrypt sensitive data
  decrypt(encryptedData: string): any {
    if (!encryptedData) return null;
    
    try {
      const decrypted = AES.decrypt(encryptedData, ENCRYPTION_KEY!).toString(enc.Utf8);
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  },

  // Encrypt an object's specific fields
  encryptFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: (keyof T)[]
  ): T {
    const encrypted = { ...data };
    for (const field of sensitiveFields) {
      if (data[field]) {
        encrypted[field] = this.encrypt(data[field]);
      }
    }
    return encrypted;
  },

  // Decrypt an object's specific fields
  decryptFields<T extends Record<string, any>>(
    data: T,
    sensitiveFields: (keyof T)[]
  ): T {
    const decrypted = { ...data };
    for (const field of sensitiveFields) {
      if (data[field]) {
        decrypted[field] = this.decrypt(data[field]);
      }
    }
    return decrypted;
  },
};

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, clientEncryptionKey).toString();
}

export function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, clientEncryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Function to generate a new encryption key (for admin use)
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

// Utility function to test if encryption is working
export function testEncryption(text: string): boolean {
  try {
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);
    return text === decrypted;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
} 