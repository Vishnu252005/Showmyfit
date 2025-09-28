import React, { useState, useEffect } from 'react';
import { 
  Star, 
  TrendingUp, 
  Percent, 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Eye,
  Package,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface HomePageSection {
  id?: string;
  type: 'featured' | 'bestDeals' | 'offers' | 'trending';
  title: string;
  subtitle?: string;
  products: string[]; // Array of product IDs
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  featured: boolean;
}

const HomePageManagement: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [sections, setSections] = useState<HomePageSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSection, setEditingSection] = useState<HomePageSection | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState<'featured' | 'bestDeals' | 'offers' | 'trending'>('featured');

  const [formData, setFormData] = useState<HomePageSection>({
    type: 'featured',
    title: '',
    subtitle: '',
    products: [],
    displayOrder: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const sectionTypes = [
    {
      value: 'featured',
      label: 'Featured Products',
      icon: Star,
      color: 'bg-purple-500',
      description: 'Handpicked premium products'
    },
    {
      value: 'bestDeals',
      label: 'Best Deals',
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'Products with best discounts'
    },
    {
      value: 'offers',
      label: 'Special Offers',
      icon: Percent,
      color: 'bg-orange-500',
      description: 'Limited time offers and promotions'
    },
    {
      value: 'trending',
      label: 'Trending Deals',
      icon: TrendingUp,
      color: 'bg-red-500',
      description: 'Currently popular products'
    }
  ];

  // Check if user is admin
  if (!currentUser || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 admin-content">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You need admin access to manage home page sections.</p>
            <Button onClick={() => window.location.href = '/profile'} variant="primary" size="lg">
              Go to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Load sections and products
  const loadData = async () => {
    setLoading(true);
    try {
      // Load home page sections
      const sectionsQuery = query(collection(db, 'homePageSections'), orderBy('displayOrder', 'asc'));
      const sectionsSnapshot = await getDocs(sectionsQuery);
      const sectionsData = sectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as HomePageSection[];
      setSections(sectionsData);

      // Load products
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
      console.error('Error loading data:', error);
      setMessage('Error loading data');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sectionData = {
        ...formData,
        updatedAt: new Date()
      };

      if (editingSection) {
        // Update existing section
        await updateDoc(doc(db, 'homePageSections', editingSection.id!), sectionData);
        setMessage('Section updated successfully!');
      } else {
        // Add new section
        sectionData.createdAt = new Date();
        await addDoc(collection(db, 'homePageSections'), sectionData);
        setMessage('Section added successfully!');
      }

      setIsSuccess(true);
      setShowAddForm(false);
      setEditingSection(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving section:', error);
      setMessage('Error saving section');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'featured',
      title: '',
      subtitle: '',
      products: [],
      displayOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  // Edit section
  const handleEdit = (section: HomePageSection) => {
    setEditingSection(section);
    setFormData(section);
    setShowAddForm(true);
  };

  // Delete section
  const handleDelete = async (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteDoc(doc(db, 'homePageSections', sectionId));
        setMessage('Section deleted successfully!');
        setIsSuccess(true);
        loadData();
      } catch (error) {
        console.error('Error deleting section:', error);
        setMessage('Error deleting section');
        setIsSuccess(false);
      }
    }
  };

  // Toggle section active status
  const toggleActive = async (section: HomePageSection) => {
    try {
      await updateDoc(doc(db, 'homePageSections', section.id!), {
        isActive: !section.isActive,
        updatedAt: new Date()
      });
      setMessage(`Section ${!section.isActive ? 'activated' : 'deactivated'} successfully!`);
      setIsSuccess(true);
      loadData();
    } catch (error) {
      console.error('Error updating section:', error);
      setMessage('Error updating section');
      setIsSuccess(false);
    }
  };

  // Add product to section
  const addProductToSection = (productId: string) => {
    if (!formData.products.includes(productId)) {
      setFormData({
        ...formData,
        products: [...formData.products, productId]
      });
    }
  };

  // Remove product from section
  const removeProductFromSection = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(id => id !== productId)
    });
  };

  // Get products for a section
  const getSectionProducts = (productIds: string[]) => {
    return products.filter(product => productIds.includes(product.id));
  };

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
                    <BarChart3 className="w-8 h-8 mr-3 text-red-600" />
                    Home Page Management
                  </h1>
                  <p className="text-gray-600">Manage featured products, deals, offers, and trending sections</p>
                </div>
                <Button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingSection(null);
                    resetForm();
                  }}
                  variant="primary"
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Section
                </Button>
              </div>

              {/* Section Type Tabs */}
              <div className="flex flex-wrap gap-2">
                {sectionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as any)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      selectedType === type.value
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add/Edit Section Form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingSection ? 'Edit Section' : 'Add New Section'}
                  </h2>
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingSection(null);
                      resetForm();
                    }}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      >
                        {sectionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter section title"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter section subtitle (optional)"
                      />
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Products *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            formData.products.includes(product.id)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            if (formData.products.includes(product.id)) {
                              removeProductFromSection(product.id);
                            } else {
                              addProductToSection(product.id);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">{product.brand}</p>
                              <p className="text-sm font-bold text-gray-900">₹{product.price}</p>
                            </div>
                            {formData.products.includes(product.id) && (
                              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Selected {formData.products.length} products
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active Section
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingSection(null);
                        resetForm();
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || formData.products.length === 0}
                    >
                      {loading ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingSection ? 'Update Section' : 'Add Section'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Sections List */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Home Page Sections ({sections.filter(s => s.type === selectedType).length})
              </h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : sections.filter(s => s.type === selectedType).length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No sections found</p>
                  <p className="text-gray-400">Add your first section to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sections
                    .filter(s => s.type === selectedType)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((section) => {
                      const sectionType = sectionTypes.find(t => t.value === section.type);
                      const sectionProducts = getSectionProducts(section.products);
                      
                      return (
                        <div key={section.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${sectionType?.color} rounded-lg flex items-center justify-center`}>
                                <sectionType?.icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                                {section.subtitle && (
                                  <p className="text-sm text-gray-600">{section.subtitle}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Order: {section.displayOrder} | Products: {sectionProducts.length}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => toggleActive(section)}
                                variant="outline"
                                size="sm"
                                className={section.isActive ? 'text-green-600' : 'text-gray-600'}
                              >
                                {section.isActive ? 'Active' : 'Inactive'}
                              </Button>
                              <Button
                                onClick={() => handleEdit(section)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(section.id!)}
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Products Preview */}
                          {sectionProducts.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {sectionProducts.slice(0, 6).map((product) => (
                                <div key={product.id} className="text-center">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-20 object-cover rounded-lg mb-2"
                                  />
                                  <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                                  <p className="text-xs text-gray-600">₹{product.price}</p>
                                </div>
                              ))}
                              {sectionProducts.length > 6 && (
                                <div className="flex items-center justify-center">
                                  <span className="text-sm text-gray-500">
                                    +{sectionProducts.length - 6} more
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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

export default HomePageManagement;
