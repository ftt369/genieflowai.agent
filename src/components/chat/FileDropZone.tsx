import React, { useState, useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { extractFileContent, createImageThumbnail } from '../../utils/fileUtils';

interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  content?: string;
}

interface FileDropZoneProps {
  onFilesAdded: (attachments: Attachment[]) => void;
  onError: (message: string) => void;
  allowedFileTypes?: Record<string, string[]>;
  maxFileSize?: number;
  children?: React.ReactNode;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const DEFAULT_ALLOWED_FILE_TYPES = {
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/rtf',
    'application/x-rtf',
    'text/rtf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'text/javascript',
    'text/typescript',
    'text/html',
    'text/css',
    'application/xml',
    'text/xml'
  ],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
};

const DEFAULT_MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesAdded,
  onError,
  allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFiles = async (files: File[]) => {
    console.log(`Processing ${files.length} files`);
    const newAttachments: Attachment[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
        
        if (file.size > maxFileSize) {
          errors.push(`${file.name} is too large (max: ${maxFileSize / 1024 / 1024}MB)`);
          continue;
        }

        // Determine file type
        const type = Object.entries(allowedFileTypes).find(([_, types]) => 
          types.includes(file.type)
        )?.[0] as Attachment['type'] || 'document';
        
        console.log(`Determined file type: ${type}`);

        // Read file content using our improved utility
        console.log(`Extracting content from ${file.name}...`);
        const content = await extractFileContent(file);
        console.log(`Content extracted, length: ${content.length} characters`);
        const url = URL.createObjectURL(file);

        // For images, create a thumbnail
        let thumbnailUrl = type === 'image' ? await createImageThumbnail(file) : undefined;

        const attachment: Attachment = {
          id: generateUUID(),
          type,
          name: file.name,
          url,
          thumbnailUrl,
          size: file.size,
          mimeType: file.type,
          content // Store the content for processing
        };

        console.log(`Created attachment: ${attachment.id}, name: ${attachment.name}, content length: ${attachment.content?.length || 0}`);
        newAttachments.push(attachment);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push(`Failed to process ${file.name}: ${error}`);
      }
    }

    if (errors.length > 0) {
      console.error('File processing errors:', errors);
      onError(errors.join('\n'));
    }

    if (newAttachments.length > 0) {
      console.log(`Successfully processed ${newAttachments.length} files`);
      onFilesAdded(newAttachments);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await processFiles(Array.from(files));
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="relative w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept={Object.values(allowedFileTypes).flat().join(',')}
      />
      
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="bg-background p-8 rounded-xl shadow-lg border-2 border-dashed border-primary flex flex-col items-center">
            <Paperclip className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-medium">Drop files to attach</p>
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: PDF, Word, Excel, images, and more
            </p>
          </div>
        </div>
      )}
      
      {/* Content */}
      {children || (
        <button
          type="button"
          onClick={handleButtonClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="Attach files"
        >
          <Paperclip className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default FileDropZone; 