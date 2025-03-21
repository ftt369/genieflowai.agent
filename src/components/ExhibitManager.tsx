import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, File, FileText, FilePlus, Upload, Download, Trash, MoveHorizontal, ArrowDown, Settings, Eye, RefreshCw, Check, X, Bookmark, FilePlus2 } from 'lucide-react';

// This would typically come from a state management store
type ExhibitFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  dateAdded: Date;
  exhibitNumber?: string;
  description?: string;
  notes?: string;
  file: File;
  preview?: string;
};

type ExportSettings = {
  format: 'pdf' | 'word';
  numberingStyle: 'numeric' | 'alpha' | 'custom';
  prefix: string;
  startNumber: number;
  includeCaseCaption: boolean;
  includeIndex: boolean;
  separatorStyle: 'minimal' | 'detailed' | 'formal';
  pageNumbering: 'continuous' | 'per-exhibit';
  confidentialityMarking: string;
  headerText: string;
  footerText: string;
};

export default function ExhibitManager() {
  const [exhibits, setExhibits] = useState<ExhibitFile[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'pdf',
    numberingStyle: 'numeric',
    prefix: '',
    startNumber: 1,
    includeCaseCaption: true,
    includeIndex: true,
    separatorStyle: 'detailed',
    pageNumbering: 'continuous',
    confidentialityMarking: '',
    headerText: 'EXHIBITS',
    footerText: 'CONFIDENTIAL - SUBJECT TO PROTECTIVE ORDER'
  });
  const [caseName, setCaseName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [court, setCourt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: ExhibitFile[] = Array.from(e.target.files).map((file, index) => ({
        id: `exhibit-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dateAdded: new Date(),
        exhibitNumber: (exhibits.length + index + 1).toString(),
        file: file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
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
        dateAdded: new Date(),
        exhibitNumber: (exhibits.length + index + 1).toString(),
        file: file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));
      setExhibits([...exhibits, ...newFiles]);
    }
  };

  // Update exhibit metadata
  const updateExhibit = (id: string, updates: Partial<ExhibitFile>) => {
    setExhibits(exhibits.map(exhibit => 
      exhibit.id === id ? { ...exhibit, ...updates } : exhibit
    ));
  };

  // Remove an exhibit
  const removeExhibit = (id: string) => {
    setExhibits(exhibits.filter(exhibit => exhibit.id !== id));
  };

  // Reorder exhibits
  const moveExhibit = (id: string, direction: 'up' | 'down') => {
    const index = exhibits.findIndex(exhibit => exhibit.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === exhibits.length - 1)
    ) {
      return;
    }

    const newExhibits = [...exhibits];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newExhibits[index], newExhibits[targetIndex]] = [newExhibits[targetIndex], newExhibits[index]];
    
    // Update exhibit numbers based on new order
    const updatedExhibits = newExhibits.map((exhibit, idx) => ({
      ...exhibit,
      exhibitNumber: (idx + 1).toString()
    }));
    
    setExhibits(updatedExhibits);
  };

  // Generate exhibit separator sheet (this would be implemented with a PDF/Word library)
  const generateSeparatorSheet = (exhibit: ExhibitFile, index: number) => {
    // In a real implementation, this would create an actual separator sheet
    // using a PDF or Word document generation library
    console.log(`Creating separator for Exhibit ${exhibit.exhibitNumber}: ${exhibit.name}`);
    return `Separator sheet for Exhibit ${exhibit.exhibitNumber}`;
  };

  // Export exhibits with separator sheets
  const exportExhibits = () => {
    if (exhibits.length === 0) {
      alert('Please add at least one exhibit to export');
      return;
    }

    setIsProcessing(true);

    // Simulate processing time
    setTimeout(() => {
      try {
        const format = exportSettings.format;
        
        // In a real implementation, this would:
        // 1. Create a new PDF or Word document
        // 2. Add a cover page with case information if needed
        // 3. Generate an index if includeIndex is true
        // 4. For each exhibit:
        //    - Create a separator sheet
        //    - Add the exhibit document
        // 5. Apply page numbering according to settings
        // 6. Add headers/footers as configured
        // 7. Save and download the file

        console.log(`Exporting exhibits to ${format.toUpperCase()} with settings:`, exportSettings);
        console.log('Case information:', { caseName, caseNumber, court });
        console.log('Exhibits to include:', exhibits.map(e => `${e.exhibitNumber}: ${e.name}`).join(', '));
        
        // Mock successful export
        const fileName = `${caseName.replace(/\s+/g, '-')}_Exhibits.${format === 'pdf' ? 'pdf' : 'docx'}`;
        alert(`Exhibits successfully compiled into ${fileName}. In a real implementation, this would download the file.`);
        
        setShowExportDialog(false);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error exporting exhibits:', error);
        alert('There was an error creating the export. Please try again.');
        setIsProcessing(false);
      }
    }, 2000);
  };

  // Render exhibits list
  const renderExhibitsList = () => {
    return exhibits.length > 0 ? (
      <div className="space-y-2 mt-4">
        {exhibits.map((exhibit, index) => (
          <Card key={exhibit.id} className="relative">
            <CardHeader className="py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    {exportSettings.numberingStyle === 'alpha' 
                      ? String.fromCharCode(64 + parseInt(exhibit.exhibitNumber || '1')) 
                      : exhibit.exhibitNumber}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{exhibit.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {(exhibit.size / 1024).toFixed(1)} KB • Added {exhibit.dateAdded.toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => moveExhibit(exhibit.id, 'up')} disabled={index === 0}>
                    <ArrowDown className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => moveExhibit(exhibit.id, 'down')} disabled={index === exhibits.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeExhibit(exhibit.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`exhibit-number-${exhibit.id}`} className="text-xs">Exhibit Number</Label>
                  <Input 
                    id={`exhibit-number-${exhibit.id}`}
                    className="h-8 text-sm"
                    value={exhibit.exhibitNumber || ''}
                    onChange={e => updateExhibit(exhibit.id, { exhibitNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`exhibit-desc-${exhibit.id}`} className="text-xs">Short Description</Label>
                  <Input 
                    id={`exhibit-desc-${exhibit.id}`}
                    className="h-8 text-sm"
                    value={exhibit.description || ''}
                    onChange={e => updateExhibit(exhibit.id, { description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/50 mt-4">
        <FileText className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="font-medium text-sm">No Exhibits Added</h3>
        <p className="text-sm text-muted-foreground mt-1">Upload your first exhibit to begin</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Select Files
        </Button>
      </div>
    );
  };

  return (
    <div className="container px-4 py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exhibit Manager</h1>
          <p className="text-muted-foreground">Organize, label, and compile legal exhibits</p>
        </div>
        <div className="flex gap-2">
          {exhibits.length > 0 && (
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Exhibits
            </Button>
          )}
          <Button onClick={() => fileInputRef.current?.click()}>
            <FilePlus className="h-4 w-4 mr-2" />
            Add Exhibits
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            multiple
          />
        </div>
      </div>

      <div
        className="border border-dashed rounded-lg p-4"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Select 
              value={exportSettings.numberingStyle}
              onValueChange={(value) => 
                setExportSettings({...exportSettings, numberingStyle: value as 'numeric' | 'alpha' | 'custom'})
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Numbering Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numeric">Numeric (1, 2, 3)</SelectItem>
                <SelectItem value="alpha">Alphabetic (A, B, C)</SelectItem>
                <SelectItem value="custom">Custom Prefix</SelectItem>
              </SelectContent>
            </Select>
            
            {exportSettings.numberingStyle === 'custom' && (
              <Input 
                placeholder="Prefix (e.g., P-)" 
                value={exportSettings.prefix}
                onChange={(e) => setExportSettings({...exportSettings, prefix: e.target.value})}
                className="w-24"
              />
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {exhibits.length} {exhibits.length === 1 ? 'exhibit' : 'exhibits'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="case-name" className="text-sm">Case Name</Label>
            <Input
              id="case-name"
              placeholder="Smith v. Jones"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="case-number" className="text-sm">Case Number</Label>
            <Input
              id="case-number"
              placeholder="CV-2023-12345"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="court" className="text-sm">Court</Label>
            <Input
              id="court"
              placeholder="U.S. District Court for the..."
              value={court}
              onChange={(e) => setCourt(e.target.value)}
            />
          </div>
        </div>

        {renderExhibitsList()}
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Export Exhibits</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="format" className="mt-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="format">Format</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="headers">Headers & Footers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="format" className="py-4 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <div className="flex gap-4">
                      <div 
                        className={`p-3 border rounded-lg flex flex-col items-center cursor-pointer ${exportSettings.format === 'pdf' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setExportSettings({...exportSettings, format: 'pdf'})}
                      >
                        <File className="h-8 w-8 mb-2" />
                        <span>PDF Document</span>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg flex flex-col items-center cursor-pointer ${exportSettings.format === 'word' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setExportSettings({...exportSettings, format: 'word'})}
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Word Document</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Document Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="include-index" 
                          checked={exportSettings.includeIndex}
                          onCheckedChange={(checked) => 
                            setExportSettings({...exportSettings, includeIndex: !!checked})
                          }
                        />
                        <Label htmlFor="include-index" className="text-sm cursor-pointer">Include Exhibit Index</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="include-caption" 
                          checked={exportSettings.includeCaseCaption}
                          onCheckedChange={(checked) => 
                            setExportSettings({...exportSettings, includeCaseCaption: !!checked})
                          }
                        />
                        <Label htmlFor="include-caption" className="text-sm cursor-pointer">Include Case Caption</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Page Numbering</Label>
                  <div className="flex gap-4">
                    <div 
                      className={`p-2 border rounded-lg flex items-center cursor-pointer ${exportSettings.pageNumbering === 'continuous' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportSettings({...exportSettings, pageNumbering: 'continuous'})}
                    >
                      <span className="mr-2">Continuous</span>
                      <span className="text-xs text-muted-foreground">(1, 2, 3...)</span>
                    </div>
                    <div 
                      className={`p-2 border rounded-lg flex items-center cursor-pointer ${exportSettings.pageNumbering === 'per-exhibit' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportSettings({...exportSettings, pageNumbering: 'per-exhibit'})}
                    >
                      <span className="mr-2">Per-Exhibit</span>
                      <span className="text-xs text-muted-foreground">(Ex.1 p.1, Ex.2 p.1...)</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="py-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Separator Page Style</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={`p-3 border rounded-lg flex flex-col items-center cursor-pointer ${exportSettings.separatorStyle === 'minimal' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportSettings({...exportSettings, separatorStyle: 'minimal'})}
                    >
                      <div className="h-20 w-full border flex items-center justify-center mb-2">
                        <span className="font-bold text-xl">Ex. 1</span>
                      </div>
                      <span className="text-sm">Minimal</span>
                    </div>
                    <div 
                      className={`p-3 border rounded-lg flex flex-col items-center cursor-pointer ${exportSettings.separatorStyle === 'detailed' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportSettings({...exportSettings, separatorStyle: 'detailed'})}
                    >
                      <div className="h-20 w-full border flex flex-col items-center justify-center gap-1 mb-2">
                        <span className="font-bold text-xl">EXHIBIT 1</span>
                        <span className="text-xs">Document Name</span>
                        <span className="text-xs text-muted-foreground">Date</span>
                      </div>
                      <span className="text-sm">Detailed</span>
                    </div>
                    <div 
                      className={`p-3 border rounded-lg flex flex-col items-center cursor-pointer ${exportSettings.separatorStyle === 'formal' ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setExportSettings({...exportSettings, separatorStyle: 'formal'})}
                    >
                      <div className="h-20 w-full border flex flex-col gap-1 p-2 mb-2">
                        <div className="text-xs border-b pb-1">Case Name - Case No.</div>
                        <div className="flex-1 flex items-center justify-center flex-col">
                          <span className="font-bold">EXHIBIT 1</span>
                          <span className="text-xs">Description</span>
                        </div>
                      </div>
                      <span className="text-sm">Formal</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-number" className="mb-2 block">Starting Number</Label>
                    <Input 
                      id="start-number"
                      type="number"
                      min="1"
                      value={exportSettings.startNumber}
                      onChange={(e) => setExportSettings({...exportSettings, startNumber: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confidentiality" className="mb-2 block">Confidentiality Marking</Label>
                    <Input 
                      id="confidentiality"
                      placeholder="Leave blank if none"
                      value={exportSettings.confidentialityMarking}
                      onChange={(e) => setExportSettings({...exportSettings, confidentialityMarking: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="headers" className="py-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="header-text" className="mb-2 block">Header Text</Label>
                  <Input 
                    id="header-text"
                    placeholder="Text to appear in the header"
                    value={exportSettings.headerText}
                    onChange={(e) => setExportSettings({...exportSettings, headerText: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will appear at the top of each page. Leave blank for no header.
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="footer-text" className="mb-2 block">Footer Text</Label>
                  <Input 
                    id="footer-text"
                    placeholder="Text to appear in the footer"
                    value={exportSettings.footerText}
                    onChange={(e) => setExportSettings({...exportSettings, footerText: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will appear at the bottom of each page. Leave blank for no footer.
                  </p>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Preview</h4>
                  <div className="bg-muted aspect-video rounded-md p-4 flex flex-col">
                    {exportSettings.headerText && (
                      <div className="text-xs border-b pb-1 text-center">
                        {exportSettings.headerText}
                      </div>
                    )}
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">[Document Content]</span>
                    </div>
                    {exportSettings.footerText && (
                      <div className="text-xs border-t pt-1 text-center">
                        {exportSettings.footerText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={exportExhibits} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {exhibits.length} {exhibits.length === 1 ? 'Exhibit' : 'Exhibits'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 