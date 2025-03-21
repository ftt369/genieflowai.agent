import React, { useState, useRef, useCallback } from 'react';
import { OCRWorkerPool, OCRConfig, OCRResult } from '../services/ocrService';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from './ui/toast';

interface DocumentOCRProps {
  onComplete?: (results: OCRResult[]) => void;
  maxWorkers?: number;
  language?: string;
}

export const DocumentOCR: React.FC<DocumentOCRProps> = ({ 
  onComplete,
  maxWorkers = 4,
  language = 'eng'
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState<OCRResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Logger function to update progress and status
  const updateStatus = useCallback((message: string, percent: number) => {
    setStatusMessage(message);
    setProgress(Math.round(percent * 100));
  }, []);
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setError(null);
      setResults([]);
      setProgress(0);
      setStatusMessage('');
    }
  };
  
  // Process the selected file
  const processFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      setResults([]);
      setProgress(0);
      
      // Determine file type and process accordingly
      if (file.type === 'application/pdf') {
        await processPDF(file);
      } else if (file.type.startsWith('image/')) {
        await processImage(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error processing document',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process PDF file
  const processPDF = async (pdfFile: File) => {
    // Create a PDF.js instance to extract images from PDF pages
    // This part would require integration with PDF.js or similar library
    
    // For now, we'll simulate extracting images from a PDF
    updateStatus('Preparing PDF document...', 0.1);
    
    // Read the file as an array buffer
    const fileData = await readFileAsArrayBuffer(pdfFile);
    
    // Convert PDF pages to images (this would use PDF.js in a real implementation)
    const pageImages = await simulateExtractPDFPages(fileData, 5); // Simulate 5 pages
    
    // Process the page images with OCR
    await processPageImages(pageImages);
  };
  
  // Process image file
  const processImage = async (imageFile: File) => {
    updateStatus('Reading image...', 0.1);
    
    // Read the file as data URL
    const imageData = await readFileAsDataURL(imageFile);
    
    // Process the single image with OCR
    await processPageImages([imageData]);
  };
  
  // Process page images with OCR workers
  const processPageImages = async (pageImages: string[]) => {
    updateStatus(`Initializing OCR workers (0/${pageImages.length} pages)...`, 0.2);
    
    // Create OCR configuration
    const config: OCRConfig = {
      language,
      workerCount: Math.min(maxWorkers, navigator.hardwareConcurrency || 4),
      logger: (message, progress) => {
        updateStatus(message, 0.2 + (progress * 0.8)); // Scale progress to 20%-100%
      }
    };
    
    // Create worker pool and process document
    const workerPool = new OCRWorkerPool(config);
    const ocrResults = await workerPool.processDocument(pageImages);
    await workerPool.terminate();
    
    // Sort results by page number
    const sortedResults = [...ocrResults].sort((a, b) => a.pageNumber - b.pageNumber);
    
    // Update state with results
    setResults(sortedResults);
    
    // Call completion callback if provided
    if (onComplete) {
      onComplete(sortedResults);
    }
    
    toast({
      title: 'OCR Processing Complete',
      description: `Successfully processed ${pageImages.length} pages`,
      variant: 'default'
    });
  };
  
  // Helper function to read file as array buffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };
  
  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };
  
  // Simulate extracting pages from a PDF (would use PDF.js in reality)
  const simulateExtractPDFPages = async (fileData: ArrayBuffer, pageCount: number): Promise<string[]> => {
    // This is just a placeholder for demonstration
    // In a real implementation, you would use PDF.js to render each page
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const pageImages: string[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      // Simulate page extraction delay
      await delay(200);
      updateStatus(`Extracting page ${i + 1}/${pageCount}...`, 0.1 + (i / pageCount) * 0.1);
      
      // In reality, this would be an actual page image
      pageImages.push(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`);
    }
    
    return pageImages;
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-full">
          <label 
            htmlFor="dropzone-file" 
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
              isProcessing ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <FileText className="w-10 h-10 mb-2 text-gray-500" />
                  <p className="mb-1 text-sm text-gray-500 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <svg
                    className="w-10 h-10 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF or image files</p>
                </>
              )}
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isProcessing}
            />
          </label>
        </div>
        
        <Button
          onClick={processFile}
          disabled={!file || isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Start OCR Processing'
          )}
        </Button>
        
        {isProcessing && (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span>{statusMessage}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        
        {error && (
          <div className="w-full p-4 bg-red-50 text-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {results.length > 0 && (
          <div className="w-full mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium">OCR Results</h3>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium">Processed {results.length} pages</h4>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className="border-b p-4 last:border-0">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Page {result.pageNumber}</span>
                      <span className="text-sm text-gray-500">
                        Confidence: {result.confidence.toFixed(2)}%
                      </span>
                    </div>
                    <pre className="text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto">
                      {result.text.substring(0, 200)}
                      {result.text.length > 200 ? '...' : ''}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 