import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  currentImage,
  maxSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Please upload a valid image file. Accepted formats: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const uploadImage = async (file: File): Promise<string> => {
    console.log('🖼️ ImageUpload: Starting upload for file:', file.name, 'Size:', file.size);
    
    const validationError = validateFile(file);
    if (validationError) {
      console.error('🖼️ ImageUpload: Validation failed:', validationError);
      throw new Error(validationError);
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `products/${timestamp}_${file.name}`;
    console.log('🖼️ ImageUpload: Uploading to path:', fileName);
    
    const storageRef = ref(storage, fileName);

    try {
      // Upload file to Firebase Storage
      console.log('🖼️ ImageUpload: Starting uploadBytes...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('🖼️ ImageUpload: Upload completed, getting download URL...');
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🖼️ ImageUpload: Got download URL:', downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error('🖼️ ImageUpload: Upload failed:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (Firebase doesn't provide real-time progress for uploadBytes)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const imageUrl = await uploadImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Small delay to show 100% progress
      setTimeout(() => {
        console.log('🖼️ ImageUpload: Calling onImageUpload with URL:', imageUrl);
        onImageUpload(imageUrl);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error: any) {
      setError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [disabled, onImageUpload, maxSize, acceptedTypes]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemoveImage = () => {
    if (disabled) return;
    onImageRemove?.();
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload product image"
        title="Select image file to upload"
      />

      {currentImage ? (
        // Image Preview
        <div className="relative group">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={currentImage}
            alt="Product preview"
              className="w-full h-full object-cover"
          />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <button
                  onClick={handleRemoveImage}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                  title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            Click to change image
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {isUploading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 mb-2">Uploading...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`Upload progress: ${uploadProgress}%`}
                ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to {maxSize}MB
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {currentImage && !isUploading && !error && (
        <div className="mt-2 flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Image uploaded successfully
        </div>
      )}
    </div>
  );
};

export default ImageUpload;