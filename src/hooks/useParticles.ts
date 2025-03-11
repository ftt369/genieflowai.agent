import { useEffect, useRef } from 'react';

interface ParticleSystem {
  count: number;
  speed: number;
  color: string;
  size: number;
  spread: number;
}

export const useParticles = (options: Partial<ParticleSystem> = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    count = 20,
    speed = 3,
    color = '#ffffff',
    size = 4,
    spread = 100
  } = options;

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      
      // Random starting position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random movement
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spread;
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
      
      particle.style.setProperty('--move-x', `${moveX}px`);
      particle.style.setProperty('--move-y', `${moveY}px`);
      particle.style.setProperty('--particle-speed', `${speed}s`);
      
      container.appendChild(particle);
      particles.push(particle);
      
      // Remove particle after animation
      particle.addEventListener('animationend', () => {
        particle.remove();
        particles.splice(particles.indexOf(particle), 1);
      });
    };

    // Create initial particles
    for (let i = 0; i < count; i++) {
      createParticle();
    }

    // Continuously create new particles
    const interval = setInterval(() => {
      if (particles.length < count) {
        createParticle();
      }
    }, speed * 1000 / count);

    return () => {
      clearInterval(interval);
      particles.forEach(particle => particle.remove());
    };
  }, [count, speed, color, size, spread]);

  return containerRef;
}; 