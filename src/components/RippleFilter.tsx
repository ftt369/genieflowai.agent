import React from 'react';

const RippleFilter: React.FC = () => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="ripple">
          <feTurbulence 
            type="turbulence" 
            baseFrequency="0.02 0.15" 
            numOctaves="3" 
            result="turbulence"
          >
            <animate 
              attributeName="baseFrequency" 
              dur="10s" 
              values="0.02 0.15;0.015 0.11;0.02 0.15" 
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="turbulence" 
            scale="30"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default RippleFilter; 