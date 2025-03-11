import React, { useState, useEffect } from 'react';
import { usePromptStore } from '../../stores/promptStore';
import { encrypt, decrypt, testEncryption, generateEncryptionKey } from '../../services/encryption';

interface Props {
  isAdmin: boolean;
}

export default function ProprietaryPromptManager({ isAdmin }: Props) {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [contextPrompt, setContextPrompt] = useState('');
  const [responseFormat, setResponseFormat] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { proprietaryPrompt, updatePrompt, isInitialized } = usePromptStore();

  useEffect(() => {
    if (isInitialized && isAdmin) {
      setSystemPrompt(proprietaryPrompt.systemPrompt);
      setContextPrompt(proprietaryPrompt.contextPrompt);
      setResponseFormat(proprietaryPrompt.responseFormat);
    }
  }, [isInitialized, isAdmin, proprietaryPrompt]);

  if (!isAdmin) {
    return null;
  }

  const handleSave = async () => {
    try {
      setStatus('saving');
      setErrorMessage('');

      // Test encryption before saving
      if (!testEncryption('test')) {
        throw new Error('Encryption system is not working properly');
      }

      // Update the prompt
      await updatePrompt({
        systemPrompt,
        contextPrompt,
        responseFormat
      });

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save prompt:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save prompt');
    }
  };

  const handleGenerateKey = () => {
    const newKey = generateEncryptionKey();
    // Display the key in a secure way (e.g., modal or secure clipboard)
    console.log('New encryption key generated:', newKey);
  };

  return (
    <div className="p-6 space-y-6 bg-[var(--background)] rounded-lg border border-[var(--border)]">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Proprietary Prompt Manager</h2>
        <p className="text-[var(--muted-foreground)]">
          Configure your proprietary prompts securely. These will be encrypted before storage.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full h-32 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] 
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Enter your system prompt..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Context Prompt
          </label>
          <textarea
            value={contextPrompt}
            onChange={(e) => setContextPrompt(e.target.value)}
            className="w-full h-32 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Enter your context prompt..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Response Format
          </label>
          <textarea
            value={responseFormat}
            onChange={(e) => setResponseFormat(e.target.value)}
            className="w-full h-32 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Enter your response format..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'saving' ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          onClick={handleGenerateKey}
          className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg 
                   hover:bg-[var(--muted)]/80"
        >
          Generate New Encryption Key
        </button>
      </div>

      {status === 'success' && (
        <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
          Changes saved successfully!
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
          {errorMessage || 'An error occurred while saving changes'}
        </div>
      )}
    </div>
  );
} 