import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, Heart, ShoppingCart, Search, Package,
  MapPin, Phone, Minus, Plus, Check, ArrowLeft
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
  categorySpecificData?: {
    sizes?: string[];
    colors?: string;
  };
}

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  address: string;
  profileImage?: string;
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
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        const productsQuery = query(
          collection(db, 'products'),
          where('sellerId', '==', sellerId),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(productsQuery);
        const productsData = snapshot.docs.map(doc => {
          const data = doc.data();
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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        brand: product.brand || 'Unknown Brand',
        category: product.category,
        sellerId: product.sellerId,
        sellerName: seller?.businessName
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="pt-6">
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
        <div className="pt-6 flex items-center justify-center min-h-screen">
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
      {/* Top Back Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors" title="Go back" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="pt-2">
        {/* Big Visual Header */}
        <div className="relative">
          <div className="relative rounded-b-3xl shadow overflow-visible">
            <div className="aspect-[16/7] sm:aspect-[21/6] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            {/* Overlay content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white overflow-hidden shadow-xl bg-white">
                      {seller.profileImage ? (
                        <img src={seller.profileImage} alt={seller.businessName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-4xl font-bold">
                          {seller.businessName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{seller.businessName}</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info chips and actions below header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {seller.businessType && (
              <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-700">{seller.businessType}</span>
            )}
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-700">{products.length} products</span>
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full inline-flex items-center text-gray-700"><MapPin className="w-4 h-4 mr-1" /> {seller.address}</span>
            <span className="bg-white border border-gray-200 px-3 py-1 rounded-full inline-flex items-center text-gray-700"><Phone className="w-4 h-4 mr-1" /> {seller.phone}</span>
            {seller.phone && (
              <a href={`tel:${seller.phone}`} className="ml-auto inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
            {seller.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(seller.address)}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-black"
              >
                <MapPin className="w-4 h-4" /> Directions
              </a>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Simple Search */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur rounded-xl shadow p-4 sticky top-24 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Search</h3>
                
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search products..."
                    />
                  </div>
                </div>

                {/* Clear Search Button */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {filteredProducts.length} Products
                </h2>
                
                {/* Cart Summary */}
                {getCartItemCount() > 0 && (
                  <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    <span className="font-medium">{getCartItemCount()} items</span>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                      <div className="p-4">
                        <div className="relative mb-3 group">
                          <Link to={`/product/${product.id}`}>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-48 object-cover rounded-xl group-hover:scale-[1.02] transition-transform"
                            />
                          </Link>
                          
                          {/* Wishlist Button */}
                          <button
                            onClick={() => toggleWishlist(product)}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart className={`w-4 h-4 ${
                              isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'
                            }`} />
                          </button>

                          {/* Discount Badge */}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Link to={`/product/${product.id}`} className="block">
                            <div className="text-base font-bold text-gray-900 uppercase tracking-wide line-clamp-1">
                              {product.brand}
                            </div>
                            <div className="text-sm text-gray-700 line-clamp-2">
                              {product.name}
                            </div>
                          </Link>
                          
                          {/* Rating */}
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{(product.rating || 0).toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({product.reviews})</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline space-x-2">
                            <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Size Selection */}
                          {product.categorySpecificData?.sizes && (
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Size <span className="text-red-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-1">
                                {product.categorySpecificData.sizes.map((size: string) => (
                                  <button
                                    key={size}
                                    onClick={() => updateSelectedOption(product.id, 'size', size)}
                                    className={`px-2 py-1 text-xs rounded border ${
                                      getSelectedOption(product.id, 'size') === size
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                                {/* Show custom sizes if available */}
                                {product.categorySpecificData.sizeOther && (
                                  <>
                                    {product.categorySpecificData.sizeOther.split(',').map((customSize: string) => (
                                      <button
                                        key={customSize.trim()}
                                        onClick={() => updateSelectedOption(product.id, 'size', customSize.trim())}
                                        className={`px-2 py-1 text-xs rounded border ${
                                          getSelectedOption(product.id, 'size') === customSize.trim()
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                      >
                                        {customSize.trim()}
                                      </button>
                                    ))}
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Color Selection */}
                          {product.categorySpecificData?.colors && (
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Color <span className="text-red-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-1">
                                {product.categorySpecificData.colors.split(',').map((color: string) => (
                                  <button
                                    key={color.trim()}
                                    onClick={() => updateSelectedOption(product.id, 'color', color.trim())}
                                    className={`px-2 py-1 text-xs rounded border ${
                                      getSelectedOption(product.id, 'color') === color.trim()
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {color.trim()}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Stock Status */}
                          <div className="text-xs">
                            <span className={`px-2 py-1 rounded-md ${
                              product.stock > 10 ? 'bg-green-100 text-green-700' :
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                            </span>
                          </div>

                          {/* Cart Actions */}
                          {getProductQuantity(product.id) > 0 ? (
                            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                              <button
                                onClick={() => handleUpdateQuantity(product.id, getProductQuantity(product.id) - 1)}
                                className="p-1 text-gray-600 hover:text-red-600"
                                aria-label="Decrease quantity"
                                title="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-medium">{getProductQuantity(product.id)}</span>
                              <button
                                onClick={() => handleUpdateQuantity(product.id, getProductQuantity(product.id) + 1)}
                                className="p-1 text-gray-600 hover:text-green-600 disabled:opacity-50"
                                disabled={getProductQuantity(product.id) >= product.stock - 1}
                                aria-label="Increase quantity"
                                title="Increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 1 || (product.categorySpecificData?.sizes && !getSelectedOption(product.id, 'size')) || (product.categorySpecificData?.colors && !getSelectedOption(product.id, 'color'))}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductsPage;
