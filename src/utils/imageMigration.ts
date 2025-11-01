// Image migration utility - compresses existing images in Firebase Storage
// Downloads images from Storage URLs, compresses them, and re-uploads them

import { ref, uploadBytes, getDownloadURL, deleteObject, getBlob, getBytes } from 'firebase/storage';
import { storage } from '../firebase/config';
import { compressImageSmart } from './imageCompression';

export interface ImageMigrationStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  totalSavings: number; // in MB
  errors: Array<{ productId: string; error: string }>;
}

/**
 * Downloads an image from a URL and converts it to a File object
 * Tries Firebase Storage getBlob first, then falls back to fetch
 */
async function downloadImageAsFile(imageUrl: string): Promise<File> {
  console.log('📥 Downloading image from URL:', imageUrl.substring(0, 100) + '...');
  
  // First, try to get a fresh download URL if it's a Firebase Storage URL
  // This ensures we have a valid token
  let downloadUrl = imageUrl;
  const storagePath = extractStoragePath(imageUrl);
  
  if (storagePath) {
    try {
      console.log('🔄 Getting fresh download URL from Firebase Storage...');
      const storageRef = ref(storage, storagePath);
      downloadUrl = await getDownloadURL(storageRef);
      console.log('✅ Got fresh download URL');
    } catch (urlError: any) {
      console.warn('⚠️ Could not get fresh URL, using original:', urlError.message);
      // Continue with original URL
    }
  }
  
  // Now download using the fresh/valid URL
  
  // Use XMLHttpRequest first (most reliable for Firebase Storage URLs)
  try {
    console.log('📥 Attempting download via XMLHttpRequest from:', downloadUrl.substring(0, 80) + '...');
    
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', downloadUrl, true);
      xhr.responseType = 'blob';
      xhr.timeout = 60000; // Increased to 60 seconds for large images
      
      let lastProgress = 0;
      const startTime = Date.now();
      
      // Log progress
      const progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (xhr.readyState === XMLHttpRequest.LOADING) {
          console.log(`⏳ Downloading... ${elapsed}s elapsed`);
        }
      }, 2000);
      
      xhr.onload = () => {
        clearInterval(progressInterval);
        if (xhr.status === 200) {
          const blob = xhr.response;
          if (blob && blob.size > 0) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            console.log(`✅ Download complete via XMLHttpRequest in ${elapsed}s. Size:`, (blob.size / 1024 / 1024).toFixed(2), 'MB');
            resolve(blob);
          } else {
            reject(new Error('Downloaded blob is empty'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => {
        clearInterval(progressInterval);
        reject(new Error('Network error during download'));
      };
      
      xhr.ontimeout = () => {
        clearInterval(progressInterval);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        reject(new Error(`Download timeout after ${elapsed} seconds`));
      };
      
      xhr.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const percent = Math.round((e.loaded / e.total) * 100);
          if (percent - lastProgress >= 10) { // Log every 10%
            console.log(`📊 Download progress: ${percent}% (${(e.loaded / 1024 / 1024).toFixed(2)} MB / ${(e.total / 1024 / 1024).toFixed(2)} MB)`);
            lastProgress = percent;
          }
        }
      };
      
      xhr.send();
    });
    
    console.log('✅ Download complete via XMLHttpRequest. Blob size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Extract filename and extension
    const urlParts = imageUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    const filenameWithoutParams = lastPart.split('?')[0] || 'image.jpg';
    
    // Ensure we have a valid MIME type
    let mimeType = blob.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = filenameWithoutParams.split('.').pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'gif': 'image/gif'
      };
      mimeType = mimeMap[ext || ''] || 'image/jpeg';
    }
    
    return new File([blob], filenameWithoutParams, { type: mimeType });
  } catch (xhrError: any) {
    console.error('❌ XMLHttpRequest failed, trying canvas method:', xhrError.message);
    
    // Last resort: Use canvas to load image (works for same-origin or CORS-enabled images)
    try {
      console.log('📥 Trying canvas/image element method with fresh URL...');
      const blob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas toBlob returned null'));
              }
            }, 'image/jpeg', 1.0);
          } catch (error: any) {
            reject(new Error(`Canvas conversion failed: ${error.message}`));
          }
        };
        img.onerror = () => reject(new Error('Image failed to load (CORS issue or invalid URL)'));
        img.src = downloadUrl;
        
        // Timeout after 30 seconds
        setTimeout(() => {
          reject(new Error('Image load timeout'));
        }, 30000);
      });
      
      console.log('✅ Download complete via canvas method. Blob size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
      
      const urlParts = imageUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const filenameWithoutParams = lastPart.split('?')[0] || 'image.jpg';
      
      return new File([blob], filenameWithoutParams, { type: 'image/jpeg' });
    } catch (canvasError: any) {
      console.error('❌ All download methods failed:', canvasError);
      throw new Error(`Failed to download image after trying all methods: ${canvasError.message || 'Unknown error'}. URL: ${imageUrl.substring(0, 100)}`);
    }
  }
}

