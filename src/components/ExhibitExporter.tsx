import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, File, FileText, FilePlus, Upload, Download, Trash, ArrowDown, RefreshCw, CheckSquare, Square } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type ExhibitFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  exhibitNumber: string;
  description?: string;
  file: File;
};

type ExportSettings = {
  format: 'pdf' | 'word';
  numberingStyle: 'numeric' | 'alpha';
  includeCaseCaption: boolean;
  includeIndex: boolean;
  pageNumbering: 'continuous' | 'per-exhibit';
};

export default function ExhibitExporter() {
  const [exhibits, setExhibits] = useState<ExhibitFile[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'pdf',
    numberingStyle: 'numeric',
    includeCaseCaption: true,
    includeIndex: true,
    pageNumbering: 'continuous'
  });
  const [caseName, setCaseName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load exhibits from localStorage on component mount
  useEffect(() => {
    const savedExhibits = localStorage.getItem('legal-exhibits');
    if (savedExhibits) {
      try {
        // We can't store File objects in localStorage, so we'll just load the metadata
        const parsedExhibits = JSON.parse(savedExhibits);
        setExhibits(parsedExhibits);
      } catch (e) {
        console.error('Error loading saved exhibits:', e);
      }
    }

    const savedSettings = localStorage.getItem('legal-exhibits-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setExportSettings(parsedSettings);
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
    }

    const savedCaseInfo = localStorage.getItem('legal-exhibits-case');
    if (savedCaseInfo) {
      try {
        const { name, number } = JSON.parse(savedCaseInfo);
        setCaseName(name || '');
        setCaseNumber(number || '');
      } catch (e) {
        console.error('Error loading saved case info:', e);
      }
    }

    // Add keyboard shortcut for upload (Alt+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'u') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save exhibits to localStorage whenever they change
  useEffect(() => {
    // Create a version of exhibits that can be saved to localStorage (without File objects)
    const exhibitsForStorage = exhibits.map(({ file, ...rest }) => rest);
    localStorage.setItem('legal-exhibits', JSON.stringify(exhibitsForStorage));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  }, [exhibits]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('legal-exhibits-settings', JSON.stringify(exportSettings));
  }, [exportSettings]);

  // Save case info to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('legal-exhibits-case', JSON.stringify({ name: caseName, number: caseNumber }));
  }, [caseName, caseNumber]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: ExhibitFile[] = Array.from(e.target.files).map((file, index) => ({
        id: `exhibit-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        exhibitNumber: (exhibits.length + index + 1).toString(),
        file: file
      }));
      setExhibits([...exhibits, ...newFiles]);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files) {
      const newFiles: ExhibitFile[] = Array.from(e.dataTransfer.files).map((file, index) => ({
        id: `exhibit-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        exhibitNumber: (exhibits.length + index + 1).toString(),
        file: file
      }));
      setExhibits([...exhibits, ...newFiles]);
    }
  };

  // Update exhibit details
  const updateExhibit = (id: string, updates: Partial<ExhibitFile>) => {
    setExhibits(exhibits.map(exhibit => 
      exhibit.id === id ? { ...exhibit, ...updates } : exhibit
    ));
  };

  // Remove an exhibit
  const removeExhibit = (id: string) => {
    setExhibits(exhibits.filter(exhibit => exhibit.id !== id));
  };

  // Export exhibits
  const exportExhibits = () => {
    if (exhibits.length === 0) {
      alert('Please add at least one exhibit to export');
      return;
    }

    setIsProcessing(true);

    // Simulate export process
    setTimeout(() => {
      try {
        const format = exportSettings.format;
        
        // Mock export process
        console.log(`Exporting ${exhibits.length} exhibits to ${format} format`);
        console.log('Settings:', exportSettings);
        console.log('Case:', caseName, caseNumber);
        
        const fileName = `${caseName.replace(/\s+/g, '-')}_Exhibits.${format === 'pdf' ? 'pdf' : 'docx'}`;
        alert(`Successfully created ${fileName} with ${exhibits.length} exhibits. In a real implementation, this would download the file.`);
        
        setShowExportDialog(false);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error exporting exhibits:', error);
        alert('There was an error creating the export. Please try again.');
        setIsProcessing(false);
      }
    }, 1500);
  };

  // Handle exhibit reordering
  const moveExhibit = (id: string, direction: 'up' | 'down') => {
    const index = exhibits.findIndex(e => e.id === id);
    if (index === -1) return;
    
    const newExhibits = [...exhibits];
    
    if (direction === 'up' && index > 0) {
      // Swap with previous item
      [newExhibits[index], newExhibits[index - 1]] = [newExhibits[index - 1], newExhibits[index]];
    } else if (direction === 'down' && index < exhibits.length - 1) {
      // Swap with next item
      [newExhibits[index], newExhibits[index + 1]] = [newExhibits[index + 1], newExhibits[index]];
    }
    
    // Renumber exhibits
    newExhibits.forEach((exhibit, i) => {
      exhibit.exhibitNumber = (i + 1).toString();
    });
    
    setExhibits(newExhibits);
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Legal Exhibits Exporter</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExhibits([])} disabled={exhibits.length === 0}>
            <Trash className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={() => setShowExportDialog(true)} disabled={exhibits.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export to PDF/Word
          </Button>
        </div>
      </div>
      
      <div 
        className="border-2 border-dashed rounded-lg p-6 mb-4 text-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <FilePlus className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <h4 className="text-sm font-medium mb-1">Add Your Exhibit Files</h4>
          <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Select Files
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          multiple
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="case-name">Case Name</Label>
          <Input
            id="case-name"
            placeholder="Smith v. Jones"
            value={caseName}
            onChange={(e) => setCaseName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="case-number">Case Number</Label>
          <Input
            id="case-number"
            placeholder="CV-2023-12345"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
          />
        </div>
      </div>
      
      {exhibits.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Your Exhibits ({exhibits.length})</h4>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setExportSettings({
                  ...exportSettings, 
                  numberingStyle: exportSettings.numberingStyle === 'numeric' ? 'alpha' : 'numeric'
                })}
              >
                {exportSettings.numberingStyle === 'numeric' ? 'Using Numbers' : 'Using Letters'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {exhibits.map((exhibit, index) => (
              <div key={exhibit.id} className="flex items-center p-3 border rounded-lg">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                  {exportSettings.numberingStyle === 'alpha' 
                    ? String.fromCharCode(64 + parseInt(exhibit.exhibitNumber || '1'))
                    : exhibit.exhibitNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{exhibit.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exhibit.size ? `${(exhibit.size / 1024).toFixed(1)} KB` : 'Size N/A'}
                  </p>
                </div>
                <Input
                  value={exhibit.description || ''}
                  onChange={(e) => updateExhibit(exhibit.id, { description: e.target.value })}
                  placeholder="Description"
                  className="w-40 h-8 mx-2"
                />
                <div className="flex">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => moveExhibit(exhibit.id, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowDown className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => moveExhibit(exhibit.id, 'down')}
                    disabled={index === exhibits.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeExhibit(exhibit.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Exhibits</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="format">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="format">Format</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="format" className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-4 border rounded-lg flex flex-col items-center cursor-pointer ${exportSettings.format === 'pdf' ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setExportSettings({...exportSettings, format: 'pdf'})}
                >
                  <File className="h-8 w-8 mb-2" />
                  <h4 className="font-medium">PDF Document</h4>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Create a PDF with bookmarks and separator pages
                  </p>
                </div>
                <div 
                  className={`p-4 border rounded-lg flex flex-col items-center cursor-pointer ${exportSettings.format === 'word' ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setExportSettings({...exportSettings, format: 'word'})}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <h4 className="font-medium">Word Document</h4>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Create a Word document with exhibit separator pages
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="options" className="py-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex h-5 items-center space-x-2">
                    <button 
                      type="button"
                      onClick={() => setExportSettings({
                        ...exportSettings, 
                        includeIndex: !exportSettings.includeIndex
                      })}
                      className="flex items-center justify-center"
                    >
                      {exportSettings.includeIndex ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <Label htmlFor="include-index">Include Exhibit Index</Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex h-5 items-center space-x-2">
                    <button 
                      type="button"
                      onClick={() => setExportSettings({
                        ...exportSettings, 
                        includeCaseCaption: !exportSettings.includeCaseCaption
                      })}
                      className="flex items-center justify-center"
                    >
                      {exportSettings.includeCaseCaption ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <Label htmlFor="include-caption">Include Case Caption</Label>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Page Numbering</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      className={`p-2 border rounded-lg text-center cursor-pointer ${exportSettings.pageNumbering === 'continuous' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportSettings({...exportSettings, pageNumbering: 'continuous'})}
                    >
                      <p className="text-sm font-medium">Continuous</p>
                      <p className="text-xs text-muted-foreground">1, 2, 3...</p>
                    </div>
                    <div 
                      className={`p-2 border rounded-lg text-center cursor-pointer ${exportSettings.pageNumbering === 'per-exhibit' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportSettings({...exportSettings, pageNumbering: 'per-exhibit'})}
                    >
                      <p className="text-sm font-medium">Per-Exhibit</p>
                      <p className="text-xs text-muted-foreground">Ex1-1, Ex2-1...</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={exportExhibits} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {exhibits.length} {exhibits.length === 1 ? 'Exhibit' : 'Exhibits'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 