import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Star, MapPin, Store, 
  ArrowLeft, Filter, Grid, List, Search,
  ExternalLink, Package
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ReserveButton from '../components/common/ReserveButton';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../contexts/CartContext';
import { useSEO, SEOConfigs } from '../hooks/useSEO';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  image: string;
  images?: string[];
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  sellerId: string;
  sellerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  address: string;
  stats: {
    totalProducts: number;
    totalSales: number;
    totalOrders: number;
    rating: number;
  };
}

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  
  // SEO Configuration
  useSEO(SEOConfigs.categories);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'newest'>('newest');
  const { addToCart, getCartItemCount, updateQuantity } = useCart();
  const categories = [
    { name: 'Women', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop&crop=face' },
    { name: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop' },
    { name: 'Jewellery', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop' },
    { name: 'Lingerie', image: 'https://images.unsplash.com/photo-1619194617062-5d61c9c860f8?w=300&h=300&fit=crop' },
    { name: 'Watches', image: 'https://images.unsplash.com/photo-1523170335258-f5e6a7c0c4c4?w=300&h=300&fit=crop' },
    { name: 'Gifting Guide', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop' },
    { name: 'Kids', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=300&fit=crop' },
    { name: 'Home & Lifestyle', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
    { name: 'Beauty by Tira', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop' },
    { name: 'Sportswear', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop' }
  ];

  // Fetch products and sellers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all products
        const productsQuery = query(
          collection(db, 'products'),
          where('status', '==', 'active')
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Product[];

        // Fetch all sellers
        const sellersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'shop')
        );
        const sellersSnapshot = await getDocs(sellersQuery);
        const sellersData = sellersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          stats: doc.data().stats || {
            totalProducts: 0,
            totalSales: 0,
            totalOrders: 0,
            rating: 4.5
          }
        })) as Seller[];

        setProducts(productsData);
        setSellers(sellersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products by category if selected
  const filteredProducts = selectedCategory 
    ? products.filter(product => 
        product.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        product.name.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    : products;

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Get seller info for a product
  const getSellerInfo = (sellerId: string) => {
    return sellers.find(seller => seller.id === sellerId);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      sellerId: product.sellerId,
      sellerName: product.sellerName || 'Unknown Seller'
    });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (selectedCategory) {
    // Show products for selected category
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole="user" />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 pt-32">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/categories"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedCategory}</h1>
              <p className="text-gray-600">{sortedProducts.length} products found</p>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sort products by"
              >
                <option value="newest">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                aria-label="Grid view"
                title="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                aria-label="List view"
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="px-4 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading products...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">No products available in this category yet.</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {sortedProducts.map((product) => {
                const seller = getSellerInfo(product.sellerId);
                
                return (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 cursor-pointer ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          viewMode === 'list' ? 'h-48' : 'h-48'
                        }`}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col space-y-1">
                        {product.featured && (
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            ⭐ Featured
                          </span>
                        )}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      {/* Seller Info */}
                      {seller && (
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {seller.businessName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <Link
                            to={`/seller/${seller.id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                          >
                            {seller.businessName}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{seller.stats.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}

                      {/* Product Info */}
                      <div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-sm md:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">{product.brand}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-1 md:space-x-2 mb-3">
                          <div className="flex items-center bg-yellow-50 px-1.5 py-1 md:px-2 md:py-1 rounded-full">
                            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                            <span className="text-xs md:text-sm font-bold ml-1">{product.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span className="text-xs md:text-sm text-gray-500">({product.reviews || 0})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg md:text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <div className="text-xs md:text-sm text-gray-500 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </div>
                            )}
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 md:px-3 md:py-1 rounded-full font-medium">
                            {product.category}
                          </span>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center justify-between text-xs md:text-sm mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (product.stock || 0) > 10 ? 'bg-green-100 text-green-800' :
                            (product.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {(product.stock || 0) > 10 ? 'In Stock' : (product.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                          <span className="text-gray-500 text-xs">{product.stock || 0} left</span>
                        </div>

                        {/* Reserve Button */}
                        <ReserveButton
                          product={{
                            id: product.id,
                            name: product.name,
                            price: product.price || 0,
                            originalPrice: product.originalPrice,
                            image: product.image,
                            brand: product.brand,
                            sellerId: product.sellerId,
                            sellerName: seller?.businessName || 'Unknown Seller',
                            category: product.category
                          }}
                          size="sm"
                          className="w-full text-xs md:text-sm"
                          variant="primary"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show categories grid
  return (
    <div className="min-h-screen bg-white">
      <Navbar userRole="user" />
      
      {/* Header */}
      <div className="bg-white px-4 py-6 pt-32">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Shop by Category</h1>
          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="p-2" title="Favorites" aria-label="View favorites">
              <Heart className="w-6 h-6 text-gray-600" />
            </Link>
            <Link to="/cart" className="p-2" title="Shopping Cart" aria-label="View shopping cart">
              <ShoppingBag className="w-6 h-6 text-gray-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/categories?category=${encodeURIComponent(category.name)}`}
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
