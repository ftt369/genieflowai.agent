import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileSymlink, FileOutput } from 'lucide-react';
import { useModeStore } from '@/stores/model/modeStore';
import ExhibitExporter from './ExhibitExporter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ExhibitExporterButton() {
  const [showDialog, setShowDialog] = useState(false);
  const { activeMode } = useModeStore();
  const [hasExhibits, setHasExhibits] = useState(false);

  // Check localStorage for any exhibits data
  useEffect(() => {
    const checkForExhibits = () => {
      const exhibitsData = localStorage.getItem('legal-exhibits');
      setHasExhibits(!!exhibitsData && JSON.parse(exhibitsData)?.length > 0);
    };
    
    checkForExhibits();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', checkForExhibits);
    return () => window.removeEventListener('storage', checkForExhibits);
  }, []);
  
  // Only show this component when in Exhibit Preparer mode or Legal Assistant mode
  if (activeMode !== 'legal_exhibit_preparer' && activeMode !== 'legal_assistant' && !activeMode?.includes('legal')) {
    return null;
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex gap-1 items-center relative"
              onClick={() => setShowDialog(true)}
            >
              <FileOutput className="h-4 w-4" />
              <span className="hidden sm:inline">Exhibits</span>
              {hasExhibits && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Manage and Export Legal Exhibits (Alt+E)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Exhibit Export Utility</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <ExhibitExporter />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 