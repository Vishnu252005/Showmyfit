import React from 'react';
import { MapPin } from 'lucide-react';

interface Product {
  id: string;
  shopId: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
}

interface ProductCardProps {
  product: Product;
  shop?: Shop;
  distance?: number;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  shop, 
  distance, 
  onClick 
}) => {
  return (
    <div 
      className="bg-white rounded-3xl border border-warm-200 overflow-hidden hover:shadow-lg hover:border-warm-300 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-warm-700 bg-warm-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {product.category}
          </span>
          <span className="text-lg font-bold text-warm-900">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <h3 className="font-semibold text-warm-900 mb-2 line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-warm-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        {shop && (
          <div className="flex items-center justify-between text-sm pt-3 border-t border-warm-100">
            <div className="flex items-center text-warm-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="font-medium truncate">{shop.name}</span>
            </div>
            {distance !== undefined && (
              <span className="text-warm-700 font-medium">
                {distance.toFixed(1)}km
              </span>
            )}
          </div>
        )}
        
        {/* View Collection Button */}
        <div className="mt-4 pt-3 border-t border-warm-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-warm-500 uppercase tracking-wider">View Collection</span>
            <button className="w-8 h-8 border border-warm-300 rounded-full flex items-center justify-center text-warm-600 hover:bg-warm-100 transition-colors">
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;