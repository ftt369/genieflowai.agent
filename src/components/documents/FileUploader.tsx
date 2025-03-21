import React, { useState, useRef } from 'react';
import { uploadFile, getWorkersCompFilePath } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';

interface FileUploaderProps {
  bucketName: string;
  folderPath?: string;
  allowedFileTypes?: string[];
  maxSizeMB?: number;
  onUploadComplete?: (url: string) => void;
  documentType?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  bucketName,
  folderPath,
  allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'],
  maxSizeMB = 5,
  onUploadComplete,
  documentType = 'general',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const selectedFile = e.target.files[0];
    
    // Validate file type
    if (!allowedFileTypes.includes(selectedFile.type)) {
      setError(`File type not allowed. Please upload one of: ${allowedFileTypes.join(', ')}`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds the maximum allowed size of ${maxSizeMB}MB`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };
  
  const handleUpload = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Create a file path
      let filePath: string;
      
      if (documentType === 'workers_comp') {
        filePath = getWorkersCompFilePath(user.id, documentType, file.name);
      } else if (folderPath) {
        filePath = `${folderPath}/${file.name}`;
      } else {
        filePath = `${user.id}/${file.name}`;
      }
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 10;
          return next > 90 ? 90 : next;
        });
      }, 300);
      
      // Upload file to Supabase
      const fileUrl = await uploadFile(bucketName, filePath, file, file.type);
      
      clearInterval(progressInterval);
      
      if (fileUrl) {
        setProgress(100);
        setSuccess(true);
        if (onUploadComplete) {
          onUploadComplete(fileUrl);
        }
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (err) {
      setError((err as Error).message);
      setProgress(0);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Upload Document
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={uploading}
                  ref={fileInputRef}
                  accept={allowedFileTypes.join(',')}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              {allowedFileTypes.map(type => type.split('/')[1]).join(', ')} up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>
      
      {file && (
        <div className="mt-2 flex items-center">
          <div className="mr-2">
            <svg
              className="h-5 w-5 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-900 truncate">
            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
          </span>
        </div>
      )}
      
      {progress > 0 && (
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {progress}% uploaded
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-2 text-sm text-green-600">
          File uploaded successfully!
        </div>
      )}
      
      <div className="mt-4 flex space-x-2">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default FileUploader; 