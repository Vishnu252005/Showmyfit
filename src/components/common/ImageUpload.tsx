import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Product Image",
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // For MVP, we'll use placeholder images
    const placeholderImages = [
      'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
      'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg',
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    onChange(randomImage);
  };

  const handleFileInput = () => {
    // For MVP, simulate file upload with placeholder
    const placeholderImages = [
      'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
      'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg',
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    onChange(randomImage);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Product preview"
            className="w-full h-48 object-cover rounded-xl border border-gray-300"
          />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleFileInput}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;