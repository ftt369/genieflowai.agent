import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts text content from various file types
 * @param file The file to extract content from
 * @returns A promise that resolves to the extracted text
 */
export const extractFileContent = async (file: File): Promise<string> => {
  console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
  
  try {
    // For text-based files, use simple text extraction
    if (file.type.startsWith('text/') || 
        file.type.includes('json') || 
        file.type.includes('javascript') || 
        file.type.includes('typescript') || 
        file.type.includes('xml') || 
        file.type.includes('html') || 
        file.type.includes('css')) {
      console.log(`Reading ${file.name} as text`);
      return await readAsText(file);
    }
    
    // For PDF files, use PDF.js
    if (file.type.includes('pdf')) {
      try {
        console.log(`Extracting PDF text from ${file.name}`);
        const text = await extractPdfText(file);
        console.log(`PDF text extracted successfully from ${file.name}, length: ${text.length} characters`);
        return text;
      } catch (error: any) {
        console.error(`Error extracting PDF text from ${file.name}:`, error);
        return `[PDF Document: ${file.name}] - Error extracting content: ${error.message || 'Unknown error'}`;
      }
    }
    
    // For Word documents, use Mammoth.js
    if (file.type.includes('word') || file.type.includes('msword') || 
        file.type.includes('officedocument.wordprocessingml')) {
      try {
        console.log(`Extracting Word document text from ${file.name}`);
        const text = await extractWordText(file);
        console.log(`Word document text extracted successfully from ${file.name}, length: ${text.length} characters`);
        return text;
      } catch (error: any) {
        console.error(`Error extracting Word text from ${file.name}:`, error);
        return `[Word Document: ${file.name}] - Error extracting content: ${error.message || 'Unknown error'}`;
      }
    }
    
    // For other file types, return a placeholder with file info
    if (file.type.includes('excel') || file.type.includes('spreadsheetml')) {
      return `[Excel Document: ${file.name}] - Size: ${formatFileSize(file.size)}`;
    }
    
    if (file.type.includes('powerpoint') || file.type.includes('presentationml')) {
      return `[PowerPoint Document: ${file.name}] - Size: ${formatFileSize(file.size)}`;
    }
    
    if (file.type.startsWith('image/')) {
      return `[Image: ${file.name}] - Size: ${formatFileSize(file.size)}`;
    }
    
    if (file.type.startsWith('audio/')) {
      return `[Audio: ${file.name}] - Size: ${formatFileSize(file.size)}`;
    }
    
    if (file.type.startsWith('video/')) {
      return `[Video: ${file.name}] - Size: ${formatFileSize(file.size)}`;
    }
    
    // If file type is empty or unknown, try to determine by extension
    if (!file.type || file.type === 'application/octet-stream') {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      console.log(`File ${file.name} has unknown MIME type, extension: ${extension}`);
      
      if (extension === 'pdf') {
        try {
          console.log(`Attempting to extract PDF text from ${file.name} based on extension`);
          const text = await extractPdfText(file);
          console.log(`PDF text extracted successfully from ${file.name}, length: ${text.length} characters`);
          return text;
        } catch (error: any) {
          console.error(`Error extracting PDF text from ${file.name} based on extension:`, error);
          return `[PDF Document: ${file.name}] - Error extracting content: ${error.message || 'Unknown error'}`;
        }
      }
      
      if (extension === 'docx' || extension === 'doc') {
        try {
          console.log(`Attempting to extract Word document text from ${file.name} based on extension`);
          const text = await extractWordText(file);
          console.log(`Word document text extracted successfully from ${file.name}, length: ${text.length} characters`);
          return text;
        } catch (error: any) {
          console.error(`Error extracting Word text from ${file.name} based on extension:`, error);
          return `[Word Document: ${file.name}] - Error extracting content: ${error.message || 'Unknown error'}`;
        }
      }
      
      // Try to read as text for common text formats
      if (['txt', 'md', 'js', 'ts', 'html', 'css', 'json', 'xml'].includes(extension)) {
        console.log(`Reading ${file.name} as text based on extension`);
        return await readAsText(file);
      }
    }
    
    // Default for other file types
    console.log(`Using default handling for ${file.name}`);
    return `[File: ${file.name}] - Type: ${file.type || 'unknown'}, Size: ${formatFileSize(file.size)}`;
  } catch (error: any) {
    console.error(`Error processing file ${file.name}:`, error);
    return `[Error processing file: ${file.name}] - ${error.message || 'Unknown error'}`;
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

/**
 * Extracts text from a PDF file using PDF.js
 * @param file The PDF file
 * @returns A promise that resolves to the extracted text
 */
export const extractPdfText = async (file: File): Promise<string> => {
  try {
    console.log(`Reading ${file.name} as ArrayBuffer for PDF extraction`);
    const arrayBuffer = await readAsArrayBuffer(file);
    console.log(`ArrayBuffer created for ${file.name}, size: ${arrayBuffer.byteLength} bytes`);
    
    console.log(`Loading PDF document ${file.name}`);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`PDF document loaded: ${file.name}, pages: ${pdf.numPages}`);
    
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i} of ${pdf.numPages} in ${file.name}`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      const pageText = strings.join(' ');
      console.log(`Extracted ${pageText.length} characters from page ${i} of ${file.name}`);
      text += pageText + '\n\n';
    }
    
    console.log(`Total text extracted from ${file.name}: ${text.length} characters`);
    return text || `[PDF Document: ${file.name} - No text content found]`;
  } catch (error: any) {
    console.error(`PDF extraction error for ${file.name}:`, error);
    throw new Error(`Failed to extract PDF text: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Extracts text from a Word document using Mammoth.js
 * @param file The Word document
 * @returns A promise that resolves to the extracted text
 */
export const extractWordText = async (file: File): Promise<string> => {
  try {
    console.log(`Reading ${file.name} as ArrayBuffer for Word extraction`);
    const arrayBuffer = await readAsArrayBuffer(file);
    console.log(`ArrayBuffer created for ${file.name}, size: ${arrayBuffer.byteLength} bytes`);
    
    console.log(`Extracting text from Word document ${file.name}`);
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log(`Word text extracted from ${file.name}, length: ${result.value.length} characters`);
    
    return result.value || `[Word Document: ${file.name} - No text content found]`;
  } catch (error: any) {
    console.error(`Word extraction error for ${file.name}:`, error);
    throw new Error(`Failed to extract Word document text: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Reads a file as text
 * @param file The file to read
 * @returns A promise that resolves to the file content as text
 */
export const readAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Reading ${file.name} as text`);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        console.log(`Text read from ${file.name}, length: ${content?.length || 0} characters`);
        resolve(content || `[Empty file: ${file.name}]`);
      } catch (error) {
        console.error(`Error in onload handler for ${file.name}:`, error);
        reject(error);
      }
    };
    
    reader.onerror = (e) => {
      console.error(`Error reading ${file.name} as text:`, e);
      reject(new Error(`Failed to read file: ${e.toString()}`));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Reads a file as an ArrayBuffer
 * @param file The file to read
 * @returns A promise that resolves to the file content as an ArrayBuffer
 */
export const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    console.log(`Reading ${file.name} as ArrayBuffer`);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as ArrayBuffer;
        console.log(`ArrayBuffer read from ${file.name}, size: ${content?.byteLength || 0} bytes`);
        resolve(content);
      } catch (error) {
        console.error(`Error in onload handler for ${file.name}:`, error);
        reject(error);
      }
    };
    
    reader.onerror = (e) => {
      console.error(`Error reading ${file.name} as ArrayBuffer:`, e);
      reject(new Error(`Failed to read file: ${e.toString()}`));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Reads a file as a Data URL
 * @param file The file to read
 * @returns A promise that resolves to the file content as a Data URL
 */
export const readAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Reading ${file.name} as DataURL`);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        console.log(`DataURL read from ${file.name}, length: ${content?.length || 0} characters`);
        resolve(content);
      } catch (error) {
        console.error(`Error in onload handler for ${file.name}:`, error);
        reject(error);
      }
    };
    
    reader.onerror = (e) => {
      console.error(`Error reading ${file.name} as DataURL:`, e);
      reject(new Error(`Failed to read file: ${e.toString()}`));
    };
    
    reader.readAsDataURL(file);
  });
};

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