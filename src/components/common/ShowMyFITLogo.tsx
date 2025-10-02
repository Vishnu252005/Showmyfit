import React from 'react';

interface ShowMyFITLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ShowMyFITLogo: React.FC<ShowMyFITLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-48',    // 192px - ABSOLUTELY HUGE!
    md: 'h-64',    // 256px - MONSTROUS!
    lg: 'h-80'     // 320px - UNBELIEVABLY MASSIVE!
  };

  const textSizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl', 
    lg: 'text-8xl'
  };

  return (
    <div className="relative">
      <img 
        src="/src/assets/showmyfit-logo.png" 
        alt="ShowMyFIT" 
        className={`${sizeClasses[size]} ${className}`}
        onError={(e) => {
          console.error('Logo image failed to load:', e);
          e.currentTarget.style.display = 'none';
          // Show fallback text
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      {/* Fallback text logo */}
      <div 
        className={`${textSizeClasses[size]} font-bold text-white hidden ${className}`}
        style={{ display: 'none' }}
      >
        ShowMyFIT
      </div>
    </div>
  );
};

export default ShowMyFITLogo;
