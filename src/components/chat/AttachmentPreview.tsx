import React from 'react';
import { File, FileText, Image as ImageIcon, Music, Video, Download, Eye, X } from 'lucide-react';
import { downloadFile } from '../../utils/fileUtils';

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

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove?: (id: string) => void;
  showControls?: boolean;
  className?: string;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  onRemove,
  showControls = true,
  className = '',
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    switch (attachment.type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-purple-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDownload = () => {
    if (attachment.url) {
      // For local files, we can use the URL directly
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      link.click();
    }
  };

  const renderPreview = () => {
    if (attachment.type === 'image' && attachment.thumbnailUrl) {
      return (
        <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
          <img
            src={attachment.thumbnailUrl}
            alt={attachment.name}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(attachment.size)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative group ${className}`}>
      {renderPreview()}
      
      {showControls && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={handleDownload}
            className="p-1 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          
          {onRemove && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="p-1 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-500 transition-colors"
              title="Remove attachment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AttachmentPreview; 