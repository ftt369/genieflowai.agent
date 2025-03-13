import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/themeStore';
import { type ColorProfile, type ThemeMode } from '@/config/theme';

const colorProfiles: { id: ColorProfile; name: string; description: string }[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'A balanced color scheme suitable for most users'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold and energetic colors for a lively interface'
  },
  {
    id: 'muted',
    name: 'Muted',
    description: 'Softer, more subdued colors for reduced visual intensity'
  },
  {
    id: 'contrast',
    name: 'High Contrast',
    description: 'Maximum contrast for better accessibility'
  }
];

const modes: { id: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { id: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
  { id: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
  { id: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' }
];

export function ThemeControls() {
  const { mode, profile, intensity, setMode, setProfile, setIntensity } = useThemeStore();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Mode</h3>
        <div className="flex gap-2">
          {modes.map(({ id, icon, label }) => (
            <Button
              key={id}
              variant={mode === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode(id)}
              className="flex-1"
            >
              {icon}
              <span className="ml-2">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Color Profile</h3>
        <div className="grid grid-cols-2 gap-2">
          {colorProfiles.map(({ id, name, description }) => (
            <Button
              key={id}
              variant={profile === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProfile(id)}
              className={`flex flex-col items-start gap-1 h-auto p-4 ${
                profile === id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <span className="font-medium">{name}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium leading-none">Color Intensity</h3>
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer 
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary 
              [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lighter</span>
            <span>Default</span>
            <span>Darker</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Theme changes are automatically saved
      </p>
    </div>
  );
}

export default ThemeControls; 