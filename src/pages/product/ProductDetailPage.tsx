import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Heart, ShoppingCart, Minus, Plus, 
  MapPin, Phone, Mail, Clock, Truck, Shield, Award,
  Eye, Share2, Check, X, Zap, TrendingUp, Users,
  ShoppingBag, ThumbsUp, MessageCircle, ExternalLink,
  ChevronLeft, ChevronRight, Package, Tag
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
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
  categorySpecificData?: Record<string, any>;
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
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  stats: {
    totalProducts: number;
    totalSales: number;
    totalOrders: number;
    rating: number;
  };
  createdAt: Date;
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity, removeFromCart, getCartItemCount } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    userName: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      setLoadingReviews(true);
      try {
        console.log('Fetching reviews for product:', productId);
        // Fetch real reviews from database
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('productId', '==', productId)
        );
        console.log('Reviews query created, executing...');
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate() || new Date()
        })) as any[];
        
        console.log('Reviews fetched:', reviewsData.length, 'reviews');
        setReviews(reviewsData);
        
        // Calculate average rating and total reviews
        if (reviewsData.length > 0) {
          const avgRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length;
          setAverageRating(avgRating);
          setTotalReviews(reviewsData.length);
          console.log('Average rating calculated:', avgRating);
        } else {
          setAverageRating(0);
          setTotalReviews(0);
          console.log('No reviews found, setting default values');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // Submit review function
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !reviewForm.comment.trim()) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: productId,
        userId: currentUser?.uid || 'anonymous',
        userName: reviewForm.userName || 'Anonymous',
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        reviewText: reviewForm.comment.trim(),
        verified: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Refresh reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate() || new Date()
      })) as any[];
      
      setReviews(reviewsData);
      
      // Recalculate average rating
      if (reviewsData.length > 0) {
        const avgRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length;
        setAverageRating(avgRating);
        setTotalReviews(reviewsData.length);
      }

      // Reset form and close modal
      setReviewForm({ rating: 5, comment: '', userName: '' });
      setShowReviewForm(false);
      
      console.log('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        console.log('Fetching product:', productId);
        const productDoc = await getDoc(doc(db, 'products', productId));
        
        if (productDoc.exists()) {
          const productData = productDoc.data();
          console.log('Product data:', productData);
          
          const productInfo = {
            id: productDoc.id,
            ...productData,
            createdAt: productData.createdAt?.toDate() || new Date(),
            updatedAt: productData.updatedAt?.toDate() || new Date()
          } as Product;
          
          setProduct(productInfo);
          
          // Fetch seller data
          if (productInfo.sellerId) {
            const sellerDoc = await getDoc(doc(db, 'users', productInfo.sellerId));
            if (sellerDoc.exists()) {
              const sellerData = sellerDoc.data();
              setSeller({
                id: sellerDoc.id,
                name: sellerData.displayName || sellerData.name || 'Unknown',
                email: sellerData.email || '',
                phone: sellerData.phone || '',
                businessName: sellerData.businessName || '',
                businessType: sellerData.businessType || '',
                address: sellerData.address || '',
                location: sellerData.location || null,
                stats: {
                  totalProducts: sellerData.stats?.totalProducts || 0,
                  totalSales: sellerData.stats?.totalSales || 0,
                  totalOrders: sellerData.stats?.totalOrders || 0,
                  rating: sellerData.stats?.rating || 0
                },
                createdAt: sellerData.createdAt?.toDate() || new Date()
              });
            }
          }
        } else {
          console.log('Product not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if size selection is required
    if (product.categorySpecificData?.sizes && !selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }
    
    // Check if color selection is required
    if (product.categorySpecificData?.colors && !selectedColor) {
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
      quantity: quantity,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      category: product.category,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    });
  };

  const getProductQuantity = () => {
    const cartItem = cartItems.find(item => item.id === product?.id);
    return cartItem ? cartItem.quantity : 0;
  };

  const toggleWishlist = async () => {
    if (!product) return;
    
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

  const nextImage = () => {
    if (!product?.images) return;
    setSelectedImageIndex((prev) => 
      prev === product.images!.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!product?.images) return;
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images!.length - 1 : prev - 1
    );
  };

  const getCategorySpecificFields = () => {
    if (!product?.categorySpecificData) return [];
    
    return Object.entries(product.categorySpecificData).map(([key, value]) => ({
      key,
      value,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  };

  const getDiscountPercentage = () => {
    if (!product?.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole="user" />
        <div className="main-content pt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-96 bg-gray-300 rounded-lg"></div>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 w-20 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole="user" />
        <div className="main-content pt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
              <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const discountPercentage = getDiscountPercentage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="user" />
      
      <div className="main-content pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to="/browse" className="hover:text-blue-600">Browse</Link>
            <span>/</span>
            <Link to={`/seller/${product.sellerId}`} className="hover:text-blue-600">
              {seller?.businessName || 'Store'}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative group">
                <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={allImages[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Navigation */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Previous image"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Next image"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{discountPercentage}%
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'
                    }`} 
                  />
                </button>
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index 
                          ? 'border-blue-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-600">{product.brand}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.floor(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {(averageRating || 0).toFixed(1)} ({totalReviews || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <p className="text-green-600 font-medium">
                    You save ₹{(product.originalPrice! - product.price).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Category Specific Fields */}
              {product.categorySpecificData && Object.keys(product.categorySpecificData).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    {getCategorySpecificFields().map(({ key, value, label }) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-sm font-medium text-gray-600">{label}</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Size Selection */}
              {product.categorySpecificData?.sizes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Size <span className="text-red-500">*</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.categorySpecificData.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          selectedSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Size Guide
                  </button>
                </div>
              )}

              {/* Color Selection */}
              {product.categorySpecificData?.colors && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Color <span className="text-red-500">*</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.categorySpecificData.colors.split(',').map((color: string) => (
                      <button
                        key={color.trim()}
                        onClick={() => setSelectedColor(color.trim())}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          selectedColor === color.trim()
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

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    title="Decrease quantity"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock - 1, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Increase quantity"
                    aria-label="Increase quantity"
                    disabled={quantity >= product.stock - 1}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {product.stock} available (max {product.stock - 1} can be added to cart)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {getProductQuantity() > 0 ? (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpdateQuantity(product.id, getProductQuantity() - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold">{getProductQuantity()}</span>
                      <button
                        onClick={() => handleUpdateQuantity(product.id, getProductQuantity() + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Increase quantity"
                        aria-label="Increase quantity"
                        disabled={getProductQuantity() >= product.stock - 1}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">In Cart</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 1 || (product.categorySpecificData?.sizes && !selectedSize) || (product.categorySpecificData?.colors && !selectedColor)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock <= 1 
                      ? 'Out of Stock' 
                      : (product.categorySpecificData?.sizes && !selectedSize) || (product.categorySpecificData?.colors && !selectedColor)
                        ? 'Please Select Options'
                        : 'Reserve'
                    }
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <Link
                    to={`/seller/${product.sellerId}`}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Store
                  </Link>
                </div>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seller Information */}
          {seller && (
            <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Seller</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {seller.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{seller.businessName}</h3>
                      <p className="text-sm text-gray-600">{seller.businessType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{(seller.stats?.rating || 0).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({seller.stats.totalOrders} orders)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{seller.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{seller.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{seller.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{seller.stats.totalProducts}</div>
                    <div className="text-xs text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{seller.stats.totalOrders}</div>
                    <div className="text-xs text-gray-600">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">₹{seller.stats.totalSales.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Sales</div>
                  </div>
                </div>
              </div>

              {/* Seller Location Map */}
              {seller.location?.lat && seller.location?.lng && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Store Location</h3>
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 cursor-pointer group">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${seller.location.lat},${seller.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {/* Static Map Preview */}
                      <div className="relative h-64 bg-gray-100">
                        <img
                          src={`https://maps.googleapis.com/maps/api/staticmap?center=${seller.location.lat},${seller.location.lng}&zoom=15&size=600x300&markers=color:red%7C${seller.location.lat},${seller.location.lng}&key=AIzaSyBl8RFDcvM3_D5Y43v7xZmY-8_4Kv_qYmM`}
                          alt="Store Location"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to a different static map service or placeholder
                            e.currentTarget.src = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l-shop+ff0000(${seller.location.lng},${seller.location.lat})/${seller.location.lng},${seller.location.lat},14,0/600x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
                          }}
                        />
                        
                        {/* Overlay with Instructions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                            <div className="bg-white rounded-full px-6 py-3 shadow-2xl flex items-center space-x-2">
                              <MapPin className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-gray-900">Open in Google Maps</span>
                              <ExternalLink className="w-4 h-4 text-gray-600" />
                            </div>
                          </div>
                        </div>

                        {/* Location Pin Indicator */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none">
                          <MapPin className="w-10 h-10 text-red-600 drop-shadow-lg animate-bounce" />
                        </div>
                      </div>

                      {/* Location Details */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {seller.location.address || seller.address}
                            </p>
                            <p className="text-xs text-gray-600">
                              Tap to get directions in Google Maps
                            </p>
                          </div>
                          <div className="ml-3 bg-blue-600 rounded-full p-2 group-hover:bg-blue-700 transition-colors">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Section - Moved to Bottom */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              <button 
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            </div>
            
            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{(averageRating || 0).toFixed(1)}</div>
                  <div className="flex items-center justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.floor(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{totalReviews} reviews</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-2">{star}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {Math.floor(Math.random() * 50)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {loadingReviews ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {(review.userName || review.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{review.userName || review.name || 'Anonymous'}</h4>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (review.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date ? new Date(review.date).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment || review.reviewText || 'No comment provided'}</p>
                </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>

            {/* Load More Reviews */}
            <div className="text-center mt-8">
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Load More Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={reviewForm.userName}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, userName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              {/* Rating Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Comment Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewForm.comment.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