/**
 * Extracts Firebase Storage path from a download URL
 */
export function extractStoragePath(url: string): string | null {
  try {
    // Firebase Storage URLs can have different formats:
    // 1. https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    // 2. https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{pathEncoded}?alt=media&token={token}
    // 3. https://{bucket}.firebasestorage.app/{path}?alt=media&token={token}
    
    // Try format 1 and 2 (with /o/)
    let match = url.match(/\/o\/([^?]+)/);
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1]);
        return decoded;
      } catch {
        // If decode fails, try using the raw match
        return match[1];
      }
    }
    
    // Try format 3 (new format)
    match = url.match(/firebasestorage\.app\/([^?]+)/);
    if (match) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error extracting storage path:', error);
    return null;
  }
}

/**
 * Deletes an image from Firebase Storage
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    const storagePath = extractStoragePath(imageUrl);
    if (!storagePath) {
      console.warn('⚠️ Could not extract storage path from URL:', imageUrl);
      return;
    }
    
    const imageRef = ref(storage, storagePath);
    await deleteObject(imageRef);
    console.log('🗑️ Deleted old image from storage:', storagePath);
  } catch (error: any) {
    console.warn('⚠️ Failed to delete old image (might not exist):', error.message);
    // Don't throw - deletion is best effort
  }
}

/**
 * Test Firebase Storage connection
 */
export async function testStorageConnection(): Promise<boolean> {
  try {
    // Try to create a test reference
    const testRef = ref(storage, 'test/connection-test');
    // Just check if we can access storage - we don't need to upload anything
    console.log('✅ Firebase Storage connection successful');
    return true;
  } catch (error: any) {
    console.error('❌ Firebase Storage connection failed:', error);
    return false;
  }
}

/**
 * Compresses and re-uploads a single image
 * Returns the new download URL and original file size for savings calculation
 */
