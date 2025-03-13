import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, type ColorProfile } from '@/stores/theme/themeStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const colorProfiles: { id: ColorProfile; name: string; description: string }[] = [
  { id: 'default', name: 'Default', description: 'Standard color scheme' },
  { id: 'vibrant', name: 'Vibrant', description: 'Enhanced colors' },
  { id: 'muted', name: 'Muted', description: 'Softer tones' },
  { id: 'contrast', name: 'High Contrast', description: 'Maximum readability' }
];

export function ThemeMode() {
  const { mode, profile, intensity, setMode, setProfile, setIntensity } = useThemeStore();

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Mode</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode('light')}
            className={cn(
              'flex-1 justify-start',
              mode === 'light' && 'bg-accent text-accent-foreground'
            )}
          >
            <Sun className="h-4 w-4 mr-2" />
            Light
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode('dark')}
            className={cn(
              'flex-1 justify-start',
              mode === 'dark' && 'bg-accent text-accent-foreground'
            )}
          >
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode('system')}
            className={cn(
              'flex-1 justify-start',
              mode === 'system' && 'bg-accent text-accent-foreground'
            )}
          >
            <Monitor className="h-4 w-4 mr-2" />
            System
          </Button>
        </div>
      </div>

      {/* Color Profiles */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Color Profile</h3>
        <div className="grid grid-cols-2 gap-2">
          {colorProfiles.map(({ id, name, description }) => (
            <Button
              key={id}
              variant="outline"
              size="sm"
              onClick={() => setProfile(id)}
              className={cn(
                'h-auto flex-col items-start space-y-1 p-3',
                profile === id && 'bg-accent text-accent-foreground'
              )}
            >
              <div className="font-medium leading-none">{name}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {description}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium leading-none">Color Intensity</h3>
          <p className="text-xs text-muted-foreground">
            Adjust the intensity of the color scheme
          </p>
        </div>
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Lighter</span>
          <span>Default</span>
          <span>Darker</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Theme changes are automatically saved.
      </p>
    </div>
  );
}

export default ThemeMode; 