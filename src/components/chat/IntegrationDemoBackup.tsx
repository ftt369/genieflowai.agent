import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import CitationPopover from './CitationPopover';
import ChatExport from './ChatExport';
import KeyboardShortcuts from './KeyboardShortcuts';
import AttachmentPreview from './AttachmentPreview';
import { DocumentProcessingError, withErrorHandling, showErrorToast } from '@/utils/errorHandling';

/**
 * This is a demo component showing how to integrate all five improvements:
 * 1. Enhanced File Preview
 * 2. Message Citation
 * 3. Chat Export Options
 * 4. Keyboard Shortcuts
 * 5. Error Handling
 */
const IntegrationDemo: React.FC = () => {
  // State for demo
  const [showExport, setShowExport] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', role: 'user', content: 'What is traumatic brain injury?' },
    { 
      id: '2', 
      role: 'assistant', 
      content: 'Traumatic brain injury (TBI) is a disruption in normal brain function caused by a bump, blow, or jolt to the head. According to [[citation:doc123|Advanced Imaging of TBI|5|Traumatic brain injury (TBI) remains a significant cause of mortality and morbidity worldwide]], it is a major cause of death and disability.' 
    }
  ]);

  // Mock attachment for demo
  const attachment = {
    id: 'attach1',
    name: 'Advanced Imaging of TBI.pdf',
    url: '#',
    thumbnailUrl: '',
    type: 'document',
    size: 2306774,
    mimeType: 'application/pdf',
    metadata: {
      pageCount: 20,
      contentLength: 45428
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in input/textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + K for keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // Ctrl/Cmd + E for export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowExport(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Export handlers
  const handleCopy = () => {
    const formattedMessages = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    navigator.clipboard.writeText(formattedMessages);
  };

  const handleDownload = (format: string) => {
    // Implementation for different export formats
    let content = '';
    let mimeType = '';
    let filename = `Chat-${new Date().toISOString().slice(0, 10)}`;
    
    if (format === 'markdown') {
      content = messages.map(msg => 
        `## ${msg.role === 'user' ? 'User' : 'Assistant'}\n\n${msg.content}`
      ).join('\n\n---\n\n');
      mimeType = 'text/markdown';
      filename += '.md';
    } else if (format === 'json') {
      content = JSON.stringify({
        title: 'Demo Chat',
        date: new Date().toISOString(),
        messages
      }, null, 2);
      mimeType = 'application/json';
      filename += '.json';
    } else if (format === 'html') {
      content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Chat Export</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; }
            .message { padding: 10px; margin-bottom: 10px; border-radius: 8px; }
            .user { background-color: #f0f0f0; }
            .assistant { background-color: #e6f3ff; }
          </style>
        </head>
        <body>
          <h1>Chat Export</h1>
          ${messages.map(msg => `
            <div class="message ${msg.role}">
              <strong>${msg.role === 'user' ? 'You' : 'Assistant'}</strong>
              <p>${msg.content.replace(/\n/g, '<br>')}</p>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      mimeType = 'text/html';
      filename += '.html';
    }
    
    // For demo, just log the content
    console.log(`Exporting in ${format} format: ${content.substring(0, 100)}...`);
    
    // In a real implementation, you would download the file
    // const blob = new Blob([content], { type: mimeType });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = filename;
    // a.click();
    // URL.revokeObjectURL(url);
  };

  // Error handling example
  const handleTestError = async () => {
    try {
      await withErrorHandling(async () => {
        throw new DocumentProcessingError({
          type: 'document_too_large',
          message: 'Document is too large to process.',
          suggestion: 'Try uploading a smaller file or splitting the content.',
          retryable: false
        });
      });
    } catch (error) {
      console.error('Error caught in test:', error);
    }
  };

  // Render citation text with popover
  const renderWithCitations = (text: string) => {
    return text.split(/(\[\[citation:[^\]]+\]\])/).map((part, i) => {
      if (part.startsWith('[[citation:')) {
        // Extract citation data
        const citationData = part.substring(11, part.length - 2);
        const [docId, docName, page, text] = citationData.split('|');
        
        return (
          <CitationPopover
            key={i}
            citation={{
              documentId: docId,
              documentName: docName,
              page: page ? parseInt(page) : undefined,
              text: text,
              confidence: 0.87
            }}
          >
            <span className="underline decoration-dotted cursor-pointer">{text}</span>
          </CitationPopover>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Integration Demo</h1>
      
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">1. Enhanced File Preview</h2>
        <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
          <AttachmentPreview attachment={attachment} />
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">2. Message Citation</h2>
        <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col gap-4">
            {messages.map(message => (
              <div key={message.id} className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-700/30'}`}>
                <div className="font-medium mb-2">{message.role === 'user' ? 'You' : 'Assistant'}</div>
                <div className="text-sm">
                  {renderWithCitations(message.content)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">3-4. Export & Keyboard Shortcuts</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowExport(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export Chat
          </button>
          <button 
            onClick={() => setShowKeyboardShortcuts(true)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Keyboard Shortcuts
          </button>
          <p className="text-sm text-gray-500 italic mt-2">
            You can also press Ctrl/Cmd+E for export and Ctrl/Cmd+K for keyboard shortcuts
          </p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">5. Error Handling</h2>
        <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
          <button 
            onClick={handleTestError}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Error Handling
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Click to simulate an error with proper handling and a toast notification
          </p>
        </div>
      </div>
      
      {/* Modals */}
      {showExport && (
        <ChatExport
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          messages={messages}
          title="Demo Chat"
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      )}
      
      {showKeyboardShortcuts && (
        <KeyboardShortcuts
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      )}
      
      {/* Toast container for notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default IntegrationDemo; 