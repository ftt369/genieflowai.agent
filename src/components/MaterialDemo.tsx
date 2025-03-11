import React from 'react';
import { useOverlayStore } from '../stores/theme/overlayStore';

const MaterialDemo: React.FC = () => {
  const { material } = useOverlayStore();

  const demoCards = [
    { title: 'Glass Card', content: 'Transparent and blurred' },
    { title: 'Metal Card', content: 'Metallic and reflective' },
    { title: 'Water Card', content: 'Flowing and dynamic' },
    { title: 'Crystal Card', content: 'Clear and refractive' },
    { title: 'Frost Card', content: 'Frosted and diffused' },
    { title: 'Hologram Card', content: 'Holographic and shifting' },
    { title: 'Mirror Card', content: 'Reflective and smooth' }
  ];

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {demoCards.map(({ title, content }) => (
        <div
          key={title}
          className={`
            p-6 rounded-lg material-base material-interactive
            ${material.type !== 'none' ? `material-${material.type}` : ''}
          `}
          style={{
            '--material-opacity': material.opacity,
            '--material-blur': `${material.blur}px`,
            '--material-metallic': material.metallic,
            '--material-roughness': material.roughness,
            '--material-ripple': material.ripple
          } as React.CSSProperties}
        >
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p>{content}</p>
        </div>
      ))}
    </div>
  );
};

export default MaterialDemo; 