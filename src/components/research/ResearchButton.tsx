import React, { useCallback, memo } from 'react';
import { FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResearchButtonProps {
  onClick: () => void;
  active?: boolean;
  className?: string;
}

// Use React.memo to prevent unnecessary re-renders
const ResearchButton: React.FC<ResearchButtonProps> = memo(({ 
  onClick, 
  active = false,
  className = ""
}) => {
  // Use useCallback to memoize the click handler
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed right-4 top-4 z-20 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors",
        active && "bg-blue-700",
        className
      )}
      aria-label="Research Assistant"
    >
      <FileSearch className="h-5 w-5" />
    </button>
  );
});

// Add display name for better debugging
ResearchButton.displayName = 'ResearchButton';

export default ResearchButton;