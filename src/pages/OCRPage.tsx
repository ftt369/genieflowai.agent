import React, { useState } from 'react';
import { DocumentOCR } from '../components/DocumentOCR';
import { OCRResult } from '../services/ocrService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Settings, Cpu, Info } from 'lucide-react';

const OCRPage: React.FC = () => {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [combinedText, setCombinedText] = useState<string>('');
  
  const handleOCRComplete = (ocrResults: OCRResult[]) => {
    setResults(ocrResults);
    
    // Combine all text from results, sorted by page number
    const sortedResults = [...ocrResults].sort((a, b) => a.pageNumber - b.pageNumber);
    const text = sortedResults.map(result => result.text).join('\n\n--- Page Break ---\n\n');
    setCombinedText(text);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Optimized Document OCR</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Process text-heavy documents using parallel OCR processing for maximum speed. 
          Upload PDFs or images to extract text content.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DocumentOCR 
            onComplete={handleOCRComplete}
            maxWorkers={navigator.hardwareConcurrency || 4}
            language="eng"
          />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Parallel Processing
              </CardTitle>
              <CardDescription>
                Our optimized OCR processes entire pages in parallel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                  <span>Processes whole pages at once, not small chunks</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                  <span>Uses multiple worker threads for parallel processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                  <span>Automatically detects optimal worker count for your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                  <span>Optimized settings for text-heavy documents</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Performance Tips
              </CardTitle>
              <CardDescription>
                Get the best OCR performance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Use clear, high-resolution documents</p>
              <p>• For multi-page documents, consider using 4-8 parallel workers</p>
              <p>• Text-heavy documents with minimal images work best</p>
              <p>• Processing time depends on document complexity and device capabilities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                About OCR
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>This OCR processor uses Tesseract.js with optimized settings for text-heavy documents. 
              The parallel processing approach significantly reduces total processing time by utilizing 
              multiple CPU cores simultaneously.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {results.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">OCR Results</h2>
          
          <Tabs defaultValue="byPage">
            <TabsList className="mb-4">
              <TabsTrigger value="byPage">By Page</TabsTrigger>
              <TabsTrigger value="combined">Combined Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="byPage">
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Page {result.pageNumber}
                        </CardTitle>
                        <span className="text-sm text-gray-500">
                          Confidence: {result.confidence.toFixed(1)}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto max-h-64">
                        {result.text}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="combined">
              <Card>
                <CardHeader>
                  <CardTitle>Combined Text</CardTitle>
                  <CardDescription>
                    All pages combined in order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto max-h-[600px]">
                    {combinedText}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default OCRPage; 