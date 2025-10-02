import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, Edit, LogOut, Star, 
  Calendar, Package, Plus,
  TrendingUp, DollarSign, Tag, XCircle, Save, X, Clock, BarChart3
} from 'lucide-react';
import GoogleMapLocation from '../../components/common/GoogleMapLocation';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/common/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ReservedProducts from '../../components/seller/ReservedProducts';

interface Product {
  id?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

interface SellerProfilePageProps {
  currentUser: any;
  userData: any;
}

const SellerProfilePage: React.FC<SellerProfilePageProps> = ({ currentUser, userData }) => {
  const { signOut, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userData?.displayName || currentUser?.displayName || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    businessName: userData?.businessName || '',
    businessType: userData?.businessType || '',
    businessDescription: userData?.businessDescription || '',
    location: userData?.location || null,
    profilePicture: userData?.profilePicture || ''
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showProfilePicUpload, setShowProfilePicUpload] = useState(false);
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    brand: '',
    image: '',
    images: [],
    stock: 0,
    rating: 0,
    reviews: 0,
    tags: [],
    featured: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const categories = [
    { value: 'women', label: 'Women', icon: '👗' },
    { value: 'footwear', label: 'Footwear', icon: '👟' },
    { value: 'jewellery', label: 'Jewellery', icon: '💍' },
    { value: 'lingerie', label: 'Lingerie', icon: '👙' },
    { value: 'watches', label: 'Watches', icon: '⌚' },
    { value: 'gifting-guide', label: 'Gifting Guide', icon: '🎁' },
    { value: 'kids', label: 'Kids', icon: '👶' },
    { value: 'home-lifestyle', label: 'Home & Lifestyle', icon: '🏠' },
    { value: 'accessories', label: 'Accessories', icon: '👜' },
    { value: 'beauty', label: 'Beauty by Tira', icon: '💄' },
    { value: 'sportswear', label: 'Sportswear', icon: '⚽' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', icon: '✅', color: 'text-green-600' },
    { value: 'inactive', label: 'Inactive', icon: '❌', color: 'text-red-600' },
    { value: 'draft', label: 'Draft', icon: '📝', color: 'text-yellow-600' }
  ];

  // Dynamic form fields based on category
  const getCategorySpecificFields = (category: string) => {
    switch (category) {
      case 'women':
        return {
          sizes: { type: 'multi-select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], label: 'Available Sizes' },
          colors: { type: 'multi-text', label: 'Available Colors', placeholder: 'Enter colors separated by commas' },
          material: { type: 'text', label: 'Material' },
          occasion: { type: 'select', options: ['Casual', 'Formal', 'Party', 'Wedding', 'Office'], label: 'Occasion' },
          season: { type: 'select', options: ['Summer', 'Winter', 'All Season'], label: 'Season' },
          careInstructions: { type: 'text', label: 'Care Instructions', placeholder: 'e.g., Machine wash cold, hang dry' },
          fit: { type: 'select', options: ['Slim Fit', 'Regular Fit', 'Loose Fit', 'Oversized'], label: 'Fit Type' }
        };
      case 'footwear':
        return {
          sizes: { type: 'multi-select', options: ['5', '6', '7', '8', '9', '10', '11', '12'], label: 'Available Sizes' },
          colors: { type: 'multi-text', label: 'Available Colors', placeholder: 'Enter colors separated by commas' },
          material: { type: 'text', label: 'Upper Material' },
          soleMaterial: { type: 'text', label: 'Sole Material' },
          heelHeight: { type: 'select', options: ['Flat', 'Low (1-2 inches)', 'Medium (2-3 inches)', 'High (3+ inches)'], label: 'Heel Height' },
          closure: { type: 'select', options: ['Lace-up', 'Slip-on', 'Buckle', 'Velcro'], label: 'Closure' },
          width: { type: 'select', options: ['Narrow', 'Medium', 'Wide', 'Extra Wide'], label: 'Width' }
        };
      case 'jewellery':
        return {
          material: { type: 'select', options: ['Gold', 'Silver', 'Platinum', 'Diamond', 'Pearl', 'Gemstone'], label: 'Primary Material' },
          secondaryMaterial: { type: 'text', label: 'Secondary Material', placeholder: 'e.g., Gold plated, Sterling silver' },
          type: { type: 'select', options: ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Anklet'], label: 'Type' },
          occasion: { type: 'select', options: ['Daily Wear', 'Formal', 'Party', 'Wedding'], label: 'Occasion' },
          gender: { type: 'select', options: ['Women', 'Men', 'Unisex'], label: 'Gender' },
          gemstone: { type: 'text', label: 'Gemstone Details', placeholder: 'e.g., Diamond, Ruby, Emerald' },
          weight: { type: 'text', label: 'Weight (grams)', placeholder: 'e.g., 2.5g' }
        };
      case 'lingerie':
        return {
          sizes: { type: 'multi-select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], label: 'Available Sizes' },
          colors: { type: 'multi-text', label: 'Available Colors', placeholder: 'Enter colors separated by commas' },
          material: { type: 'text', label: 'Material' },
          type: { type: 'select', options: ['Bra', 'Panties', 'Lingerie Set', 'Sleepwear'], label: 'Type' },
          cupSize: { type: 'select', options: ['A', 'B', 'C', 'D', 'DD', 'E', 'F'], label: 'Cup Size' },
          bandSize: { type: 'select', options: ['28', '30', '32', '34', '36', '38', '40', '42'], label: 'Band Size' }
        };
      case 'watches':
        return {
          brand: { type: 'text', label: 'Brand' },
          type: { type: 'select', options: ['Analog', 'Digital', 'Smartwatch', 'Chronograph'], label: 'Type' },
          material: { type: 'select', options: ['Stainless Steel', 'Leather', 'Rubber', 'Gold', 'Silver'], label: 'Band Material' },
          caseMaterial: { type: 'text', label: 'Case Material', placeholder: 'e.g., Stainless steel, ceramic' },
          waterResistance: { type: 'select', options: ['30m', '50m', '100m', '200m', 'Not Water Resistant'], label: 'Water Resistance' },
          movement: { type: 'select', options: ['Quartz', 'Automatic', 'Mechanical', 'Solar'], label: 'Movement Type' },
          features: { type: 'multi-text', label: 'Features', placeholder: 'e.g., Date display, chronograph, GPS' }
        };
      case 'kids':
        return {
          ageGroup: { type: 'select', options: ['0-2 years', '3-5 years', '6-8 years', '9-12 years', '13+ years'], label: 'Age Group' },
          sizes: { type: 'multi-select', options: ['XS', 'S', 'M', 'L', 'XL'], label: 'Available Sizes' },
          colors: { type: 'multi-text', label: 'Available Colors', placeholder: 'Enter colors separated by commas' },
          gender: { type: 'select', options: ['Boys', 'Girls', 'Unisex'], label: 'Gender' },
          occasion: { type: 'select', options: ['Casual', 'School', 'Party', 'Sports'], label: 'Occasion' },
          safetyFeatures: { type: 'multi-text', label: 'Safety Features', placeholder: 'e.g., Non-toxic, BPA-free, flame retardant' }
        };
      case 'home-lifestyle':
        return {
          room: { type: 'select', options: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room'], label: 'Room' },
          material: { type: 'text', label: 'Primary Material' },
          secondaryMaterial: { type: 'text', label: 'Secondary Material', placeholder: 'e.g., Wood frame, metal legs' },
          dimensions: { type: 'text', label: 'Dimensions (L x W x H)', placeholder: 'e.g., 120cm x 60cm x 75cm' },
          colors: { type: 'multi-text', label: 'Available Colors', placeholder: 'Enter colors separated by commas' },
          assembly: { type: 'select', options: ['Ready to Use', 'Assembly Required', 'Professional Installation'], label: 'Assembly Required' },
          warranty: { type: 'text', label: 'Warranty Period', placeholder: 'e.g., 1 year, 2 years' }
        };
      case 'accessories':
        return {
          type: { type: 'select', options: ['Handbag', 'Wallet', 'Belt', 'Scarf', 'Hat', 'Sunglasses'], label: 'Type' },
          material: { type: 'text', label: 'Primary Material' },
          colors: { type: 'multi-text', label: 'Available Colors', placeholder: 'Enter colors separated by commas' },
          gender: { type: 'select', options: ['Women', 'Men', 'Unisex'], label: 'Gender' },
          closure: { type: 'text', label: 'Closure Type', placeholder: 'e.g., Zipper, magnetic, snap' },
          capacity: { type: 'text', label: 'Capacity/Size', placeholder: 'e.g., 15L, 20cm x 15cm' }
        };
      case 'beauty':
        return {
          skinType: { type: 'multi-select', options: ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'], label: 'Suitable Skin Types' },
          finish: { type: 'select', options: ['Matte', 'Dewy', 'Satin', 'Natural'], label: 'Finish' },
          coverage: { type: 'select', options: ['Light', 'Medium', 'Full'], label: 'Coverage' },
          shades: { type: 'multi-text', label: 'Available Shades', placeholder: 'Enter shades separated by commas' },
          volume: { type: 'text', label: 'Volume/Size', placeholder: 'e.g., 30ml, 50g' },
          ingredients: { type: 'text', label: 'Key Ingredients', placeholder: 'e.g., Hyaluronic acid, Vitamin C' },
          spf: { type: 'text', label: 'SPF Level', placeholder: 'e.g., SPF 30, SPF 50' }
        };
      case 'sportswear':
        return {
          activity: { type: 'multi-select', options: ['Running', 'Gym', 'Yoga', 'Swimming', 'Cycling', 'Tennis'], label: 'Suitable Activities' },
          sizes: { type: 'multi-select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], label: 'Available Sizes' },
          colors: { type: 'multi-text', label: 'Available Colors', placeholder: 'Enter colors separated by commas' },
          gender: { type: 'select', options: ['Men', 'Women', 'Unisex'], label: 'Gender' },
          season: { type: 'select', options: ['Summer', 'Winter', 'All Season'], label: 'Season' },
          fabric: { type: 'text', label: 'Fabric Type', placeholder: 'e.g., Polyester, Cotton blend' },
          features: { type: 'multi-text', label: 'Features', placeholder: 'e.g., Moisture-wicking, UV protection' }
        };
      case 'gifting-guide':
        return {
          occasion: { type: 'multi-select', options: ['Birthday', 'Anniversary', 'Wedding', 'Holiday', 'Graduation'], label: 'Suitable Occasions' },
          recipient: { type: 'select', options: ['Men', 'Women', 'Kids', 'Couples', 'Family'], label: 'Recipient' },
          priceRange: { type: 'select', options: ['Under ₹1000', '₹1000-5000', '₹5000-10000', '₹10000+'], label: 'Price Range' },
          giftType: { type: 'select', options: ['Physical Product', 'Experience', 'Subscription', 'Digital'], label: 'Gift Type' },
          packaging: { type: 'select', options: ['Standard', 'Gift Box', 'Premium Packaging', 'Custom'], label: 'Packaging' }
        };
      default:
        return {};
    }
  };

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };

    if (categoryDropdownOpen || statusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen, statusDropdownOpen]);

  // Load seller products
  const loadProducts = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('sellerId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(productsQuery);
      
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      console.log('📦 Loaded products:', productsData);
      console.log('🖼️ Product images:', productsData.map(p => ({ id: p.id, name: p.name, image: p.image })));
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentUser]);

  // Handle authentication redirect
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      displayName: userData?.displayName || currentUser?.displayName || '',
      phone: userData?.phone || '',
      address: userData?.address || '',
      businessName: userData?.businessName || '',
      businessType: userData?.businessType || '',
      businessDescription: userData?.businessDescription || '',
      location: userData?.location || null,
      profilePicture: userData?.profilePicture || ''
    });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      console.log('Saving profile data:', editData);
      
      // Update the user profile with all business information
      await updateUserProfile(currentUser.uid, {
        displayName: editData.displayName,
        phone: editData.phone,
        address: editData.address,
        businessName: editData.businessName,
        businessType: editData.businessType,
        businessDescription: editData.businessDescription,
        businessAddress: editData.address, // Use address as business address
        location: editData.location
      });
      
      console.log('Profile update successful, refreshing user data...');
      
      // Refresh user data to get the updated information
      await refreshUserData();
      
      console.log('User data refreshed successfully');
      
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setIsSuccess(true);
      setTimeout(() => {
        setMessage('');
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
      setIsSuccess(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      displayName: userData?.displayName || currentUser?.displayName || '',
      phone: userData?.phone || '',
      address: userData?.address || '',
      businessName: userData?.businessName || '',
      businessType: userData?.businessType || '',
      businessDescription: userData?.businessDescription || '',
      location: userData?.location || null,
      profilePicture: userData?.profilePicture || ''
    });
  };

  const handleProfilePicUpload = (url: string) => {
    setEditData({...editData, profilePicture: url});
    setShowProfilePicUpload(false);
  };

  const handleProfilePicRemove = () => {
    setEditData({...editData, profilePicture: ''});
    setShowProfilePicUpload(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      brand: '',
      image: '',
      images: [],
      stock: 0,
      rating: 0,
      reviews: 0,
      tags: [],
      featured: false,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setCategorySpecificData({});
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({...formData, tags: [...formData.tags, tag.trim()]});
    }
  };

  const removeTag = (tag: string) => {
    setFormData({...formData, tags: formData.tags.filter(t => t !== tag)});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    // Check if user has seller role
    if (userData?.role !== 'shop') {
      setMessage('Only sellers can create products. Please apply to become a seller first.');
      setIsSuccess(false);
      return;
    }
    
    try {
      console.log('🔍 Creating product for user:', {
        uid: currentUser.uid,
        role: userData?.role,
        displayName: userData?.displayName || currentUser.displayName
      });
      
      const productData = {
        ...formData,
        sellerId: currentUser.uid,
        sellerName: userData?.displayName || currentUser.displayName,
        categorySpecificData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('📦 Product data to save:', productData);
      console.log('🖼️ Product image URL:', productData.image);

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id!), {
          ...productData,
          updatedAt: new Date()
        });
        setMessage('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'products'), productData);
        setMessage('Product added successfully!');
      }
      
      setIsSuccess(true);
      setShowAddProduct(false);
      setEditingProduct(null);
      resetForm();
      await loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving product:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      let errorMessage = 'Failed to save product. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please make sure you are logged in as a seller.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      }
      
      setMessage(errorMessage);
      setIsSuccess(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteDoc(doc(db, 'products', productId));
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'products', productId), {
        status: newStatus
      });
      await loadProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update product status. Please try again.');
    }
  };

  // Show loading or redirect if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message Display */}
      {message && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
          isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message}
        </div>
      )}
      
      <div className="main-content pt-4">
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {editData.profilePicture ? (
                    <img 
                      src={editData.profilePicture} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {(userData?.displayName || currentUser?.displayName || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button 
                    onClick={() => setShowProfilePicUpload(!showProfilePicUpload)}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    title="Edit profile picture"
                    aria-label="Edit profile picture"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData?.displayName || currentUser?.displayName || 'Seller'}
                  </h1>
                  <p className="text-gray-600 text-lg">{userData?.businessName || 'Business Name'}</p>
                  <p className="text-sm text-gray-500">{userData?.businessType || 'Business Type'}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/seller/dashboard">
                  <Button
                    variant="secondary"
                    className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => setShowAddProduct(true)}
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Picture Upload Modal */}
          {showProfilePicUpload && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Update Profile Picture</h2>
                <button
                  onClick={() => setShowProfilePicUpload(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close profile picture upload"
                  aria-label="Close profile picture upload"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="max-w-md mx-auto">
                <ImageUpload
                  onImageUpload={handleProfilePicUpload}
                  onImageRemove={handleProfilePicRemove}
                  currentImage={editData.profilePicture}
                  maxSize={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Upload a profile picture (max 5MB, JPEG, PNG, or WEBP)
                </p>
                
                <div className="flex space-x-3 mt-4">
                  <Button 
                    onClick={() => {
                      // Save the profile picture immediately when uploaded
                      setShowProfilePicUpload(false);
                    }}
                    variant="primary" 
                    size="sm"
                    className="flex-1"
                  >
                    Done
                  </Button>
                  <Button 
                    onClick={() => setShowProfilePicUpload(false)}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Profile Info & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="text-xl font-bold text-gray-900">{products.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Products</p>
                        <p className="text-xl font-bold text-gray-900">
                          {products.filter(p => p.status === 'active').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Sales</p>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{userData?.stats?.totalSales?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <p className="text-xl font-bold text-gray-900">
                          {(userData?.stats?.rating || 0).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reserved</p>
                        <p className="text-xl font-bold text-gray-900">
                          {userData?.stats?.reservedCount || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={editData.displayName}
                        onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your display name"
                        aria-label="Display Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                        aria-label="Phone Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={editData.address}
                        onChange={(e) => setEditData({...editData, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter your address"
                        aria-label="Address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        value={editData.businessName}
                        onChange={(e) => setEditData({...editData, businessName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your business name"
                        aria-label="Business Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                      <input
                        type="text"
                        value={editData.businessType}
                        onChange={(e) => setEditData({...editData, businessType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your business type"
                        aria-label="Business Type"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                      <textarea
                        value={editData.businessDescription}
                        onChange={(e) => setEditData({...editData, businessDescription: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter your business description"
                        aria-label="Business Description"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Store Location</label>
                        {editData.location && (
                          <Button
                            onClick={() => {
                              const { lat, lng } = editData.location;
                              const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m&hl=en&gl=IN&mapclient=embed`;
                              window.open(mapsUrl, '_blank');
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            View on Google Maps
                          </Button>
                        )}
                      </div>
                      <GoogleMapLocation
                        location={editData.location}
                        onLocationChange={(location) => setEditData({...editData, location})}
                        isEditing={true}
                        height="250px"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button onClick={handleSave} variant="primary" className="flex-1">
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{currentUser?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{userData?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span className="text-gray-600">{userData?.address || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Joined {userData?.createdAt ? 
                          (userData.createdAt instanceof Date ? 
                            userData.createdAt.toLocaleDateString() : 
                            new Date(userData.createdAt).toLocaleDateString()
                          ) : 'Unknown'}
                      </span>
                    </div>
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Store Location</p>
                        {userData?.location && (
                          <Button
                            onClick={() => {
                              const { lat, lng } = userData.location;
                              const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m&hl=en&gl=IN&mapclient=embed`;
                              window.open(mapsUrl, '_blank');
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            View on Google Maps
                          </Button>
                        )}
                      </div>
                      <GoogleMapLocation
                        location={userData?.location || null}
                        onLocationChange={() => {}}
                        isEditing={false}
                        height="200px"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Products */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Products ({products.length})</h3>
                  <Button
                    onClick={() => setShowAddProduct(true)}
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first product to your store.</p>
                    <Button
                      onClick={() => setShowAddProduct(true)}
                      variant="primary"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {/* Clickable Product Link */}
                        <Link 
                          to={`/product/${product.id}`}
                          className="block hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          {/* Product Image */}
                          {product.image && (
                            <div className="mb-4">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-48 object-cover rounded-lg"
                                onError={(e) => {
                                  console.error('Error loading product image:', product.image);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                          </div>
                          
                          {/* Click indicator */}
                          <div className="text-center mt-2">
                            <span className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors">
                              Click to view details →
                            </span>
                          </div>
                        </Link>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleToggleProductStatus(product.id!, product.status)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            {product.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            onClick={() => handleDeleteProduct(product.id!)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reserved Products Section */}
          <div className="mb-8">
            <ReservedProducts sellerId={currentUser?.uid || ''} />
          </div>

          {/* Add/Edit Product Form */}
          {showAddProduct && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <div className="space-y-4">
                {/* Test Data Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Quick Fill Examples</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      onClick={() => {
                        // Women's Fashion
                        const testData = {
                          name: 'Elegant Summer Dress',
                          description: 'Beautiful floral summer dress perfect for parties and casual outings. Made with premium cotton blend for comfort and style.',
                          price: 2499,
                          originalPrice: 3499,
                          category: 'women',
                          brand: 'StyleHub',
                          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
                            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
                            'https://images.unsplash.com/photo-1566479179817-c0d9ed07c9e5?w=500'
                          ],
                          stock: 15,
                          rating: 4.7,
                          reviews: 234,
                          tags: ['dress', 'summer', 'floral', 'elegant', 'party'],
                          featured: true,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          sizes: ['S', 'M', 'L', 'XL'],
                          colors: 'Navy Blue, Floral Print, White',
                          material: 'Premium Cotton Blend',
                          occasion: 'Party',
                          season: 'Summer',
                          careInstructions: 'Machine wash cold, hang dry',
                          fit: 'Regular Fit'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      👗 Women's Dress
                    </Button>

                    <Button
                      onClick={() => {
                        // Footwear
                        const testData = {
                          name: 'Premium Leather Sneakers',
                          description: 'High-quality leather sneakers with modern design and superior comfort. Perfect for daily wear and casual outings.',
                          price: 4599,
                          originalPrice: 5999,
                          category: 'footwear',
                          brand: 'UrbanSteps',
                          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
                            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500',
                            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'
                          ],
                          stock: 8,
                          rating: 4.6,
                          reviews: 156,
                          tags: ['sneakers', 'leather', 'casual', 'comfortable', 'premium'],
                          featured: false,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          sizes: ['7', '8', '9', '10', '11'],
                          colors: 'Black, White, Brown, Navy',
                          material: 'Genuine Leather',
                          soleMaterial: 'Rubber',
                          heelHeight: 'Flat',
                          closure: 'Lace-up',
                          width: 'Medium'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      👟 Sneakers
                    </Button>

                    <Button
                      onClick={() => {
                        // Jewellery
                        const testData = {
                          name: 'Diamond Engagement Ring',
                          description: 'Exquisite diamond engagement ring with brilliant cut center stone. Handcrafted with attention to detail and timeless elegance.',
                          price: 89999,
                          originalPrice: 119999,
                          category: 'jewellery',
                          brand: 'LuxuryGems',
                          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
                            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500',
                            'https://images.unsplash.com/photo-1506630448388-4e683c17fa5e?w=500'
                          ],
                          stock: 3,
                          rating: 4.9,
                          reviews: 89,
                          tags: ['diamond', 'engagement', 'ring', 'luxury', 'gold'],
                          featured: true,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          material: 'Diamond',
                          secondaryMaterial: '18K Gold',
                          type: 'Ring',
                          occasion: 'Wedding',
                          gender: 'Women',
                          gemstone: '1.5 Carat Diamond',
                          weight: '3.2g'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      💍 Diamond Ring
                    </Button>

                    <Button
                      onClick={() => {
                        // Watches
                        const testData = {
                          name: 'Luxury Smartwatch',
                          description: 'Premium smartwatch with health monitoring, GPS, and 7-day battery life. Perfect for fitness enthusiasts and professionals.',
                          price: 25999,
                          originalPrice: 32999,
                          category: 'watches',
                          brand: 'TechTime',
                          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                            'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500',
                            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500'
                          ],
                          stock: 12,
                          rating: 4.8,
                          reviews: 445,
                          tags: ['smartwatch', 'fitness', 'gps', 'health', 'premium'],
                          featured: true,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          brand: 'TechTime',
                          type: 'Smartwatch',
                          material: 'Stainless Steel',
                          caseMaterial: 'Titanium',
                          waterResistance: '50m',
                          movement: 'Digital',
                          features: 'Heart Rate Monitor, GPS, Sleep Tracking, Water Resistant'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      ⌚ Smartwatch
                    </Button>

                    <Button
                      onClick={() => {
                        // Beauty
                        const testData = {
                          name: 'Anti-Aging Serum Set',
                          description: 'Complete anti-aging skincare set with vitamin C serum, retinol cream, and hyaluronic acid moisturizer. Dermatologist tested.',
                          price: 3499,
                          originalPrice: 4999,
                          category: 'beauty',
                          brand: 'GlowSkin',
                          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
                            'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500',
                            'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500'
                          ],
                          stock: 20,
                          rating: 4.5,
                          reviews: 678,
                          tags: ['skincare', 'anti-aging', 'vitamin-c', 'serum', 'beauty'],
                          featured: false,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          skinType: ['Dry', 'Combination', 'Normal'],
                          finish: 'Natural',
                          coverage: 'Light',
                          shades: 'Universal, Light, Medium',
                          volume: '30ml each',
                          ingredients: 'Vitamin C, Hyaluronic Acid, Retinol, Peptides',
                          spf: 'SPF 30'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      💄 Beauty Set
                    </Button>

                    <Button
                      onClick={() => {
                        // Home & Lifestyle
                        const testData = {
                          name: 'Modern Coffee Table',
                          description: 'Contemporary wooden coffee table with glass top and metal legs. Perfect for living rooms and modern home decor.',
                          price: 12999,
                          originalPrice: 15999,
                          category: 'home-lifestyle',
                          brand: 'HomeDecor',
                          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
                            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
                            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
                          ],
                          stock: 5,
                          rating: 4.4,
                          reviews: 123,
                          tags: ['furniture', 'coffee-table', 'wooden', 'modern', 'living-room'],
                          featured: false,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          room: 'Living Room',
                          material: 'Solid Oak Wood',
                          secondaryMaterial: 'Tempered Glass Top, Metal Legs',
                          dimensions: '120cm x 60cm x 45cm',
                          colors: 'Natural Wood, Black, White',
                          assembly: 'Assembly Required',
                          warranty: '2 years'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      🏠 Coffee Table
                    </Button>

                    <Button
                      onClick={() => {
                        // Sportswear
                        const testData = {
                          name: 'Performance Running Set',
                          description: 'Complete running outfit with moisture-wicking fabric, breathable design, and ergonomic fit. Perfect for marathons and training.',
                          price: 3999,
                          originalPrice: 4999,
                          category: 'sportswear',
                          brand: 'FitGear',
                          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
                            'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500',
                            'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=500'
                          ],
                          stock: 18,
                          rating: 4.6,
                          reviews: 234,
                          tags: ['running', 'sportswear', 'performance', 'moisture-wicking', 'athletic'],
                          featured: true,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          activity: ['Running', 'Gym', 'Training'],
                          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                          colors: 'Black, Navy, Red, White',
                          gender: 'Unisex',
                          season: 'All Season',
                          fabric: 'Polyester with Spandex',
                          features: 'Moisture-wicking, UV Protection, Quick Dry, Breathable'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      ⚽ Sportswear
                    </Button>

                    <Button
                      onClick={() => {
                        // Kids
                        const testData = {
                          name: 'Educational Toy Set',
                          description: 'Safe and educational toy set for toddlers. Includes building blocks, puzzles, and learning cards. BPA-free and non-toxic materials.',
                          price: 1999,
                          originalPrice: 2499,
                          category: 'kids',
                          brand: 'LearnPlay',
                          image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500',
                            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
                            'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500'
                          ],
                          stock: 25,
                          rating: 4.7,
                          reviews: 189,
                          tags: ['toys', 'educational', 'kids', 'safe', 'learning'],
                          featured: false,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          ageGroup: '3-5 years',
                          sizes: ['One Size'],
                          colors: 'Multi-color, Bright, Pastel',
                          gender: 'Unisex',
                          occasion: 'Play',
                          safetyFeatures: 'BPA-free, Non-toxic, Lead-free, Phthalate-free'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      👶 Kids Toys
                    </Button>

                    <Button
                      onClick={() => {
                        // Accessories
                        const testData = {
                          name: 'Premium Leather Handbag',
                          description: 'Elegant leather handbag with multiple compartments and adjustable strap. Perfect for work, travel, and everyday use.',
                          price: 5999,
                          originalPrice: 7999,
                          category: 'accessories',
                          brand: 'StyleCraft',
                          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                          images: [
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
                            'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=500'
                          ],
                          stock: 10,
                          rating: 4.5,
                          reviews: 156,
                          tags: ['handbag', 'leather', 'premium', 'fashion', 'accessory'],
                          featured: true,
                          status: 'active' as 'active' | 'inactive' | 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        };
                        setFormData(testData);
                        setCategorySpecificData({
                          type: 'Handbag',
                          material: 'Genuine Leather',
                          colors: 'Black, Brown, Tan, Navy',
                          gender: 'Women',
                          closure: 'Magnetic Snap',
                          capacity: '25cm x 18cm x 8cm'
                        });
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      👜 Handbag
                    </Button>
                  </div>
                </div>
                
                {/* Cancel Button - Full Width on Mobile */}
                <Button
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter brand name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => {
                          const value = Math.max(0, parseFloat(e.target.value) || 0);
                          setFormData({...formData, price: value});
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter price in rupees (0 or more)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => {
                          const value = Math.max(0, parseFloat(e.target.value) || 0);
                          setFormData({...formData, originalPrice: value});
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter original price for discount calculation (optional)</p>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors duration-200"
                        >
                          <span className="flex items-center space-x-2">
                            {formData.category ? (
                              <>
                                <span className="text-lg">
                                  {categories.find(c => c.value === formData.category)?.icon}
                                </span>
                                <span className="text-gray-900">
                                  {categories.find(c => c.value === formData.category)?.label}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500">Select Category</span>
                            )}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                              categoryDropdownOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {categoryDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {categories.map(category => (
                              <button
                                key={category.value}
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, category: category.value});
                          setCategorySpecificData({}); // Reset category-specific data
                                  setCategoryDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center space-x-3 transition-colors duration-150"
                              >
                                <span className="text-lg">{category.icon}</span>
                                <span className="text-gray-900 font-medium">{category.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.stock}
                        onChange={(e) => {
                          const value = Math.max(0, parseInt(e.target.value) || 0);
                          setFormData({...formData, stock: value});
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter quantity (0 or more)"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter 0 or a positive number</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Image *
                      </label>
                      <ImageUpload
                        onImageUpload={(url) => {
                          console.log('🖼️ SellerProfilePage: Image uploaded, setting formData.image to:', url);
                          setFormData({...formData, image: url});
                        }}
                        onImageRemove={() => {
                          console.log('🖼️ SellerProfilePage: Image removed, clearing formData.image');
                          setFormData({...formData, image: ''});
                        }}
                        currentImage={formData.image}
                        maxSize={10}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload the primary product image (max 10MB)</p>
                      {formData.image && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs text-green-700">Current image URL:</p>
                          <p className="text-xs text-green-600 break-all">{formData.image}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Images
                      </label>
                      <div className="space-y-4">
                        {(formData.images || []).map((image, index) => (
                          <div key={index} className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Image {index + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = (formData.images || []).filter((_, i) => i !== index);
                                  setFormData({...formData, images: newImages});
                                }}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                                title={`Remove image ${index + 1}`}
                                aria-label={`Remove image ${index + 1}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <ImageUpload
                              onImageUpload={(url) => {
                                const newImages = [...(formData.images || [])];
                                newImages[index] = url;
                                setFormData({...formData, images: newImages});
                              }}
                              onImageRemove={() => {
                                const newImages = (formData.images || []).filter((_, i) => i !== index);
                                setFormData({...formData, images: newImages});
                              }}
                              currentImage={image}
                              maxSize={10}
                              className="w-full"
                            />
                          </div>
                        ))}
                        {(formData.images || []).length < 5 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, images: [...(formData.images || []), '']});
                            }}
                            className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors duration-200 flex flex-col items-center justify-center"
                          >
                            <Plus className="w-6 h-6 mb-2" />
                            <span>Add Additional Image</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Add up to 5 additional product images (max 10MB each)</p>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="relative" ref={statusDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors duration-200"
                        >
                          <span className="flex items-center space-x-2">
                            {formData.status ? (
                              <>
                                <span className="text-lg">
                                  {statusOptions.find(s => s.value === formData.status)?.icon}
                                </span>
                                <span className={`font-medium ${statusOptions.find(s => s.value === formData.status)?.color}`}>
                                  {statusOptions.find(s => s.value === formData.status)?.label}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500">Select Status</span>
                            )}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                              statusDropdownOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {statusDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                            {statusOptions.map(status => (
                              <button
                                key={status.value}
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, status: status.value as 'active' | 'inactive' | 'draft'});
                                  setStatusDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center space-x-3 transition-colors duration-150"
                              >
                                <span className="text-lg">{status.icon}</span>
                                <span className={`font-medium ${status.color}`}>{status.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category-Specific Fields */}
                  {Object.keys(getCategorySpecificFields(formData.category)).length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-blue-600" />
                        {categories.find(c => c.value === formData.category)?.icon} {categories.find(c => c.value === formData.category)?.label} Specific Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(getCategorySpecificFields(formData.category)).map(([key, field]) => (
                          <div key={key} className={field.type === 'multi-text' ? 'md:col-span-2' : ''}>
                            <label htmlFor={`category-${key}`} className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                              {field.type === 'multi-select' && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            
                            {field.type === 'select' ? (
                              <select
                                id={`category-${key}`}
                                value={categorySpecificData[key] || ''}
                                onChange={(e) => setCategorySpecificData({...categorySpecificData, [key]: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select {field.label}</option>
                                {field.options.map((option: string) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : field.type === 'multi-select' ? (
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {field.options.map((option: string) => {
                                    const isSelected = (categorySpecificData[key] || []).includes(option);
                                    return (
                                      <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                          const currentValues = categorySpecificData[key] || [];
                                          const newValues = isSelected
                                            ? currentValues.filter((v: string) => v !== option)
                                            : [...currentValues, option];
                                          setCategorySpecificData({...categorySpecificData, [key]: newValues});
                                        }}
                                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                          isSelected
                                            ? 'bg-blue-500 text-white border-2 border-blue-500'
                                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                                        }`}
                                      >
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-gray-500">Click to select multiple options</p>
                              </div>
                            ) : field.type === 'multi-text' ? (
                              <div>
                                <textarea
                                  id={`category-${key}`}
                                  value={categorySpecificData[key] || ''}
                                  onChange={(e) => setCategorySpecificData({...categorySpecificData, [key]: e.target.value})}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                  rows={3}
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
                              </div>
                            ) : field.type === 'number' ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={categorySpecificData[key] || ''}
                                onChange={(e) => {
                                  const value = Math.max(0, parseFloat(e.target.value) || 0);
                                  setCategorySpecificData({...categorySpecificData, [key]: value});
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={categorySpecificData[key] || ''}
                                onChange={(e) => setCategorySpecificData({...categorySpecificData, [key]: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter product description"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-green-600 hover:text-green-800"
                            aria-label={`Remove ${tag} tag`}
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a tag and press Enter"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                        resetForm();
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

          {/* Sign Out Button */}
          <div className="text-center">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;
