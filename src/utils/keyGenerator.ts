import { generateEncryptionKey } from '../services/encryption';

export function generateAndShowKey() {
  const newKey = generateEncryptionKey();
  
  // Show the key in a secure format
  console.log('Your new encryption key (save this securely):', newKey);
  
  return newKey;
} 