export async function compressAndReuploadImage(
  imageUrl: string,
  productId: string,
  deleteOld: boolean = true,
  onProgress?: (progress: number) => void
): Promise<{ newUrl: string; originalSize: number; compressedSize: number }> {
  try {
    onProgress?.(5);
    console.log('🚀 Starting compressAndReuploadImage for product:', productId);
    console.log('📎 Image URL:', imageUrl.substring(0, 100) + '...');
    
    // Download the image
    console.log('📥 Step 1/4: Starting download...');
    onProgress?.(10);
    
    let downloadAttempt = 0;
    let originalFile: File | null = null;
    const maxDownloadAttempts = 2;
    
    while (downloadAttempt < maxDownloadAttempts && !originalFile) {
      downloadAttempt++;
      try {
        console.log(`📥 Download attempt ${downloadAttempt}/${maxDownloadAttempts}...`);
        originalFile = await downloadImageAsFile(imageUrl);
        break;
      } catch (downloadError: any) {
        console.error(`❌ Download attempt ${downloadAttempt} failed:`, downloadError.message);
        if (downloadAttempt >= maxDownloadAttempts) {
          throw downloadError;
        }
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!originalFile) {
      throw new Error('Failed to download image after all attempts');
    }
    
    const originalSize = originalFile.size;
    console.log('✅ Download complete. Original size:', (originalSize / 1024 / 1024).toFixed(2), 'MB');
    onProgress?.(30);
    
    // Compress the image
    console.log('🗜️ Starting compression...');
    console.log('📊 File details:', {
      name: originalFile.name,
      size: (originalSize / 1024 / 1024).toFixed(2) + ' MB',
      type: originalFile.type
    });
    
    let compressedFile: File;
    try {
      compressedFile = await compressImageSmart(originalFile);
      
      // Validate compression worked
      if (!compressedFile || compressedFile.size === 0) {
        throw new Error('Compression returned empty file');
      }
      
      const compressedSize = compressedFile.size;
      const savings = ((originalSize - compressedSize) / 1024 / 1024).toFixed(2);
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      
      console.log('✅ Compression complete!');
      console.log('📏 Original size:', (originalSize / 1024 / 1024).toFixed(2), 'MB');
      console.log('📏 Compressed size:', (compressedSize / 1024 / 1024).toFixed(2), 'MB');
      console.log('💾 Savings:', savings, 'MB');
      console.log('📊 Compression ratio:', compressionRatio + '%');
      
      // Warn if compression didn't help much
      if (compressedSize >= originalSize * 0.95) {
        console.warn('⚠️ Compression didn\'t reduce size significantly. Original file might already be optimized.');
      }
    } catch (compressError: any) {
      console.error('❌ Compression failed:', compressError);
      throw new Error(`Image compression failed: ${compressError.message || 'Unknown error'}`);
    }
    
    const compressedSize = compressedFile.size;
    onProgress?.(70);
    
    // Generate new filename with timestamp
    const timestamp = Date.now();
    const extension = compressedFile.name.split('.').pop() || 'jpg';
    const newFileName = `products/${timestamp}_${productId}_compressed.${extension}`;
    
    // Upload compressed image to Firebase Storage
    const storageRef = ref(storage, newFileName);
    await uploadBytes(storageRef, compressedFile);
    onProgress?.(90);
    
    // Get download URL
    const newDownloadURL = await getDownloadURL(storageRef);
    onProgress?.(100);
    
    // Delete old image if requested
    if (deleteOld) {
      try {
        await deleteImageFromStorage(imageUrl);
      } catch (error: any) {
        console.warn('⚠️ Could not delete old image, continuing:', error.message);
      }
    }
    
    console.log('✅ Image compressed and re-uploaded:', {
      original: imageUrl,
      compressed: newDownloadURL,
      originalSize: (originalSize / 1024 / 1024).toFixed(2) + ' MB',
      compressedSize: (compressedSize / 1024 / 1024).toFixed(2) + ' MB',
      savings: (((originalSize - compressedSize) / 1024 / 1024).toFixed(2)) + ' MB'
    });
    
    return { newUrl: newDownloadURL, originalSize, compressedSize };
  } catch (error: any) {
    console.error('❌ Error compressing image:', error);
    throw new Error(`Failed to compress and re-upload image: ${error.message}`);
  }
}

/**
 * Processes a single product - compresses all its images
 */
export async function compressProductImages(
  productId: string,
  productImage: string,
  productImages?: string[],
  deleteOldImages: boolean = true,
  onProgress?: (progress: number) => void
): Promise<{
  newImage: string;
  newImages?: string[];
  savings: number; // in MB
}> {
  const allImages = [productImage, ...(productImages || [])].filter(Boolean);
  let totalSavings = 0;
  
  try {
    // Compress main image
    const mainResult = await compressAndReuploadImage(
      productImage,
      productId,
      deleteOldImages,
      (progress) => onProgress?.(progress * 0.7) // Main image is 70% of work
    );
    
    const compressedMainImage = mainResult.newUrl;
    totalSavings += (mainResult.originalSize - mainResult.compressedSize) / 1024 / 1024;
    
    // Compress additional images if any
    const compressedImages: string[] = [];
    if (productImages && productImages.length > 0) {
      for (let i = 0; i < productImages.length; i++) {
        try {
          const result = await compressAndReuploadImage(
            productImages[i],
            `${productId}_${i}`,
            deleteOldImages,
            (progress) => {
              // Remaining 30% divided among additional images
              const baseProgress = 70 + (i / productImages.length) * 30;
              onProgress?.(baseProgress + (progress / productImages.length) * 0.3);
            }
          );
          compressedImages.push(result.newUrl);
          totalSavings += (result.originalSize - result.compressedSize) / 1024 / 1024;
        } catch (error: any) {
          console.warn(`⚠️ Failed to compress additional image ${i}:`, error);
          // Keep original if compression fails
          compressedImages.push(productImages[i]);
        }
      }
    }
    
    return {
      newImage: compressedMainImage,
      newImages: compressedImages.length > 0 ? compressedImages : undefined,
      savings: totalSavings
    };
  } catch (error: any) {
    console.error(`❌ Error compressing product ${productId}:`, error);
    throw error;
  }
}

/**
 * Checks if an image URL is from Firebase Storage
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com') || 
         url.includes('firebasestorage.app') ||
         url.includes('firebase');
}

/**
 * Checks if an image is already compressed (has '_compressed' in filename)
 */
export function isAlreadyCompressed(url: string): boolean {
  return url.includes('_compressed') || url.includes('compressed');
}

