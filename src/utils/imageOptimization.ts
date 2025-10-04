// Image optimization utilities for better SEO and performance

export const optimizeImageUrl = (url: string, width?: number, height?: number, quality: number = 80): string => {
  if (!url) return '';
  
  // For Unsplash images, add optimization parameters
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('fit', 'crop');
    params.append('q', quality.toString());
    params.append('auto', 'format');
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  // For other images, return as is
  return url;
};

export const generateImageSizes = (baseUrl: string) => {
  return {
    thumbnail: optimizeImageUrl(baseUrl, 150, 150, 70),
    small: optimizeImageUrl(baseUrl, 300, 300, 80),
    medium: optimizeImageUrl(baseUrl, 600, 600, 85),
    large: optimizeImageUrl(baseUrl, 1200, 1200, 90),
    xlarge: optimizeImageUrl(baseUrl, 1920, 1920, 95)
  };
};

export const createResponsiveImageSrcSet = (baseUrl: string): string => {
  const sizes = generateImageSizes(baseUrl);
  return `${sizes.small} 300w, ${sizes.medium} 600w, ${sizes.large} 1200w, ${sizes.xlarge} 1920w`;
};

export const generateOGImage = (title: string, subtitle?: string): string => {
  // This would typically generate a dynamic OG image
  // For now, return a placeholder
  const params = new URLSearchParams({
    title: title.substring(0, 50),
    subtitle: subtitle ? subtitle.substring(0, 100) : 'ShowMyFIT Local Marketplace',
    width: '1200',
    height: '630',
    theme: 'light'
  });
  
  return `https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=${encodeURIComponent(title)}`;
};

export const generateTwitterImage = (title: string): string => {
  const params = new URLSearchParams({
    title: title.substring(0, 50),
    width: '1200',
    height: '600',
    theme: 'light'
  });
  
  return `https://via.placeholder.com/1200x600/3B82F6/FFFFFF?text=${encodeURIComponent(title)}`;
};

// Lazy loading utility
export const lazyLoadImage = (img: HTMLImageElement, src: string, srcSet?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            if (srcSet) img.srcset = srcSet;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            observer.unobserve(img);
            resolve();
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
      
      observer.observe(img);
    } else {
      // Fallback for older browsers
      img.src = src;
      if (srcSet) img.srcset = srcSet;
      resolve();
    }
  });
};

// WebP support detection
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Convert image URL to WebP if supported
export const getOptimizedImageUrl = async (url: string, width?: number, height?: number): Promise<string> => {
  if (!url) return '';
  
  const isWebPSupported = await supportsWebP();
  let optimizedUrl = optimizeImageUrl(url, width, height);
  
  if (isWebPSupported && !optimizedUrl.includes('format=webp')) {
    optimizedUrl += (optimizedUrl.includes('?') ? '&' : '?') + 'auto=webp';
  }
  
  return optimizedUrl;
};
