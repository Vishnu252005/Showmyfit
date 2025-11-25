import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, getOptimizedImageUrl } from '../../utils/imageOptimization';
import { resolveOptimizedUrlWithCache } from '../../utils/imageCache';

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
      const optimizedUrl = await resolveOptimizedUrlWithCache(
        src,
        width,
        height,
        (freshUrl) => {
          // If a fresher URL arrives after initial paint, update source seamlessly
          setImgSrc((current) => (current !== freshUrl ? freshUrl : current));
        }
      );
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

  // Calculate aspect ratio container to prevent CLS
  const aspectRatio = width && height ? (height / width) * 100 : undefined;
  const containerStyle: React.CSSProperties = {
    ...(width && height ? { width, height } : {}),
    ...(aspectRatio && !width && !height ? { paddingBottom: `${aspectRatio}%` } : {}),
    position: 'relative',
    overflow: 'hidden'
  };

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
        fetchPriority={priority ? 'high' : 'auto'}
        className={`transition-opacity duration-300 ${
          isLoaded && !error ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: width && height ? '100%' : 'auto',
          objectFit: 'cover',
          display: 'block'
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

