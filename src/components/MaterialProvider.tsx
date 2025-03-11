import React from 'react';
import { useOverlayStore } from '../stores/theme/overlayStore';

const MaterialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { material } = useOverlayStore();

  // Add CSS variables to :root
  React.useEffect(() => {
    if (!material) return; // Guard against undefined material

    const root = document.documentElement;
    root.style.setProperty('--material-opacity', material.opacity?.toString() || '0.5');
    root.style.setProperty('--material-blur', `${material.blur || 8}px`);
    root.style.setProperty('--material-metallic', (material.metallic || 0.8).toString());
    root.style.setProperty('--material-roughness', (material.roughness || 0.2).toString());
    root.style.setProperty('--material-ripple', (material.ripple || 30).toString());
    root.style.setProperty('--material-refraction', (material.refraction || 0.2).toString());
    root.style.setProperty('--material-animation-duration', `${material.animation?.duration || 300}ms`);
    root.style.setProperty('--material-animation-easing', material.animation?.easing || 'ease');
  }, [material]);

  // Guard against undefined material
  if (!material) {
    return <>{children}</>;
  }

  return (
    <div
      className={`
        material-base
        ${material.type !== 'none' ? `material-${material.type}` : ''}
        ${material.animation?.enabled ? 'material-animated' : ''}
        ${material.responsive ? 'material-interactive' : ''}
      `}
    >
      {children}
    </div>
  );
};

export default MaterialProvider; 