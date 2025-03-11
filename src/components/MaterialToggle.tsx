import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { 
  Layers, 
  Box, 
  Sparkles, 
  Palette, 
  MousePointer, 
  Droplet,
  Wand2,
  Flame,
  Cloud,
  Stars,
  Settings,
  Sliders,
  Play,
  Save
} from 'lucide-react';
import { useOverlayStore, MaterialType, BlendMode } from '../stores/theme/overlayStore';
import { useRipple } from '../hooks/useRipple';
import { useParticles } from '../hooks/useParticles';

interface MaterialPreset {
  type: MaterialType;
  opacity: number;
  blur?: number;
  refraction?: number;
  metallic?: number;
  roughness?: number;
  ripple?: number;
  animation?: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

// Add type for MaterialPreview props
interface MaterialPreviewProps {
  type: MaterialType;
  className?: string;
}

// Update the animation options type
interface AnimationOption {
  id: string;
  label: string;
  className: string;
}

const MaterialToggle: React.FC = () => {
  const { material, setMaterial, setOpacity, setEffect, setMixing, updateMaterial } = useOverlayStore();
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'customize' | 'animation'>('presets');
  const createRipple = useRipple();
  const particleRef = useParticles({
    count: 20,
    speed: 3,
    color: '#ffffff',
    size: 4,
    spread: 100
  });

  const materialPresets: Record<string, MaterialPreset> = {
    glass: { type: 'glass', opacity: 0.5, blur: 8, refraction: 0.2 },
    metal: { type: 'metal', opacity: 0.7, metallic: 0.8, roughness: 0.2 },
    water: { type: 'water', opacity: 0.6, ripple: 0.5, refraction: 0.3 },
    crystal: { type: 'crystal', opacity: 0.4, blur: 12, refraction: 0.4 },
    frost: { type: 'frost', opacity: 0.8, blur: 16, roughness: 0.7 },
    hologram: { type: 'hologram', opacity: 0.3, blur: 4, refraction: 0.5 },
    mirror: { type: 'mirror', opacity: 0.9, metallic: 1, roughness: 0 }
  };

  const easingOptions = [
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'linear',
    'cubic-bezier(0.4, 0, 0.2, 1)'
  ];

  // Update materials array with proper typing
  const materials: Array<{ type: MaterialType; label: string; icon: LucideIcon }> = [
    { type: 'none', label: 'None', icon: Layers },
    { type: 'glass', label: 'Glass', icon: Droplet },
    { type: 'metal', label: 'Metal', icon: Box },
    { type: 'water', label: 'Water', icon: Droplet },
    { type: 'crystal', label: 'Crystal', icon: Stars },
    { type: 'frost', label: 'Frost', icon: Cloud },
    { type: 'hologram', label: 'Hologram', icon: Wand2 },
    { type: 'mirror', label: 'Mirror', icon: Box }
  ] as const;

  // Update mixingOptions array with proper typing
  const mixingOptions: Array<{ blend: BlendMode; label: string }> = [
    { blend: 'overlay', label: 'Overlay' },
    { blend: 'multiply', label: 'Multiply' },
    { blend: 'screen', label: 'Screen' },
    { blend: 'color-dodge', label: 'Color Dodge' }
  ] as const;

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpacity(parseFloat(e.target.value) || 0);
  };

