import React, { useState } from 'react';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { useThemeStore } from '@/stores/theme/themeStore';
import { cn } from '@/utils/cn';
import { useModeStore } from '@/stores/model/modeStore';
import { useToast } from '@/hooks/useToast';

export default function DocumentUpload() {
  const { profile } = useThemeStore();
  const { activeMode } = useModeStore();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState('reference');
  const [exhibitSettings, setExhibitSettings] = useState({
    numberingSystem: 'numeric', // 'numeric', 'alphabetic', 'alphanumeric'
    startingNumber: '1',
    includeDescription: true,
    generateCoverSheet: true,
    generateSeparators: true,
    confidential: false,
  });
  
  const isLegalMode = activeMode === 'legal' || activeMode === 'legal_brief_writer' || activeMode === 'legal_exhibit_preparer';
  const isExhibitMode = activeMode === 'legal_exhibit_preparer';
  const isSpiralStyle = profile === 'spiral';
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };
  
  const handleFiles = (newFiles: File[]) => {
    // Check file types - accept PDF, DOCX, TXT files
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validFiles = newFiles.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: 'Invalid file type',
        description: 'Only PDF, DOCX, and TXT files are supported',
        type: 'error'
      });
    }
    
    setFiles([...files, ...validFiles]);
  };
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Here you would implement the actual file upload logic
      // For example, using a FormData to send to your API
      
      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Documents uploaded',
        description: `Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}`,
        type: 'success'
      });
      
      setFiles([]);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading the documents',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Document Purpose</label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className={cn(
            "w-full px-3 py-2 rounded-md border border-input bg-background",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        >
          <option value="reference">Reference Material</option>
          <option value="template">Document Template</option>
          {isLegalMode && (
            <>
              <option value="case_law">Case Law</option>
              <option value="statute">Statute or Regulation</option>
              <option value="pleading">Pleading or Motion</option>
              <option value="evidence">Evidence or Exhibit</option>
              {isExhibitMode && <option value="exhibit_bulk">Bulk Exhibits</option>}
            </>
          )}
        </select>
        
        {isLegalMode && documentType === 'case_law' && (
          <p className="mt-1 text-xs text-muted-foreground">
            Case law will be parsed for citations and legal reasoning
          </p>
        )}
        
        {isLegalMode && documentType === 'evidence' && (
          <p className="mt-1 text-xs text-muted-foreground">
            Evidence will be analyzed and prepared as exhibits
          </p>
        )}
        
        {isExhibitMode && (documentType === 'evidence' || documentType === 'exhibit_bulk') && (
          <div className="mt-3 border rounded-md p-3 space-y-3 bg-background">
            <h4 className="font-medium text-sm">Exhibit Settings</h4>
            
            <div>
              <label className="block text-xs font-medium mb-1">Numbering System</label>
              <select
                value={exhibitSettings.numberingSystem}
                onChange={(e) => setExhibitSettings({...exhibitSettings, numberingSystem: e.target.value})}
                className="w-full px-2 py-1 text-sm rounded-md border"
              >
                <option value="numeric">Numeric (1, 2, 3...)</option>
                <option value="alphabetic">Alphabetic (A, B, C...)</option>
                <option value="alphanumeric">Party Prefix (P-1, D-1...)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1">Starting Number/Letter</label>
              <input
                type="text"
                value={exhibitSettings.startingNumber}
                onChange={(e) => setExhibitSettings({...exhibitSettings, startingNumber: e.target.value})}
                className="w-full px-2 py-1 text-sm rounded-md border"
                maxLength={3}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="coverSheet"
                checked={exhibitSettings.generateCoverSheet}
                onChange={(e) => setExhibitSettings({...exhibitSettings, generateCoverSheet: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="coverSheet" className="text-xs">Generate Exhibit Cover Sheet</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="separators"
                checked={exhibitSettings.generateSeparators}
                onChange={(e) => setExhibitSettings({...exhibitSettings, generateSeparators: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="separators" className="text-xs">Generate Exhibit Separators</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="description"
                checked={exhibitSettings.includeDescription}
                onChange={(e) => setExhibitSettings({...exhibitSettings, includeDescription: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="description" className="text-xs">Include Document Description</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="confidential"
                checked={exhibitSettings.confidential}
                onChange={(e) => setExhibitSettings({...exhibitSettings, confidential: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="confidential" className="text-xs">Mark as Confidential</label>
            </div>
          </div>
        )}
      </div>
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20",
          isSpiralStyle && dragActive && "border-amber-400 bg-amber-50/20"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className={cn(
            "h-10 w-10 mb-2",
            isSpiralStyle ? "text-amber-500" : "text-muted-foreground"
          )} />
          <h3 className="text-lg font-medium">Drag & Drop Files</h3>
          <p className="text-sm text-muted-foreground">
            or <label className={cn(
              "cursor-pointer underline",
              isSpiralStyle ? "text-amber-600" : "text-primary"
            )}>
              browse
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleChange}
                disabled={uploading}
              />
            </label>
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOCX, TXT
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium">Files to upload</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-accent/10"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="p-1 rounded-full hover:bg-accent/50"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          
          {isExhibitMode && documentType === 'exhibit_bulk' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md mt-3">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  These documents will be processed as a set of exhibits. You'll be prompted to review and confirm the exhibit order and descriptions after upload.
                </p>
              </div>
            </div>
          )}
          
          {isLegalMode && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md mt-3">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  {documentType === 'evidence' || documentType === 'exhibit_bulk' 
                    ? 'These documents will be prepared as exhibits with the specified settings. You can reference them in your legal documents after uploading.'
                    : 'Legal documents will be analyzed for relevant legal principles, citations, and arguments that can be referenced in AI responses.'}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            className={cn(
              "mt-3 w-full py-2 px-4 rounded-md transition-colors flex items-center justify-center",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              uploading ? "opacity-80" : "",
              isSpiralStyle
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isExhibitMode && (documentType === 'evidence' || documentType === 'exhibit_bulk') 
                  ? `Process ${files.length} exhibit${files.length !== 1 ? 's' : ''}`
                  : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}