import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { useDocumentStore } from '../stores/documentStore';
import { nanoid } from 'nanoid';

// Set the PDF.js worker source
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Tesseract worker initialization using newer API
let tesseractWorker: any = null;
let isWorkerInitializing = false;

async function initTesseractWorker() {
  if (tesseractWorker) return tesseractWorker;
  
  if (isWorkerInitializing) {
    // Wait for existing initialization to complete
    while (isWorkerInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return tesseractWorker;
  }
  
  try {
    isWorkerInitializing = true;
    console.log('Initializing Tesseract worker...');
    
    tesseractWorker = await createWorker({
      logger: progress => {
        if (progress.status === 'recognizing text') {
          console.log(`OCR progress: ${(progress.progress * 100).toFixed(2)}%`);
        }
      }
    });
    
    // Initialize with English language
    await tesseractWorker.loadLanguage('eng');
    await tesseractWorker.initialize('eng');
    console.log('Tesseract worker initialized successfully');
    
    return tesseractWorker;
  } catch (error) {
    console.error('Error initializing Tesseract worker:', error);
    throw error;
  } finally {
    isWorkerInitializing = false;
  }
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
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
        console.log(`Page ${i} processed, text length:`, pageText.length);
      } catch (pageError) {
        console.warn(`Error processing page ${i}:`, pageError);
        // Continue with other pages even if one fails
      }
    }

    // Check if text was successfully extracted
    if (!fullText.trim()) {
      console.log('No text found in PDF, attempting OCR...');
      try {
        return await performOCROnPDF(file);
      } catch (ocrError) {
        console.error('OCR failed:', ocrError);
        throw new Error('PDF contains no extractable text and OCR failed');
      }
    }

    console.log('PDF text extraction completed, total length:', fullText.length);
    return fullText.trim();
  } catch (error: any) {
    console.error('Error in PDF extraction:', error);
    // Try OCR as fallback only for certain errors that suggest the PDF might be image-based
    if (error.message.includes('No such page') || 
        error.message.includes('getTextContent') || 
        error.message.includes('Page is not loaded')) {
      try {
        console.log('Attempting OCR fallback...');
        return await performOCROnPDF(file);
      } catch (ocrError: any) {
        console.error('OCR fallback failed:', ocrError);
        throw new Error(`Failed to extract PDF content. OCR also failed: ${ocrError.message}`);
      }
    }
    throw new Error(`Failed to extract PDF content: ${error.message}`);
  }
}

async function performOCROnPDF(file: File): Promise<string> {
  let worker: any = null;
  
  try {
    console.log('Starting OCR process for PDF:', file.name);

    // Initialize Tesseract worker
    try {
      worker = await initTesseractWorker();
      console.log('Tesseract worker ready');
    } catch (workerError) {
      console.error('Failed to initialize Tesseract worker:', workerError);
      throw new Error('OCR engine failed to initialize');
    }

    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Limit processing to first few pages for large PDFs
    const maxPagesToProcess = Math.min(pdf.numPages, 10); // Process max 10 pages to avoid timeout 

    // Process each page
    for (let i = 1; i <= maxPagesToProcess; i++) {
      try {
        console.log(`Processing page ${i}/${maxPagesToProcess} with OCR`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Balance between quality and speed

        // Create canvas and render PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          console.error('Failed to get canvas context');
          continue; // Skip this page but continue with others
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Convert canvas to image data URL
        const imageData = canvas.toDataURL('image/png');

        // Perform OCR on the rendered page using the updated API
        console.log(`Running OCR on page ${i}`);
        const result = await worker.recognize(imageData);
        const text = result.data.text;
        fullText += text + '\n\n';
        console.log(`OCR completed for page ${i}, text length:`, text.length);
      } catch (pageError) {
        console.warn(`Error performing OCR on page ${i}:`, pageError);
        // Continue with other pages
      }
    }

    if (pdf.numPages > maxPagesToProcess) {
      fullText += `\n\n[Note: OCR was limited to the first ${maxPagesToProcess} pages of ${pdf.numPages} total pages]\n`;
    }

    console.log('OCR process completed, total length:', fullText.length);

    return fullText.trim() || 'No text could be extracted via OCR';
  } catch (error: any) {
    console.error('Error in PDF OCR process:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

async function extractImageText(file: File): Promise<string> {
  try {
    console.log('Starting OCR for image:', file.name);
    const worker = await initTesseractWorker();
    
    const imageUrl = URL.createObjectURL(file);
    console.log('Image URL created:', imageUrl);
    
    // Use the updated API
    const result = await worker.recognize(imageUrl);
    const text = result.data.text;
    
    console.log('OCR completed for image, text length:', text.length);
    URL.revokeObjectURL(imageUrl);
    
    return text.trim() || 'No text could be extracted from the image';
  } catch (error) {
    console.error('Error extracting image text:', error);
    throw new Error(`Image OCR failed: ${error}`);
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
  try {
    // Check if it's a Word document
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    console.log(`Processing Office document: ${file.name}, type: ${file.type}, extension: ${fileExt}`);
    
    if (file.type.includes('word') || fileExt === 'doc' || fileExt === 'docx') {
      console.log(`Extracting content from Word document: ${file.name}...`);
      
      // Check for older .doc format which isn't supported by mammoth
      if (fileExt === 'doc') {
        console.warn('Old .doc format detected - mammoth only supports .docx format');
        return `This file (${file.name}) appears to be in the older .doc format which cannot be processed directly. Please convert it to .docx format and try again.`;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      console.log(`File loaded as ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`);
      
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log(`Mammoth extraction result, length: ${result.value.length} characters`);
        
        if (result.value.length === 0) {
          console.warn('Extracted content is empty, document may be corrupted or protected');
          return `Failed to extract content from ${file.name}. The document may be password-protected or corrupted.`;
        }
        
        if (result.value.length < 100 && result.messages && result.messages.length > 0) {
          console.warn('Extracted content is very short, checking mammoth messages:', result.messages);
        }
        
        return result.value || `No text content could be extracted from ${file.name}`;
      } catch (mammothError: any) {
        console.error('Mammoth extraction error:', mammothError);
        
        // Check for common errors
        if (mammothError.message && mammothError.message.includes('Could not find main document part')) {
          return `This document appears to be in the older .doc format which cannot be processed directly. Please convert it to .docx format using Microsoft Word or an online converter and try again.`;
        }
        
        return `Could not process Word document: ${mammothError.message || 'Unknown error'}. The file may be password-protected or in an unsupported format.`;
      }
    }
    
    // For other Office documents, return message
    return `Office document type "${file.type}" extraction is not yet fully supported. Word documents (.docx only) should work. For other formats, please convert to PDF or .docx for better results.`;
  } catch (error: any) {
    console.error('Error extracting Office document content:', error);
    return `Failed to extract content from Office document: ${error.message}. Please try converting to PDF or .docx format.`;
  }
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
      console.log(`Determined file type: ${fileType}`);
      console.log(`Extracting content from ${file.name}...`);
      
      try {
        content = await extractFileContent(file);
        console.log(`Content extracted from PDF, length: ${content.length} characters`);
      } catch (pdfError) {
        console.error('Error extracting PDF content:', pdfError);
        return {
          success: false,
          message: `Failed to extract content from ${file.name}`
        };
      }
    } else if (file.type.includes('word') || fileExt === 'doc' || fileExt === 'docx') {
      fileType = 'document';
      console.log(`Determined file type: ${fileType}`);
      console.log(`Extracting content from ${file.name}...`);
      
      // Use Office content extraction
      content = await extractOfficeContent(file);
      
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