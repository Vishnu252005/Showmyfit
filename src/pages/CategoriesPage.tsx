import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Star, MapPin, Store, 
  ArrowLeft, Filter, Grid, List, Search,
  ExternalLink, Package
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ReserveButton from '../components/common/ReserveButton';
import OptimizedImage from '../components/common/OptimizedImage';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../contexts/CartContext';
import { useSEO, SEOConfigs } from '../hooks/useSEO';
import circleFashionImage from '../assets/images/banner/men/circle_fashion.jpg';
import kidsImage from '../assets/images/kids.jpg';
import shoeImage from '../assets/images/shoe.jpg';
import accessoriesImage from '../assets/images/accessories .jpg';
import sportsImage from '../assets/images/sports.jpg';
import electronicsImage from '../assets/images/electronic .jpg';

interface Product {
  id: string;
  name: string;
  description?: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, getCartItemCount, updateQuantity } = useCart();
  const [availableCategories, setAvailableCategories] = useState<Array<{ name: string; originalName?: string; image: string }>>([]);

  // Category images mapping
  const categoryImageMap: Record<string, string> = {
    'men': circleFashionImage,
    'women': circleFashionImage,
    'fashion': circleFashionImage,
    'kids': kidsImage,
    'watches': accessoriesImage,
    'accessories': accessoriesImage,
    'jewellery': accessoriesImage,
    'sportswear': sportsImage,
    'sports': sportsImage,
    'footwear': shoeImage,
    'beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
    'lingerie': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop',
    'home-lifestyle': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop',
    'gifting-guide': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=300&h=300&fit=crop',
    'electronics': electronicsImage
  };

  // Category name formatting
  const formatCategoryName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'women': 'Women',
      'men': 'Men',
      'kids': 'Kids',
      'watches': 'Watches',
      'accessories': 'Accessories',
      'jewellery': 'Jewellery',
      'sportswear': 'Sports',
      'footwear': 'Footwear',
      'beauty': 'Beauty',
      'lingerie': 'Lingerie',
      'home-lifestyle': 'Home & Lifestyle',
      'gifting-guide': 'Gifting Guide'
    };
    return categoryNames[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1);
  };

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
            rating: 0
          }
        })) as Seller[];

        setProducts(productsData);
        setSellers(sellersData);

        // Extract unique categories from products
        const uniqueCategories = Array.from(
          new Set(productsData.map(product => product.category?.toLowerCase()).filter(Boolean))
        );

        // Map categories with images and formatted names
        const categoriesWithData = uniqueCategories.map(category => ({
          name: formatCategoryName(category),
          originalName: category, // Keep original for filtering
          image: categoryImageMap[category] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop'
        }));

        // Sort categories: Men, Women, Kids first, then alphabetically
        categoriesWithData.sort((a, b) => {
          const priority: Record<string, number> = { 'Men': 1, 'Women': 2, 'Kids': 3 };
          const aPriority = priority[a.name] || 99;
          const bPriority = priority[b.name] || 99;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return a.name.localeCompare(b.name);
        });

        setAvailableCategories(categoriesWithData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products by category and search term
  const filteredProducts = selectedCategory 
    ? products.filter(product => {
        // Match exact category (case-insensitive) or check if category contains the selected category
        const productCategory = product.category?.toLowerCase() || '';
        const selectedCat = selectedCategory.toLowerCase();
        const matchesCategory = productCategory === selectedCat || 
                                productCategory.includes(selectedCat) ||
                                selectedCat.includes(productCategory);
        const matchesSearch = searchTerm === '' || 
                             product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                             (product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        return matchesCategory && matchesSearch;
      })
    : products.filter(product => {
        // When no category selected, filter by search term only
        if (searchTerm === '') return true;
        return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
               (product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
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
              to="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedCategory}</h1>
              <p className="text-gray-600">{filteredProducts.length} products found</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search products..."
            />
          </div>
        </div>

        {/* Products */}
        <div className="px-4 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">No products available in this category yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2">
              {filteredProducts.map((product) => {
                const seller = getSellerInfo(product.sellerId);
                
                return (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="relative h-40">
                      <OptimizedImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full"
                        loading="lazy"
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

                    <div className="p-3">
                      {/* Seller Info */}
                      {seller && (
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {seller.businessName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <Link
                            to={`/seller/${seller.id}`}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                          >
                            {seller.businessName}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      )}

                      {/* Product Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{product.brand}</p>

                        {/* Price */}
                        <div className="mb-2">
                          <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through ml-2">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="text-xs mb-2">
                          <span className={`px-2 py-1 rounded-md ${
                            (product.stock || 0) > 10 ? 'bg-green-100 text-green-700' :
                            (product.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {(product.stock || 0) > 10 ? 'In Stock' : (product.stock || 0) > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                          </span>
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
                          className="w-full text-xs"
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {availableCategories.map((category) => (
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
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x300';
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
