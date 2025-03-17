import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript', filename }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Detect language from filename if provided
  useEffect(() => {
    if (filename) {
      const extension = filename.split('.').pop()?.toLowerCase();
      if (extension) {
        // Map file extensions to Prism language
        const extensionMap: Record<string, string> = {
          'js': 'javascript',
          'ts': 'typescript',
          'jsx': 'jsx',
          'tsx': 'tsx',
          'css': 'css',
          'py': 'python',
          'sh': 'bash',
          'json': 'json',
          'md': 'markdown',
          'sql': 'sql',
          'go': 'go',
          'rs': 'rust',
          'java': 'java',
          'c': 'c',
          'cpp': 'cpp',
          'h': 'c',
          'hpp': 'cpp',
        };
        
        if (extension in extensionMap) {
          language = extensionMap[extension];
        }
      }
    }
  }, [filename]);
  
  return (
    <div className="relative group rounded-md overflow-hidden my-2 bg-gray-950 dark:bg-gray-900">
      {filename && (
        <div className="px-4 py-2 bg-gray-900 dark:bg-gray-800 text-gray-200 text-sm font-mono border-b border-gray-800">
          {filename}
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 p-2 rounded bg-gray-800 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600"
          aria-label="Copy code"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <pre className="!m-0 p-4 overflow-x-auto">
          <code ref={codeRef} className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock; 