  const handleEffectChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setEffect(key, parseFloat(e.target.value) || 0);
  };

  // Update MaterialPreview component with proper typing
  const MaterialPreview: React.FC<MaterialPreviewProps> = ({ type, className = '' }) => (
  <div
    className={`w-full h-20 rounded-lg ${type !== 'none' ? `material-${type}` : ''} ${className}`}
    style={{
      '--material-opacity': material.opacity || 0.5,
      '--material-blur': `${material.blur || 8}px`,
      '--material-metallic': material.metallic || 0.8,
      '--material-roughness': material.roughness || 0.2,
      '--material-ripple': material.ripple || 30
    } as React.CSSProperties}
  />
);

  // Add new effect options
  const effectOptions = [
    { id: '3d', label: '3D Transform', icon: Box },
    { id: 'particles', label: 'Particles', icon: Sparkles },
    { id: 'color-shift', label: 'Color Shift', icon: Palette },
    { id: 'interactive', label: 'Interactive', icon: MousePointer }
  ];

  // Update animation options with proper typing
  const animationOptions: AnimationOption[] = [
    { id: 'rainbow', label: 'Rainbow', className: 'color-shift-rainbow' },
    { id: 'pulse', label: 'Pulse', className: 'color-shift-pulse' },
    { id: 'neon', label: 'Neon', className: 'color-shift-neon' },
    { id: 'float', label: 'Float', className: 'float-effect' }
  ];

  // Update animation type handling
  const handleAnimationTypeChange = (id: string) => {
    if (material.animation) {
      updateMaterial({
        animation: {
          ...material.animation,
          type: id as 'fade' | 'slide' | 'scale' | 'rotate'
        }
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          createRipple(e);
          setShowPreview(!showPreview);
        }}
        className="p-2 rounded-lg hover:bg-muted transition-colors material-base"
      >
        <Settings className="h-5 w-5" />
      </button>

      {showPreview && (
        <div className="absolute right-0 mt-2 p-4 bg-card border rounded-lg shadow-lg w-80 z-50">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Material Effects</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`p-2 rounded ${activeTab === 'presets' ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                >
                  <Layers className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab('customize')}
                  className={`p-2 rounded ${activeTab === 'customize' ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab('animation')}
                  className={`p-2 rounded ${activeTab === 'animation' ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Material Selection */}
            <div className="grid grid-cols-2 gap-2">
              {materials.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={(e) => {
                    createRipple(e);
                    setMaterial(type);
                  }}
                  className={`px-3 py-2 rounded border material-base flex items-center gap-2 ${
                    material.type === type ? 'border-primary' : 'border-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Material Preview */}
            <MaterialPreview type={material.type} />

            {material.type !== 'none' && (
              <div className="space-y-4">
                {/* Common Controls */}
                <div>
                  <label className="text-sm block mb-1">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={material.opacity || 0.5}
                    onChange={handleOpacityChange}
                    className="w-full"
                  />
                </div>

                {/* Material-specific Controls */}
                {(material.type === 'glass' || material.type === 'crystal' || material.type === 'frost') && (
                  <div>
                    <label className="text-sm block mb-1">Blur</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={material.blur || 8}
                      onChange={(e) => handleEffectChange('blur', e)}
                      className="w-full"
                    />
                  </div>
                )}

                {(material.type === 'metal' || material.type === 'mirror') && (
                  <>
                    <div>
                      <label className="text-sm block mb-1">Metallic</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={material.metallic || 0.8}
                        onChange={(e) => handleEffectChange('metallic', e)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm block mb-1">Roughness</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={material.roughness || 0.2}
                        onChange={(e) => handleEffectChange('roughness', e)}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {material.type === 'water' && (
                  <div>
                    <label className="text-sm block mb-1">Ripple</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={material.ripple || 30}
                      onChange={(e) => handleEffectChange('ripple', e)}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Material Mixing */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Mix with</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {mixingOptions.map(({ blend, label }) => (
                      <button
                        key={blend}
                        onClick={() => setMixing(blend)}
                        className="px-3 py-2 rounded border material-base"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Responsive Behavior */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={material.responsive || false}
                      onChange={(e) => setEffect('responsive', e.target.checked)}
                    />
                    <span className="text-sm">Enable responsive effects</span>
                  </label>
                </div>

                {/* Effect Controls */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Effects</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {effectOptions.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setEffect(id, !material[id])}
                        className={`px-3 py-2 rounded border material-base flex items-center gap-2 ${
                          material[id] ? 'border-primary' : 'border-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation Controls */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Animations</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {animationOptions.map(({ id, label, className }) => (
                      <button
                        key={id}
                        onClick={() => handleAnimationTypeChange(id)}
                        className={`px-3 py-2 rounded border material-base ${
                          material.animation?.type === id ? 'border-primary' : 'border-muted'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Particle System */}
                {material.particles && (
                  <div ref={particleRef} className="particle-system" />
                )}

                <button
                  className="w-full px-3 py-2 mt-2 rounded bg-primary text-white flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save as Preset
                </button>
              </div>
            )}

            {activeTab === 'animation' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Enable Animation</label>
                  <input
                    type="checkbox"
                    checked={material.animation?.enabled || false}
                    onChange={(e) => updateMaterial({
                      animation: { 
                        ...material.animation,
                        enabled: e.target.checked,
                        duration: material.animation?.duration || 300,
                        easing: material.animation?.easing || 'ease',
                        type: material.animation?.type || 'fade'
                      }
                    })}
                  />
                </div>

                {material.animation?.enabled && (
                  <>
                    <div>
                      <label className="text-sm block mb-1">Duration (ms)</label>
                      <input
                        type="number"
                        min="0"
                        max="2000"
                        step="100"
                        value={material.animation?.duration || 300}
                        onChange={(e) => updateMaterial({
                          animation: { 
                            ...material.animation,
                            duration: parseInt(e.target.value) || 300
                          }
                        })}
                        className="w-full px-2 py-1 rounded border border-border"
                      />
                    </div>

                    <div>
                      <label className="text-sm block mb-1">Easing</label>
                      <select
                        value={material.animation?.easing || 'ease'}
                        onChange={(e) => updateMaterial({
                          animation: { 
                            ...material.animation,
                            easing: e.target.value
                          }
                        })}
                        className="w-full px-2 py-1 rounded border border-border"
                      >
                        {easingOptions.map((easing) => (
                          <option key={easing} value={easing}>{easing}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialToggle; 