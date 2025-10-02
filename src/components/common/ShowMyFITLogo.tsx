import React from 'react';

interface ShowMyFITLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ShowMyFITLogo: React.FC<ShowMyFITLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8',     // 32px - Small and clean
    md: 'h-10',    // 40px - Medium size
    lg: 'h-12'     // 48px - Large but reasonable
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-2xl'
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
