import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Edit, Trash2, Search, Filter, Star, 
  DollarSign, ShoppingCart, Eye, Save, X, Image as ImageIcon,
  Tag, Calendar, TrendingUp, BarChart3
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

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

const ProductManagementPage: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'electronics',
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

  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});

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
          engine: { type: 'text', label: 'Engine Details' }
        };
      case 'home':
        return {
          dimensions: { type: 'text', label: 'Dimensions (L x W x H)' },
          material: { type: 'text', label: 'Material' },
          color: { type: 'text', label: 'Color' },
          room: { type: 'select', options: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'], label: 'Room Type' },
          assembly: { type: 'select', options: ['Ready to Use', 'Assembly Required'], label: 'Assembly' }
        };
      case 'beauty':
        return {
          skinType: { type: 'select', options: ['All Skin Types', 'Dry', 'Oily', 'Combination', 'Sensitive'], label: 'Skin Type' },
          volume: { type: 'text', label: 'Volume/Size' },
          ingredients: { type: 'text', label: 'Key Ingredients' },
          ageGroup: { type: 'select', options: ['All Ages', 'Teen', 'Adult', 'Senior'], label: 'Age Group' }
        };
      case 'sports':
        return {
          sport: { type: 'text', label: 'Sport/Activity' },
          level: { type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Professional'], label: 'Skill Level' },
          ageGroup: { type: 'select', options: ['Kids', 'Youth', 'Adult', 'Senior'], label: 'Age Group' },
          gender: { type: 'select', options: ['Men', 'Women', 'Unisex'], label: 'Gender' },
          size: { type: 'text', label: 'Size' }
        };
      case 'books':
        return {
          author: { type: 'text', label: 'Author' },
          publisher: { type: 'text', label: 'Publisher' },
          language: { type: 'text', label: 'Language' },
          pages: { type: 'number', label: 'Number of Pages' },
          format: { type: 'select', options: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'], label: 'Format' },
          genre: { type: 'text', label: 'Genre' }
        };
      case 'toys':
        return {
          ageRange: { type: 'text', label: 'Age Range' },
          gender: { type: 'select', options: ['Boys', 'Girls', 'Unisex'], label: 'Gender' },
          material: { type: 'text', label: 'Material' },
          batteryRequired: { type: 'select', options: ['Yes', 'No'], label: 'Battery Required' },
          educational: { type: 'select', options: ['Yes', 'No'], label: 'Educational' }
        };
      case 'food':
        return {
          weight: { type: 'text', label: 'Weight/Volume' },
          expiryDate: { type: 'date', label: 'Expiry Date' },
          ingredients: { type: 'text', label: 'Ingredients' },
          dietaryInfo: { type: 'text', label: 'Dietary Information' },
          origin: { type: 'text', label: 'Country of Origin' }
        };
      case 'jewelry':
        return {
          metal: { type: 'select', options: ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'Other'], label: 'Metal Type' },
          gemstone: { type: 'text', label: 'Gemstone' },
          size: { type: 'text', label: 'Size' },
          gender: { type: 'select', options: ['Men', 'Women', 'Unisex'], label: 'Gender' },
          occasion: { type: 'text', label: 'Occasion' }
        };
      case 'furniture':
        return {
          dimensions: { type: 'text', label: 'Dimensions (L x W x H)' },
          material: { type: 'text', label: 'Material' },
          color: { type: 'text', label: 'Color' },
          room: { type: 'select', options: ['Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 'Office'], label: 'Room Type' },
          assembly: { type: 'select', options: ['Ready to Use', 'Assembly Required'], label: 'Assembly' },
          weight: { type: 'text', label: 'Weight Capacity' }
        };
      default:
        return {};
    }
  };

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      setMessage('Error loading products');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        categorySpecificData: categorySpecificData,
        updatedAt: new Date()
      };

      if (editingProduct) {
        // Update existing product
        await updateDoc(doc(db, 'products', editingProduct.id!), productData);
        setMessage('Product updated successfully!');
      } else {
        // Add new product
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
        setMessage('Product added successfully!');
      }

      setIsSuccess(true);
      setShowAddForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage('Error saving product');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: 'electronics',
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

  // Edit product
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setCategorySpecificData((product as any).categorySpecificData || {});
    setShowAddForm(true);
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setMessage('Product deleted successfully!');
        setIsSuccess(true);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setMessage('Error deleting product');
        setIsSuccess(false);
      }
    }
  };

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tag.trim()] });
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  if (!currentUser || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Navbar userRole="user" />
        <div className="main-content pt-24">
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">You need admin access to manage products.</p>
              <Button onClick={() => navigate('/profile')} variant="primary" size="lg">
                Go to Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 admin-content">
      <Navbar userRole="admin" />
      
      <div className="main-content pt-24">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <Package className="w-8 h-8 mr-3 text-red-600" />
                    Product Management
                  </h1>
                  <p className="text-gray-600">Manage your product catalog</p>
                </div>
                <Button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  variant="primary"
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </Button>
              </div>

            </div>

            {/* Add/Edit Product Form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <div className="flex gap-3">
                    <div className="flex gap-2">
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
                      <Button
                        onClick={() => {
                          // Automotive test data
                          const testData = {
                            name: 'Honda City VX',
                            description: 'Premium sedan with advanced safety features and fuel efficiency',
                            price: 1250000,
                            originalPrice: 1350000,
                            category: 'automotive',
                            brand: 'Honda',
                            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500',
                            images: [
                              'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500',
                              'https://images.unsplash.com/photo-1549317336-206569e8475c?w=500'
                            ],
                            stock: 5,
                            rating: 4.6,
                            reviews: 234,
                            tags: ['car', 'honda', 'sedan', 'premium'],
                            featured: true,
                            status: 'active',
                            createdAt: new Date(),
                            updatedAt: new Date()
                          };
                          setFormData(testData);
                          setCategorySpecificData({
                            year: 2024,
                            mileage: '0',
                            fuelType: 'Petrol',
                            transmission: 'Automatic',
                            bodyType: 'Sedan',
                            engine: '1.5L i-VTEC'
                          });
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        🚗 Car
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProduct(null);
                        resetForm();
                      }}
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({...formData, category: e.target.value});
                          setCategorySpecificData({}); // Reset category-specific data
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      >
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'draft'})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            {field.type === 'select' ? (
                              <select
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
                            ) : field.type === 'date' ? (
                              <input
                                type="date"
                                value={categorySpecificData[key] || ''}
                                onChange={(e) => setCategorySpecificData({...categorySpecificData, [key]: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a tag and press Enter"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
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
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingProduct ? 'Update Product' : 'Add Product'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Products ({filteredProducts.length})
              </h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No products found</p>
                  <p className="text-gray-400">Add your first product to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                          <p className="text-gray-600 text-sm">{product.brand}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEdit(product)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(product.id!)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {product.image && (
                        <div className="mb-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            {product.rating} ({product.reviews})
                          </span>
                          <span>Stock: {product.stock}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.status}
                          </span>
                          {product.featured && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Featured
                            </span>
                          )}
                        </div>

                        {product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {product.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                +{product.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg flex items-center ${
                isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {isSuccess ? '✅' : '❌'} {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagementPage;
