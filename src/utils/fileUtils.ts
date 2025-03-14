import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { useDocumentStore } from '../stores/documentStore';
import { nanoid } from 'nanoid';

// Set the PDF.js worker source
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Initialize Tesseract worker
let tesseractWorker: any = null;

async function initTesseractWorker() {
  if (!tesseractWorker) {
    tesseractWorker = await createWorker();
    await tesseractWorker.loadLanguage('eng');
    await tesseractWorker.initialize('eng');
  }
  return tesseractWorker;
}

/**
 * Extracts text content from various file types
 * @param file The file to extract content from
 * @returns A promise that resolves to the extracted text
 */
export const extractFileContent = async (file: File): Promise<string> => {
  const type = file.type;

  try {
    // Handle PDFs
    if (type === 'application/pdf') {
      return await extractPDFContent(file);
    }

    // Handle images with OCR
    if (type.startsWith('image/')) {
      return await extractImageText(file);
    }

    // Handle text-based files
    if (type.includes('text') || type.includes('javascript') || type.includes('json') || type.includes('xml')) {
      return await readTextFile(file);
    }

    // Handle Microsoft Office documents
    if (type.includes('officedocument') || type.includes('msword')) {
      return await extractOfficeContent(file);
    }

    throw new Error(`Unsupported file type: ${type}`);
  } catch (error) {
    console.error('Error extracting file content:', error);
    throw error;
  }
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes The file size in bytes
 * @returns A formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

async function extractPDFContent(file: File): Promise<string> {
  try {
    console.log('Starting PDF extraction for:', file.name);
    
    // Load the PDF file
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);

    // Create PDF document
    const loadingTask = getDocument({ data: arrayBuffer });
    console.log('PDF loading task created');

    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);

    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i} of ${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
      console.log(`Page ${i} processed, text length:`, pageText.length);
    }

    // Check if text was successfully extracted
    if (!fullText.trim()) {
      console.log('No text found in PDF, attempting OCR...');
      return await performOCROnPDF(file);
    }

    console.log('PDF text extraction completed, total length:', fullText.length);
    return fullText.trim();
  } catch (error: any) {
    console.error('Error in PDF extraction:', error);
    // Try OCR as fallback
    try {
      console.log('Attempting OCR fallback...');
      return await performOCROnPDF(file);
    } catch (ocrError: any) {
      console.error('OCR fallback failed:', ocrError);
      throw new Error(`Failed to extract PDF content: ${error.message}`);
    }
  }
}

async function performOCROnPDF(file: File): Promise<string> {
  try {
    console.log('Starting OCR process for PDF:', file.name);
    const worker = await initTesseractWorker();
    
    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i} with OCR`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
      
      // Create canvas and render PDF page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context!,
        viewport: viewport
      }).promise;

      // Perform OCR on the rendered page
      console.log(`Running OCR on page ${i}`);
      const { data: { text } } = await worker.recognize(canvas);
      fullText += text + '\n\n';
      console.log(`OCR completed for page ${i}, text length:`, text.length);
    }

    console.log('OCR process completed, total length:', fullText.length);
    return fullText.trim();
  } catch (error: any) {
    console.error('Error in OCR process:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

async function extractImageText(file: File): Promise<string> {
  try {
    const worker = await initTesseractWorker();
    const imageUrl = URL.createObjectURL(file);
    const { data: { text } } = await worker.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);
    return text.trim();
  } catch (error) {
    console.error('Error extracting image text:', error);
    throw error;
  }
}

async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

async function extractOfficeContent(file: File): Promise<string> {
  // For now, return a message that Office documents are not supported
  // In a future update, we can add support for Office documents using appropriate libraries
  return 'Office document content extraction is not yet supported. Please convert to PDF for better results.';
}

/**
 * Creates a thumbnail for an image file
 * @param file The image file
 * @param maxWidth Maximum width of the thumbnail
 * @param maxHeight Maximum height of the thumbnail
 * @returns A promise that resolves to the thumbnail as a Data URL
 */
export const createImageThumbnail = (
  file: File, 
  maxWidth = 200, 
  maxHeight = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Creating thumbnail for ${file.name}`);
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        console.log(`Image loaded for thumbnail: ${file.name}, dimensions: ${img.width}x${img.height}`);
        // Calculate dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        console.log(`Thumbnail dimensions for ${file.name}: ${width}x${height}`);
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type);
        console.log(`Thumbnail created for ${file.name}, length: ${dataUrl.length} characters`);
        resolve(dataUrl);
      } catch (error) {
        console.error(`Error creating thumbnail for ${file.name}:`, error);
        reject(error);
      }
    };
    
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      console.error(`Error loading image for thumbnail: ${file.name}`, e);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Downloads a file
 * @param content The file content
 * @param filename The filename
 * @param mimeType The MIME type of the file
 */
export const downloadFile = (content: string | Blob, filename: string, mimeType?: string) => {
  console.log(`Downloading file: ${filename}, type: ${mimeType || 'unknown'}`);
  if (typeof content === 'string' && mimeType) {
    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, filename);
  } else if (content instanceof Blob) {
    saveAs(content, filename);
  }
};

// Clean up function to be called when the application is done with OCR
export async function cleanupOCR() {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}

// Function to extract content from a DOC/DOCX file
async function extractDocContent(file: File): Promise<string> {
  try {
    console.log(`Extracting content from ${file.name} using mammoth...`);
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log(`Mammoth extraction result, length: ${result.value.length} characters`);
    
    if (result.value.length < 100) {
      console.warn('Extracted content is very short, document may be corrupted or protected');
    }
    
    return result.value;
  } catch (error: any) {
    console.error('Error extracting DOC content:', error);
    throw new Error(`Failed to extract content from DOC file: ${error.message}`);
  }
}

// Main function to process different file types
export async function processFile(file: File) {
  try {
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    // Determine file type
    let fileType = 'unknown';
    let content = '';
    
    // Check file extension and MIME type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (file.type.includes('pdf') || fileExt === 'pdf') {
      fileType = 'pdf';
      // Handle PDF files
      // ... existing PDF handling code
    } else if (file.type.includes('word') || fileExt === 'doc' || fileExt === 'docx') {
      fileType = 'document';
      console.log(`Determined file type: ${fileType}`);
      console.log(`Extracting content from ${file.name}...`);
      
      // Use mammoth for DOC/DOCX extraction
      content = await extractDocContent(file);
      
      console.log(`Content extracted, length: ${content.length} characters`);
    } 
    // ... existing code for other file types
    
    // Store the document if content was extracted
    if (content && content.length > 0) {
      const docId = nanoid();
      useDocumentStore.getState().addDocument({
        id: docId,
        fileName: file.name,
        fileType: fileType,
        content: content,
        createdAt: new Date()
      });
      
      console.log(`Created attachment: ${docId}, name: ${file.name}, content length: ${content.length}`);
      
      return {
        success: true,
        message: `Successfully processed ${file.name}`,
        documentId: docId
      };
    } else {
      return {
        success: false,
        message: `Failed to extract content from ${file.name}`
      };
    }
  } catch (error: any) {
    console.error('Error processing file:', error);
    return {
      success: false,
      message: `Error processing file: ${error.message}`
    };
  }
} 