import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const CategoriesPage: React.FC = () => {
  const categories = [
    {
      name: 'Women',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Footwear',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop'
    },
    {
      name: 'Jewellery',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop'
    },
    {
      name: 'Lingerie',
      image: 'https://images.unsplash.com/photo-1619194617062-5d61c9c860f8?w=300&h=300&fit=crop'
    },
    {
      name: 'Watches',
      image: 'https://images.unsplash.com/photo-1523170335258-f5e6a7c0c4c4?w=300&h=300&fit=crop'
    },
    {
      name: 'Gifting Guide',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop'
    },
    {
      name: 'Kids',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=300&fit=crop'
    },
    {
      name: 'Home & Lifestyle',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop'
    },
    {
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
    },
    {
      name: 'Beauty by Tira',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop'
    },
    {
      name: 'Sportswear',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar userRole="user" />
      
      {/* Header - Exact match to reference */}
      <div className="bg-white px-4 py-6 pt-20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Shop by Category</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2" title="Favorites" aria-label="View favorites">
              <Heart className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2" title="Shopping Cart" aria-label="View shopping cart">
              <ShoppingBag className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid - Exact match to reference */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/browse?category=${encodeURIComponent(category.name)}`}
              className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-black">
                    {category.name}
                  </h3>
                </div>
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
