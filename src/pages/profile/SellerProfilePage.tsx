import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Edit, LogOut, ShoppingBag, Heart, Star, 
  Settings, ArrowLeft, Calendar, Award, Package, Shield, Eye, Plus,
  TrendingUp, DollarSign, Users, BarChart3, Upload, Image, Tag, XCircle, Save
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../firebase/auth';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

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

const SellerProfilePage: React.FC = () => {
  const { currentUser, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userData?.displayName || currentUser?.displayName || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    businessName: userData?.businessName || '',
    businessType: userData?.businessType || '',
    businessDescription: userData?.businessDescription || ''
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});

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
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'fashion', label: 'Fashion & Clothing', icon: '👕' },
    { value: 'home', label: 'Home & Garden', icon: '🏠' },
    { value: 'beauty', label: 'Beauty & Personal Care', icon: '💄' },
    { value: 'sports', label: 'Sports & Fitness', icon: '⚽' },
    { value: 'books', label: 'Books & Media', icon: '📚' },
    { value: 'toys', label: 'Toys & Games', icon: '🧸' },
    { value: 'automotive', label: 'Automotive', icon: '🚗' },
    { value: 'health', label: 'Health & Wellness', icon: '🏥' },
    { value: 'food', label: 'Food & Beverages', icon: '🍎' },
    { value: 'jewelry', label: 'Jewelry & Accessories', icon: '💍' },
    { value: 'furniture', label: 'Furniture', icon: '🪑' }
  ];

  // Dynamic form fields based on category
  const getCategorySpecificFields = (category: string) => {
    switch (category) {
      case 'fashion':
        return {
          size: { type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], label: 'Size' },
          color: { type: 'text', label: 'Color' },
          material: { type: 'text', label: 'Material' },
          gender: { type: 'select', options: ['Men', 'Women', 'Unisex', 'Kids'], label: 'Gender' },
          season: { type: 'select', options: ['Summer', 'Winter', 'All Season'], label: 'Season' }
        };
      case 'electronics':
        return {
          brand: { type: 'text', label: 'Brand' },
          model: { type: 'text', label: 'Model' },
          screenSize: { type: 'text', label: 'Screen Size (inches)' },
          storage: { type: 'text', label: 'Storage Capacity' },
          color: { type: 'text', label: 'Color' },
          warranty: { type: 'text', label: 'Warranty Period' },
          connectivity: { type: 'text', label: 'Connectivity Options' }
        };
      case 'automotive':
        return {
          year: { type: 'number', label: 'Year' },
          mileage: { type: 'text', label: 'Mileage' },
          fuelType: { type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], label: 'Fuel Type' },
          transmission: { type: 'select', options: ['Manual', 'Automatic', 'CVT'], label: 'Transmission' },
          bodyType: { type: 'select', options: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible'], label: 'Body Type' },
          engine: { type: 'text', label: 'Engine' }
        };
      default:
        return {};
    }
  };

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
      businessDescription: userData?.businessDescription || ''
    });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      await updateUserProfile(currentUser.uid, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
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
      businessDescription: userData?.businessDescription || ''
    });
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
    
    try {
      const productData = {
        ...formData,
        sellerId: currentUser.uid,
        sellerName: userData?.displayName || currentUser.displayName,
        categorySpecificData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

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
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage('Failed to save product. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar userRole="shop" />
      
      <div className="main-content pt-24">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(userData?.displayName || currentUser?.displayName || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {userData?.displayName || currentUser?.displayName || 'Seller'}
                    </h1>
                    <p className="text-gray-600">{userData?.businessName || 'Business Name'}</p>
                    <p className="text-sm text-gray-500">{userData?.businessType || 'Business Type'}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
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
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Add/Edit Product Form */}
            {showAddProduct && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <div className="space-y-4">
                {/* Test Data Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      // Electronics test data
                      const testData = {
                        name: 'iPhone 15 Pro Max',
                        description: 'Latest iPhone with advanced camera system and A17 Pro chip',
                        price: 129999,
                        originalPrice: 139999,
                        category: 'electronics',
                        brand: 'Apple',
                        image: 'https://images.unsplash.com/photo-1592899677977-9c10b588e483?w=500',
                        images: [
                          'https://images.unsplash.com/photo-1592899677977-9c10b588e483?w=500',
                          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
                        ],
                        stock: 50,
                        rating: 4.8,
                        reviews: 1250,
                        tags: ['smartphone', 'apple', 'premium', 'camera'],
                        featured: true,
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                      };
                      setFormData(testData);
                      setCategorySpecificData({
                        brand: 'Apple',
                        model: 'iPhone 15 Pro Max',
                        screenSize: '6.7',
                        storage: '256GB',
                        color: 'Natural Titanium',
                        warranty: '1 Year',
                        connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3'
                      });
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    📱 Phone
                  </Button>
                  <Button
                    onClick={() => {
                      // Fashion test data
                      const testData = {
                        name: 'Nike Air Max 270',
                        description: 'Comfortable running shoes with Max Air cushioning',
                        price: 8999,
                        originalPrice: 9999,
                        category: 'fashion',
                        brand: 'Nike',
                        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                        images: [
                          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500'
                        ],
                        stock: 25,
                        rating: 4.5,
                        reviews: 890,
                        tags: ['shoes', 'nike', 'running', 'sports'],
                        featured: false,
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                      };
                      setFormData(testData);
                      setCategorySpecificData({
                        size: 'L',
                        color: 'Black/White',
                        material: 'Mesh and Synthetic',
                        gender: 'Unisex',
                        season: 'All Season'
                      });
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    👕 Fashion
                  </Button>
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
                        Price *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price
                      </label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({...formData, originalPrice: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({...formData, category: e.target.value});
                          setCategorySpecificData({}); // Reset category-specific data
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'draft'})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
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
                          <div key={key}>
                            <label htmlFor={`category-${key}`} className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
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
                            ) : field.type === 'number' ? (
                              <input
                                type="number"
                                value={categorySpecificData[key] || ''}
                                onChange={(e) => setCategorySpecificData({...categorySpecificData, [key]: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={categorySpecificData[key] || ''}
                                onChange={(e) => setCategorySpecificData({...categorySpecificData, [key]: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Enter ${field.label.toLowerCase()}`}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Products</p>
                    <p className="text-2xl font-bold text-green-600">
                      {products.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{userData?.stats?.totalSales?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {userData?.stats?.rating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h2>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        id="displayName"
                        type="text"
                        value={editData.displayName}
                        onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        id="phone"
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        id="address"
                        value={editData.address}
                        onChange={(e) => setEditData({...editData, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-3">
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
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{currentUser?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{userData?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                      <span className="text-gray-600">{userData?.address || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">
                        Joined {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Business Information
                </h2>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input
                        id="businessName"
                        type="text"
                        value={editData.businessName}
                        onChange={(e) => setEditData({...editData, businessName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                      <input
                        id="businessType"
                        type="text"
                        value={editData.businessType}
                        onChange={(e) => setEditData({...editData, businessType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                      <textarea
                        id="businessDescription"
                        value={editData.businessDescription}
                        onChange={(e) => setEditData({...editData, businessDescription: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Business Name</p>
                      <p className="text-gray-900">{userData?.businessName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Business Type</p>
                      <p className="text-gray-900">{userData?.businessType || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-gray-900">{userData?.businessDescription || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userData?.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : userData?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userData?.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  My Products ({products.length})
                </h2>
                <Button
                  onClick={() => setShowAddProduct(true)}
                  variant="primary"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
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
                        <span className="text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleToggleProductStatus(product.id, product.status)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          {product.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id)}
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

            {/* Sign Out Button */}
            <div className="mt-8 text-center">
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

    </div>
  );
};

export default SellerProfilePage;
