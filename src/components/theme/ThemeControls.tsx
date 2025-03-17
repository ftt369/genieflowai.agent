import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/themeStore';
import { type ColorProfile, type ThemeMode } from '@/config/theme';
import { cn } from '@/lib/utils';

const colorProfiles: { id: ColorProfile; name: string; description: string; icon: JSX.Element }[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean, minimal design',
    icon: <Palette className="w-4 h-4 text-blue-500" />,
  },
  {
    id: 'spiral',
    name: 'Spiral',
    description: 'Gold and blue spiral-inspired theme',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" className="text-[#e6b44c]">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#e6b44c"/>
      <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="#53c5eb"/>
      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#2a4b6b"/>
    </svg>,
  }
];

const modes: { id: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { id: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
  { id: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
  { id: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' }
];

export function ThemeControls() {
  const { mode, profile, intensity, setMode, setProfile, setIntensity } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  // Check if we're using the Spiral theme profile
  const isSpiralStyle = profile === 'spiral';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.theme-controls-container')) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative theme-controls-container">
      <Button 
        variant="outline"
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 bg-white",
          isSpiralStyle
            ? "border-[#e6b44c]/50 text-[#004080] hover:bg-[#e6b44c]/10 hover:border-[#e6b44c]"
            : "border-accent/50 text-accent hover:bg-accent/10 hover:border-accent"
        )}
      >
        {mode === 'light' ? <Sun className="h-4 w-4" /> : 
         mode === 'dark' ? <Moon className="h-4 w-4" /> : 
         <Monitor className="h-4 w-4" />}
        <span className="hidden md:inline">Theme</span>
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-64 p-4 rounded-lg border shadow-lg z-50 backdrop-blur-sm",
          "bg-white text-gray-800 border-gray-200",
          "animate-in fade-in-50 zoom-in-95 slide-in-from-top-5 duration-200",
          isSpiralStyle && "border-[#e6b44c]/30"
        )}>
          <div className="space-y-5">
            {/* Mode Selection */}
            <div className="space-y-2">
              <h3 className={cn(
                "text-sm font-medium leading-none",
                isSpiralStyle ? "text-[#004080]" : "text-accent"
              )}>
                Mode
              </h3>
              <div className="flex gap-2">
                {modes.map(({ id, icon, label }) => (
                  <Button
                    key={id}
                    variant={mode === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode(id)}
                    className={cn(
                      "flex-1 h-8",
                      isSpiralStyle && mode === id && "bg-[#004080] text-white hover:bg-[#01305f]"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {icon}
                      <span className="text-xs">{label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Profiles */}
            <div className="space-y-2">
              <h3 className={cn(
                "text-sm font-medium leading-none",
                isSpiralStyle ? "text-[#004080]" : "text-accent"
              )}>
                Style
              </h3>
              <div className="grid grid-cols-1 gap-2 mt-3">
                {colorProfiles.map((colorProfile) => (
                  <Button
                    key={colorProfile.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setProfile(colorProfile.id)}
                    className={cn(
                      "flex justify-between items-center h-10 px-3 hover:shadow-md transition-all bg-white",
                      profile === colorProfile.id ? (
                        isSpiralStyle && colorProfile.id === 'spiral'
                          ? "border-[#e6b44c]/50 bg-[#e6b44c]/5"
                          : "border-primary"
                      ) : "",
                      isSpiralStyle && colorProfile.id === 'spiral' && "border-[#e6b44c]/30 hover:border-[#e6b44c]/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {colorProfile.icon}
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-medium">{colorProfile.name}</span>
                        <span className="text-xs text-gray-500">{colorProfile.description}</span>
                      </div>
                    </div>
                    {profile === colorProfile.id && (
                      <Check className={cn(
                        "h-4 w-4",
                        isSpiralStyle && colorProfile.id === 'spiral' ? "text-[#004080]" : "text-primary"
                      )} />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Intensity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "text-sm font-medium leading-none",
                  isSpiralStyle ? "text-[#004080]" : "text-accent"
                )}>
                  Intensity
                </h3>
                <span className="text-xs text-gray-500">{Math.round(intensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className={cn(
                  "w-full h-2 rounded-full appearance-none bg-gray-200",
                  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full",
                  isSpiralStyle
                    ? "[&::-webkit-slider-thumb]:bg-[#e6b44c]"
                    : "[&::-webkit-slider-thumb]:bg-primary"
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeControls; 