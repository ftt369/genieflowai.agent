import { createWorker, Worker, PSM, OEM } from 'tesseract.js';

// Configuration options for OCR
export interface OCRConfig {
  language: string;
  pageSegmentationMode?: PSM;
  engineMode?: OEM;
  workerCount: number; // Number of parallel workers
  logger?: (message: string, progress: number) => void;
}

// Default OCR configuration
const DEFAULT_CONFIG: OCRConfig = {
  language: 'eng',
  pageSegmentationMode: PSM.AUTO,
  engineMode: OEM.LSTM_ONLY,
  workerCount: 4, // Default to 4 workers
};

export interface OCRResult {
  text: string;
  confidence: number;
  pageNumber: number;
}

export class OCRService {
  private workers: Worker[] = [];
  private isInitialized = false;
  private config: OCRConfig;

  constructor(config: Partial<OCRConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the OCR workers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create multiple workers based on configuration
    for (let i = 0; i < this.config.workerCount; i++) {
      const worker = await createWorker({
        logger: ({ progress, status }) => {
          if (this.config.logger) {
            this.config.logger(`Worker ${i+1}: ${status}`, progress);
          }
        },
      });
      
      await worker.loadLanguage(this.config.language);
      await worker.initialize(this.config.language);
      
      if (this.config.pageSegmentationMode !== undefined) {
        await worker.setParameters({
          tessedit_pageseg_mode: this.config.pageSegmentationMode,
        });
      }
      
      if (this.config.engineMode !== undefined) {
        // Custom parameters for Tesseract
        const params: Record<string, any> = {
          tessedit_ocr_engine_mode: this.config.engineMode,
        };
        await worker.setParameters(params);
      }
      
      // For text-heavy documents, optimize for text detection
      // Custom parameters for Tesseract
      const textParams: Record<string, any> = {
        tessedit_do_invert: 0,
        textord_tabfind_find_tables: 0,
      };
      await worker.setParameters(textParams);
      
      this.workers.push(worker);
    }
    
    this.isInitialized = true;
  }

  /**
   * Process a single page with OCR
   */
  private async processPage(pageImage: ImageData | string, pageNumber: number, workerId: number): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const worker = this.workers[workerId];
    const result = await worker.recognize(pageImage);
    
    return {
      text: result.data.text,
      confidence: result.data.confidence,
      pageNumber,
    };
  }

  /**
   * Process a document with multiple pages in parallel
   */
  async processDocument(pages: Array<ImageData | string>): Promise<OCRResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Track completed pages
    const results: OCRResult[] = new Array(pages.length);
    
    // Process in batches to limit memory usage
    const processBatch = async (startIdx: number) => {
      const batchSize = this.config.workerCount;
      const endIdx = Math.min(startIdx + batchSize, pages.length);
      
      if (startIdx >= pages.length) return;
      
      const batchPromises = [];
      
      // Create a processing task for each page in the batch
      for (let i = startIdx; i < endIdx; i++) {
        const workerId = (i - startIdx) % this.workers.length;
        batchPromises.push(
          this.processPage(pages[i], i + 1, workerId)
            .then(result => {
              results[i] = result;
              if (this.config.logger) {
                this.config.logger(
                  `Page ${i + 1}/${pages.length} completed`,
                  (i + 1) / pages.length
                );
              }
            })
        );
      }
      
      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Process next batch
      return processBatch(endIdx);
    };
    
    // Start processing with first batch
    await processBatch(0);
    
    // Sort results by page number to ensure correct order
    return results.filter(Boolean);
  }

  /**
   * Terminate all workers and free resources
   */
  async terminate(): Promise<void> {
    if (!this.isInitialized) return;
    
    await Promise.all(this.workers.map(worker => worker.terminate()));
    this.workers = [];
    this.isInitialized = false;
  }
}

/**
 * Create a worker pool for processing multiple documents concurrently
 */
export class OCRWorkerPool {
  private service: OCRService;
  private queue: Array<{
    pages: Array<ImageData | string>;
    resolve: (results: OCRResult[]) => void;
    reject: (error: Error) => void;
  }> = [];
  private isProcessing = false;

  constructor(config: Partial<OCRConfig> = {}) {
    this.service = new OCRService(config);
  }

  /**
   * Add a document to the processing queue
   */
  async processDocument(pages: Array<ImageData | string>): Promise<OCRResult[]> {
    return new Promise((resolve, reject) => {
      this.queue.push({ pages, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the next document in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const { pages, resolve, reject } = this.queue.shift()!;
    
    try {
      await this.service.initialize();
      const results = await this.service.processDocument(pages);
      resolve(results);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }

  /**
   * Terminate the worker pool
   */
  async terminate(): Promise<void> {
    await this.service.terminate();
  }
}

/**
 * Extract text from PDF document pages in parallel
 * @param pdfData PDF file data
 * @param config OCR configuration
 * @returns Array of OCR results for each page
 */
export async function extractTextFromPDF(
  pdfData: ArrayBuffer,
  config: Partial<OCRConfig> = {}
): Promise<OCRResult[]> {
  // This would require a PDF rendering library like pdf.js
  // For now, we'll assume you have a way to convert PDF pages to images
  
  // Example implementation with a hypothetical PDF renderer:
  /*
  const pdfDocument = await loadPDF(pdfData);
  const pageCount = pdfDocument.numPages;
  const pageImages = [];
  
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDocument.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
    
    // Render page to canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport,
    }).promise;
    
    // Get image data
    pageImages.push(canvas.toDataURL('image/png'));
  }
  */
  
  // For demonstration purposes, we'll return a placeholder
  // In a real implementation, you would process the actual page images
  const workerPool = new OCRWorkerPool(config);
  //const results = await workerPool.processDocument(pageImages);
  //await workerPool.terminate();
  //return results;
  
  return []; // Placeholder return
}

// Export standalone functions for simpler use cases
export async function extractTextFromImage(
  imageData: ImageData | string,
  config: Partial<OCRConfig> = {}
): Promise<string> {
  const service = new OCRService(config);
  await service.initialize();
  
  const result = await service.processDocument([imageData]);
  await service.terminate();
  
  return result[0].text;
} 