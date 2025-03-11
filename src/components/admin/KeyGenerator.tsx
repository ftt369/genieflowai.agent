import React from 'react';
import { generateAndShowKey } from '../../utils/keyGenerator';

export default function KeyGenerator() {
  const handleGenerateKey = () => {
    const key = generateAndShowKey();
    
    // Show the key in the UI
    alert(`Your new encryption key (save this securely):\n\n${key}\n\nMake sure to copy this and store it safely!`);
  };

  return (
    <div className="p-4 border border-[var(--border)] rounded-lg">
      <h3 className="text-lg font-medium mb-4">Encryption Key Management</h3>
      <button
        onClick={handleGenerateKey}
        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
      >
        Generate New Encryption Key
      </button>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Warning: Generating a new key will require re-encrypting any stored prompts
      </p>
    </div>
  );
} 