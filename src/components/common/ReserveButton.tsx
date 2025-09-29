import React, { useState } from 'react';
import { Clock, Check } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

interface ReserveButtonProps {
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  price: number;
  image: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'primary' | 'secondary';
}

const ReserveButton: React.FC<ReserveButtonProps> = ({
  productId,
  productName,
  sellerId,
  sellerName,
  price,
  image,
  size = 'md',
  className = '',
  variant = 'primary'
}) => {
  const { user } = useAuth();
  const [isReserving, setIsReserving] = useState(false);
  const [isReserved, setIsReserved] = useState(false);

  const handleReserve = async () => {
    if (!user) {
      alert('Please login to reserve products');
      return;
    }

    setIsReserving(true);
    try {
      // Add to reserved products collection
      await addDoc(collection(db, 'reservedProducts'), {
        productId,
        productName,
        sellerId,
        sellerName,
        price,
        image,
        userId: user.uid,
        userEmail: user.email,
        reservedAt: new Date(),
        status: 'reserved', // reserved, confirmed, cancelled
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update product reserved count
      await updateDoc(doc(db, 'products', productId), {
        reservedCount: increment(1),
        updatedAt: new Date()
      });

      setIsReserved(true);
      
      // Show success message
      alert('Product reserved successfully! You have 24 hours to confirm your reservation.');
      
    } catch (error) {
      console.error('Error reserving product:', error);
      alert('Failed to reserve product. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const variantClasses = {
      primary: isReserved 
        ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
        : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
      secondary: isReserved
        ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 focus:ring-green-500'
        : 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200 focus:ring-orange-500'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getButtonContent = () => {
    if (isReserving) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Reserving...
        </>
      );
    }

    if (isReserved) {
      return (
        <>
          <Check className="w-4 h-4 mr-2" />
          Reserved
        </>
      );
    }

    return (
      <>
        <Clock className="w-4 h-4 mr-2" />
        Reserve Now
      </>
    );
  };

  return (
    <button
      onClick={handleReserve}
      disabled={isReserving || isReserved}
      className={getButtonClasses()}
    >
      {getButtonContent()}
    </button>
  );
};

export default ReserveButton;
