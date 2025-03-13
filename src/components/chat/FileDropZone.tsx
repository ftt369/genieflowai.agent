import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, FileText, Image as ImageIcon, Music, Video, File, X, Upload } from 'lucide-react';
import { extractFileContent, createImageThumbnail } from '../../utils/fileUtils';
import { cn } from '@/utils/cn';

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
  className?: string;
  buttonClassName?: string;
  dropZoneClassName?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
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
  children,
  className,
  buttonClassName,
  dropZoneClassName,
  showIcon = true,
  showLabel = false,
  label = "Attach files",
  icon = <Paperclip className="w-5 h-5" />,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle global drag events to improve UX
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Only set isDragging to false if we're leaving the document
      // or moving to an element that's not a child of our component
      if (e.target === document || !dropZoneRef.current?.contains(e.target as Node)) {
        setIsDragging(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      setIsDragging(false);
    };

    // Add global event listeners
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      // Clean up event listeners
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [disabled]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're leaving the drop zone (not just moving between its children)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.includes('pdf') || type.includes('word') || type.includes('text')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const processFiles = async (files: File[]) => {
    if (disabled || isProcessing) return;
    
    setIsProcessing(true);
    console.log(`Processing ${files.length} files`);
    const newAttachments: Attachment[] = [];
    const errors: string[] = [];

    try {
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || disabled) return;

    await processFiles(Array.from(files));
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Determine accepted file types for the input
  const acceptedFileTypes = Object.values(allowedFileTypes).flat().join(',');

  return (
    <div 
      ref={dropZoneRef}
      className={cn(
        "relative",
        className
      )}
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
        accept={acceptedFileTypes}
        disabled={disabled}
      />
      
      {/* Drag overlay */}
      {isDragging && (
        <div className={cn(
          "absolute inset-0 bg-primary/10 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary",
          dropZoneClassName
        )}>
          <div className="bg-background/80 p-4 rounded-xl shadow-lg flex flex-col items-center">
            <Upload className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-medium">Drop to attach</p>
          </div>
        </div>
      )}
      
      {/* Content */}
      {children || (
        <button
          type="button"
          onClick={handleButtonClick}
          className={cn(
            "p-2.5 rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2",
            isProcessing && "opacity-50 cursor-wait",
            disabled && "opacity-50 cursor-not-allowed",
            buttonClassName
          )}
          title={label}
          disabled={disabled || isProcessing}
        >
          {isProcessing ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          ) : showIcon ? icon : null}
          {showLabel && <span className="text-sm">{label}</span>}
        </button>
      )}
    </div>
  );
};

export default FileDropZone; 