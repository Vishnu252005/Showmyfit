import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Heart, ShoppingCart, Filter, Search, 
  Grid, List, SlidersHorizontal, ChevronDown, Package,
  MapPin, Phone, Mail, Clock, Truck, Shield, Award,
  Eye, Share2, Minus, Plus, Check, X, Zap, TrendingUp,
  Users, ShoppingBag, ThumbsUp, MessageCircle, ExternalLink
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useCart } from '../../contexts/CartContext';
import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
  createdAt: Date;
}

const SellerProductsPage: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity, removeFromCart, getCartItemCount } = useCart();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{[productId: string]: {size?: string, color?: string}}>({});

  // Fetch seller data
  useEffect(() => {
    const fetchSeller = async () => {
      if (!sellerId) return;
      
      try {
        const sellerDoc = await getDoc(doc(db, 'users', sellerId));
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          setSeller({
            id: sellerDoc.id,
            ...sellerData,
            stats: {
              totalProducts: 0,
              totalOrders: 0,
              totalSales: 0,
              rating: 0,
              ...sellerData.stats
            },
            createdAt: sellerData.createdAt?.toDate() || new Date()
          } as Seller);
        }
      } catch (error) {
        console.error('Error fetching seller:', error);
      }
    };

    fetchSeller();
  }, [sellerId]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!sellerId) return;
      
      setLoading(true);
      try {
        console.log('Fetching products for sellerId:', sellerId);
        // First try to get all products for this seller (without status filter)
        const allProductsQuery = query(
          collection(db, 'products'),
          where('sellerId', '==', sellerId)
        );
        const allSnapshot = await getDocs(allProductsQuery);
        console.log('All products for seller:', allSnapshot.docs.length);
        allSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('All product:', { id: doc.id, sellerId: data.sellerId, name: data.name, status: data.status });
        });
        
        // Then filter for active products
        const productsQuery = query(
          collection(db, 'products'),
          where('sellerId', '==', sellerId),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(productsQuery);
        console.log('Products found:', snapshot.docs.length);
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Product data:', { id: doc.id, sellerId: data.sellerId, name: data.name, status: data.status });
          return {
          id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
        }) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sellerId]);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return b.reviews - a.reviews; // popularity
      }
    });

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product) => {
    const options = selectedOptions[product.id] || {};
    
    // Check if size selection is required
    if (product.categorySpecificData?.sizes && !options.size) {
      alert('Please select a size before adding to cart');
      return;
    }
    
    // Check if color selection is required
    if (product.categorySpecificData?.colors && !options.color) {
      alert('Please select a color before adding to cart');
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      brand: product.brand,
      quantity: 1,
      sellerId: seller?.id,
      sellerName: seller?.businessName,
      category: product.category,
      size: options.size,
      color: options.color
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      } else {
      updateQuantity(productId, quantity);
    }
  };

  const getProductQuantity = (productId: string) => {
    const cartItem = cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const updateSelectedOption = (productId: string, option: 'size' | 'color', value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [option]: value
      }
    }));
  };

  const getSelectedOption = (productId: string, option: 'size' | 'color') => {
    return selectedOptions[productId]?.[option] || '';
  };

  const toggleCompare = (productId: string) => {
    setCompareList(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : prev.length < 3 ? [...prev, productId] : prev
    );
  };

  const quickViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const shareProduct = (product: Product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} from ${seller?.businessName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar userRole="user" />
        <div className="pt-24">
          {/* Skeleton Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Skeleton Sidebar */}
              <div className="lg:w-64">
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              
              {/* Skeleton Products */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole="user" />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller not found</h2>
            <p className="text-gray-600 mb-4">The seller you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/browse')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Explore
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar userRole="user" />
      
      <div className="pt-24">
        {/* Enhanced Header */}
        <div className="bg-white shadow-lg border-b relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="py-8">

              {/* Enhanced Seller Info */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {seller.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{seller.businessName}</h1>
                    <p className="text-gray-600 mb-3">Owner: {seller.name}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                        <Package className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="font-medium">{products.length} products</span>
                      </div>
                      <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                        <MapPin className="w-4 h-4 text-green-500 mr-1" />
                        <span className="font-medium">{seller.address}</span>
                      </div>
                      <div className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
                        <Phone className="w-4 h-4 text-purple-500 mr-1" />
                        <span className="font-medium">{seller.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Enhanced Sidebar Filters */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Filters & Sort</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                    title="Toggle filters"
                    aria-label="Toggle filters"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Enhanced Search */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Search Products</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Search products..."
                    />
                  </div>
                </div>

                {/* Enhanced Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Filter by category"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Enhanced Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Price Range</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Sort products by"
                  >
                    <option value="popularity">🔥 Popularity</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                    <option value="rating">⭐ Rating</option>
                    <option value="newest">🆕 Newest First</option>
                  </select>
                </div>

                {/* Compare Section */}
                {compareList.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Compare Products ({compareList.length}/3)</h4>
                    <div className="space-y-2">
                      {compareList.map(productId => {
                        const product = products.find(p => p.id === productId);
                        return product ? (
                          <div key={productId} className="flex items-center justify-between bg-white p-2 rounded-lg">
                            <span className="text-sm font-medium truncate">{product.name}</span>
                            <button
                              onClick={() => toggleCompare(productId)}
                              className="text-red-500 hover:text-red-700"
                              title="Remove from compare"
                              aria-label="Remove from compare"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                    {compareList.length >= 2 && (
                      <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Compare Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="flex-1">
              {/* Enhanced Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {filteredProducts.length} Products Found
                  </h2>
                  <p className="text-gray-600">Showing results for <span className="font-semibold text-blue-600">{seller.businessName}</span></p>
                </div>
                
                {/* Enhanced View Toggle */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Grid view"
                      aria-label="Switch to grid view"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      title="List view"
                      aria-label="Switch to list view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Cart Summary */}
                  {getCartItemCount() > 0 && (
                    <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      <span className="font-medium">{getCartItemCount()} items</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setPriceRange({ min: 0, max: 100000 });
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
                      {viewMode === 'grid' ? (
                        // Enhanced Grid View
                        <div className="p-5">
                          <div className="relative mb-4 group/image">
                            <Link to={`/product/${product.id}`}>
                            <img
                              src={product.image}
                              alt={product.name}
                                className="w-full h-56 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                            />
                            </Link>
                            
                            {/* Action Buttons */}
                            <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => toggleWishlist(product.id)}
                                className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                                title={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                              >
                                <Heart className={`w-4 h-4 ${
                                  wishlist.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'
                                }`} />
                              </button>
                              <button
                                onClick={() => quickViewProduct(product)}
                                className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                                title="Quick view"
                                aria-label="Quick view product"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => shareProduct(product)}
                                className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                                title="Share product"
                                aria-label="Share product"
                              >
                                <Share2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col space-y-2">
                              {product.featured && (
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                  ⭐ Featured
                                </span>
                              )}
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </span>
                              )}
                            </div>

                            {/* Compare Button */}
                            <button
                              onClick={() => toggleCompare(product.id)}
                              className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                                compareList.includes(product.id) 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white text-gray-600 hover:bg-blue-50'
                              }`}
                              title="Add to compare"
                              aria-label="Add to compare"
                            >
                              {compareList.includes(product.id) ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <TrendingUp className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <div className="space-y-3">
                            <Link to={`/product/${product.id}`} className="block">
                            <div>
                              <h3 className="font-bold text-gray-900 line-clamp-2 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
                            </div>
                            </Link>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-bold ml-1">{product.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                {product.category}
                              </span>
                            </div>

                            {/* Size Selection */}
                            {product.categorySpecificData?.sizes && (
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Size <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-1">
                                  {product.categorySpecificData.sizes.map((size: string) => (
                                    <button
                                      key={size}
                                      onClick={() => updateSelectedOption(product.id, 'size', size)}
                                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                                        getSelectedOption(product.id, 'size') === size
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Color Selection */}
                            {product.categorySpecificData?.colors && (
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Color <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-1">
                                  {product.categorySpecificData.colors.split(',').map((color: string) => (
                                    <button
                                      key={color.trim()}
                                      onClick={() => updateSelectedOption(product.id, 'color', color.trim())}
                                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                                        getSelectedOption(product.id, 'color') === color.trim()
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      {color.trim()}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Stock Status */}
                            <div className="flex items-center justify-between text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock > 10 ? 'bg-green-100 text-green-800' :
                                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                              </span>
                              <span className="text-gray-500">{product.stock} left</span>
                            </div>

                            {/* Cart Actions */}
                            <div className="space-y-2">
                              {getProductQuantity(product.id) > 0 ? (
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                  <button
                                    onClick={() => handleUpdateQuantity(product.id, getProductQuantity(product.id) - 1)}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Decrease quantity"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="font-semibold">{getProductQuantity(product.id)}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(product.id, getProductQuantity(product.id) + 1)}
                                    className="p-1 text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Increase quantity"
                                    aria-label="Increase quantity"
                                    disabled={getProductQuantity(product.id) >= product.stock - 1}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  disabled={product.stock <= 1 || (product.categorySpecificData?.sizes && !getSelectedOption(product.id, 'size')) || (product.categorySpecificData?.colors && !getSelectedOption(product.id, 'color'))}
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ShoppingCart className="w-5 h-5 mr-2" />
                                  {product.stock <= 1 
                                    ? 'Out of Stock' 
                                    : (product.categorySpecificData?.sizes && !getSelectedOption(product.id, 'size')) || (product.categorySpecificData?.colors && !getSelectedOption(product.id, 'color'))
                                      ? 'Select Options'
                                      : 'Reserve'
                                  }
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // List View
                        <div className="p-6">
                          <div className="flex space-x-4">
                            <div className="relative">
                              <Link to={`/product/${product.id}`}>
                              <img
                                src={product.image}
                                alt={product.name}
                                  className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                              />
                              </Link>
                              <button
                                onClick={() => toggleWishlist(product.id)}
                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm"
                                title={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                              >
                                <Heart className={`w-4 h-4 ${
                                  wishlist.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                                }`} />
                              </button>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <Link to={`/product/${product.id}`}>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">{product.name}</h3>
                                  <p className="text-gray-600 mb-2">{product.brand}</p>
                                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                                  </Link>
                                  
                                  <div className="flex items-center space-x-4 mb-3">
                                    <div className="flex items-center">
                                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                      <span className="text-sm font-medium ml-1">{product.rating.toFixed(1)}</span>
                                      <span className="text-sm text-gray-500 ml-1">({product.reviews} reviews)</span>
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {product.category}
                                    </span>
                                    <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                                  </div>

                                  {/* Size Selection */}
                                  {product.categorySpecificData?.sizes && (
                                    <div className="mb-3">
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        Size <span className="text-red-500">*</span>
                                      </label>
                                      <div className="flex flex-wrap gap-1">
                                        {product.categorySpecificData.sizes.map((size: string) => (
                                          <button
                                            key={size}
                                            onClick={() => updateSelectedOption(product.id, 'size', size)}
                                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                                              getSelectedOption(product.id, 'size') === size
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                          >
                                            {size}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Color Selection */}
                                  {product.categorySpecificData?.colors && (
                                    <div className="mb-3">
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        Color <span className="text-red-500">*</span>
                                      </label>
                                      <div className="flex flex-wrap gap-1">
                                        {product.categorySpecificData.colors.split(',').map((color: string) => (
                                          <button
                                            key={color.trim()}
                                            onClick={() => updateSelectedOption(product.id, 'color', color.trim())}
                                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                                              getSelectedOption(product.id, 'color') === color.trim()
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                          >
                                            {color.trim()}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="text-right ml-4">
                                  <div className="mb-2">
                                    <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                      <div className="text-sm text-gray-500 line-through">
                                        ₹{product.originalPrice.toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock <= 1 || (product.categorySpecificData?.sizes && !getSelectedOption(product.id, 'size')) || (product.categorySpecificData?.colors && !getSelectedOption(product.id, 'color'))}
                                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    {product.stock <= 1 
                                      ? 'Out of Stock' 
                                      : (product.categorySpecificData?.sizes && !getSelectedOption(product.id, 'size')) || (product.categorySpecificData?.colors && !getSelectedOption(product.id, 'color'))
                                        ? 'Select Options'
                                        : 'Reserve'
                                    }
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick View Modal */}
        {showQuickView && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Quick View</h3>
                <button
                  onClick={() => {
                    setShowQuickView(false);
                    setSelectedProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close quick view"
                  aria-label="Close quick view"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
                    <p className="text-gray-600 mb-4">{selectedProduct.brand}</p>
                    <p className="text-gray-700">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-full">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-bold ml-2">{selectedProduct.rating.toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">({selectedProduct.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gray-900">₹{selectedProduct.price.toLocaleString()}</div>
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <div className="text-lg text-gray-500 line-through">
                        ₹{selectedProduct.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedProduct.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProduct.stock > 10 ? 'bg-green-100 text-green-800' :
                        selectedProduct.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.stock} available
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => selectedProduct && handleAddToCart(selectedProduct)}
                      disabled={selectedProduct && selectedProduct.stock <= 1}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {selectedProduct && selectedProduct.stock <= 1 ? 'Out of Stock' : 'Reserve'}
                    </button>
                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:text-red-500 transition-colors"
                      title={wishlist.includes(selectedProduct.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      aria-label={wishlist.includes(selectedProduct.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${
                        wishlist.includes(selectedProduct.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProductsPage;
