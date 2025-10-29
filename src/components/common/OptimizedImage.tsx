import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, getOptimizedImageUrl } from '../../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  placeholder = '',
  onLoad,
  onError
}) => {
  // Default placeholder if none provided
  const defaultPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=';
  const [imgSrc, setImgSrc] = useState(placeholder || defaultPlaceholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // If priority is true, load immediately without lazy loading
    if (priority) {
      loadImage();
      return;
    }

    // Use IntersectionObserver for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observerRef.current?.disconnect();
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.01
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      loadImage();
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src]);

  const loadImage = async () => {
    try {
      const optimizedUrl = await getOptimizedImageUrl(src, width, height);
      setImgSrc(optimizedUrl);
      setIsLoaded(true);
    } catch (err) {
      console.error('Error loading optimized image:', err);
      setImgSrc(src); // Fallback to original URL
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  const containerStyle: React.CSSProperties = width && height ? { width, height } : {};

  return (
    <div className={`relative ${className}`} style={containerStyle}>
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Failed to load</span>
        </div>
      )}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={`transition-opacity duration-300 ${
          isLoaded && !error ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-300 text-xs">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

