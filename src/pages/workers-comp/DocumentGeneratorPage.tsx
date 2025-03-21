import React, { useState } from 'react';
import DocumentGenerator from '../../components/legal/workers-comp/DocumentGenerator';
import { useModeStore } from '../../stores/model/modeStore';

const DocumentGeneratorPage: React.FC = () => {
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const { modes, setActiveMode } = useModeStore();
  
  // Find workers comp mode
  const workersCompMode = modes.find(mode => mode.id === 'workers_comp_ca');
  
  const handleDocumentGenerated = (content: string) => {
    setGeneratedDocument(content);
    
    // Auto-select Workers' Comp mode if available
    if (workersCompMode) {
      setActiveMode(workersCompMode.id);
    }
  };
  
  const handleDownload = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workers-comp-document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedDocument) return;
    
    navigator.clipboard.writeText(generatedDocument)
      .then(() => {
        alert('Document copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy document: ', err);
      });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">California Workers' Compensation Document Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <DocumentGenerator onTemplateGenerated={handleDocumentGenerated} />
        </div>
        
        <div>
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Generated Document</h2>
            
            {generatedDocument ? (
              <>
                <div className="bg-gray-100 p-4 rounded-md mb-4 font-mono text-sm overflow-auto max-h-[600px]">
                  <pre>{generatedDocument}</pre>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleDownload}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Download Document
                  </button>
                  
                  <button
                    onClick={handleCopyToClipboard}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-100 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This document has been generated based on the information you provided. 
                    Please review it carefully and have it checked by a licensed attorney before filing.
                    You can paste this document into the chat with the CA Workers' Comp Writer AI assistant for 
                    further review and refinement.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No document generated yet. Fill out the form to create a document.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGeneratorPage; 