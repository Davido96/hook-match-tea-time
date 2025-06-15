
import React from 'react';

interface HookLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
}

const HookLogo = ({ size = 'md', className = '' }: HookLogoProps) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    hero: 'text-6xl'
  };

  return (
    <span 
      className={`
        ${sizeClasses[size]} 
        ${className}
        inline-block
        bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600
        bg-clip-text text-transparent
        drop-shadow-lg
        filter
        ${size === 'hero' ? 'animate-float' : ''}
      `}
      style={{
        textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
        filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4))'
      }}
    >
      🪝
    </span>
  );
};

export default HookLogo;
