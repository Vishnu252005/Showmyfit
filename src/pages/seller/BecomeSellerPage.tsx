import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Store, CheckCircle, Star, Users, TrendingUp, Shield, 
  CreditCard, Headphones, Zap, Globe, Award, Phone, Mail, MapPin,
  Upload, Eye, EyeOff, User, Building, FileText, DollarSign
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { signUp } from '../../firebase/auth';

const BecomeSellerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    businessDescription: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    
    // Business Details
    yearsInBusiness: '',
    numberOfEmployees: '',
    annualRevenue: '',
    website: '',
    
    // Documents
    gstNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    
    // Categories
    categories: [] as string[],
    
    // Terms
    agreeToTerms: false,
    agreeToMarketing: false
  });

  const businessTypes = [
    'Fashion & Apparel',
    'Electronics & Gadgets',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Sports & Fitness',
    'Books & Stationery',
    'Automotive',
    'Health & Wellness',
    'Food & Beverages',
    'Other'
  ];

  const categories = [
    'Men\'s Clothing', 'Women\'s Clothing', 'Kids\' Clothing', 'Shoes & Footwear',
    'Accessories', 'Jewelry', 'Watches', 'Bags & Luggage', 'Home Decor',
    'Kitchen Appliances', 'Electronics', 'Mobile & Accessories', 'Beauty Products',
    'Health & Wellness', 'Sports & Fitness', 'Books & Media', 'Toys & Games'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Ensure value is never undefined
      const safeValue = value || '';
      setFormData(prev => ({ ...prev, [name]: safeValue }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Starting seller application process...');
      
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        console.log('❌ Password validation failed');
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate terms agreement
      if (!formData.agreeToTerms) {
        console.log('❌ Terms agreement validation failed');
        setError('Please agree to the terms and conditions');
        setLoading(false);
        return;
      }

      console.log('✅ Form validation passed');

      // Create seller account with pending status
      if (!currentUser) {
        console.log('👤 Creating user account...');
        try {
          await signUp(formData.email, formData.password, formData.fullName, 'shop');
          console.log('✅ User account created successfully');
        } catch (authError: any) {
          console.error('❌ Auth error:', authError);
          throw new Error(`Authentication failed: ${authError.message}`);
        }
      } else {
        console.log('👤 User already logged in, skipping account creation');
      }

      // Store seller application in Firestore with pending status
      console.log('📝 Preparing seller application data...');
      const { addDoc, collection } = await import('firebase/firestore');
      const { db } = await import('../../firebase/config');
      
      const sellerApplication = {
        // Personal Information
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        
        // Business Information
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessDescription: formData.businessDescription,
        businessAddress: formData.businessAddress,
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        
        // Business Details
        yearsInBusiness: formData.yearsInBusiness,
        numberOfEmployees: formData.numberOfEmployees,
        annualRevenue: formData.annualRevenue,
        website: formData.website,
        
        // Documents
        documents: {
          gst: formData.gstNumber,
          pan: formData.panNumber,
          bankAccount: formData.bankAccountNumber,
          ifsc: formData.ifscCode
        },
        
        // Categories
        categories: formData.categories,
        
        // Application Status
        role: 'shop',
        status: 'pending',
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        
        // Stats (initialized to 0)
        stats: {
          totalProducts: 0,
          totalSales: 0,
          totalOrders: 0,
          rating: 0
        }
      };

      console.log('📊 Seller application data:', sellerApplication);
      console.log('🔥 Attempting to save to Firestore...');

      try {
        const docRef = await addDoc(collection(db, 'users'), sellerApplication);
        console.log('✅ Seller application saved successfully with ID:', docRef.id);
      } catch (firestoreError: any) {
        console.error('❌ Firestore error details:', {
          code: firestoreError.code,
          message: firestoreError.message,
          stack: firestoreError.stack
        });
        throw new Error(`Database error: ${firestoreError.message} (Code: ${firestoreError.code})`);
      }

      console.log('🎉 Seller application process completed successfully!');
      alert('Seller application submitted successfully! We\'ll review your application and get back to you within 24-48 hours.');
      navigate('/');
    } catch (error: any) {
      console.error('💥 Registration error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setError(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar userRole="user" />
      
      <div className="main-content pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                  Start Selling on <span className="text-yellow-300">Showmyfit</span>
                </h1>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Join thousands of successful sellers and grow your business with our powerful marketplace platform. 
                  Reach millions of customers and boost your sales.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>24/7 support</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Fast approval</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 lg:pl-12">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-6">Why Choose Showmyfit?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <TrendingUp className="w-6 h-6 text-yellow-300 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Boost Your Sales</h4>
                        <p className="text-blue-100 text-sm">Increase your revenue by up to 300%</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="w-6 h-6 text-yellow-300 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Reach More Customers</h4>
                        <p className="text-blue-100 text-sm">Access millions of active buyers</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="w-6 h-6 text-yellow-300 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Secure Payments</h4>
                        <p className="text-blue-100 text-sm">Safe and reliable payment processing</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Headphones className="w-6 h-6 text-yellow-300 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">24/7 Support</h4>
                        <p className="text-blue-100 text-sm">Dedicated support team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Active Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">₹50Cr+</div>
                <div className="text-gray-600">GMV Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">2M+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started Today</h2>
              <p className="text-gray-600 text-lg">Fill out the form below to start your seller journey</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Test Fill Button */}
              <div className="mb-6 flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    setFormData({
                      // Personal Information
                      fullName: 'John Smith',
                      email: 'john.smith@example.com',
                      phone: '+91 9876543210',
                      password: 'password123',
                      confirmPassword: 'password123',
                      
                      // Business Information
                      businessName: 'Smith Electronics Store',
                      businessType: 'Electronics & Gadgets', // Updated to match dropdown option
                      businessDescription: 'Leading electronics retailer specializing in smartphones, laptops, and accessories with 5+ years of experience.',
                      businessAddress: '123 Business Street, Electronics Market, Mumbai, Maharashtra 400001',
                      businessPhone: '+91 9876543210',
                      businessEmail: 'business@smithstore.com',
                      
                      // Business Details
                      yearsInBusiness: '5-10', // Updated to match dropdown option
                      numberOfEmployees: '6-20', // Updated to match dropdown option
                      annualRevenue: '1Cr-5Cr', // Updated to match dropdown option
                      website: 'https://smithstore.com',
                      
                      // Documents
                      gstNumber: '27ABCDE1234F1Z5',
                      panNumber: 'ABCDE1234F',
                      bankAccountNumber: '1234567890123456',
                      ifscCode: 'SBIN0001234',
                      
                      // Categories
                      categories: ['Electronics', 'Mobile & Accessories', 'Men\'s Clothing', 'Women\'s Clothing', 'Shoes & Footwear', 'Accessories', 'Beauty Products', 'Sports & Fitness'],
                      
                      // Terms
                      agreeToTerms: true
                    });
                  }}
                  variant="secondary"
                  size="sm"
                >
                  🧪 Test Fill Form
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="w-6 h-6 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Building className="w-6 h-6 mr-2 text-purple-600" />
                    Business Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your business name"
                      />
                    </div>
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Description *</label>
                      <textarea
                        name="businessDescription"
                        value={formData.businessDescription}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your business and what you sell"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
                      <textarea
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your business address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                      <input
                        type="email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="business@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                    Business Details
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
                      <select
                        id="yearsInBusiness"
                        name="yearsInBusiness"
                        value={formData.yearsInBusiness}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select years</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-2">Number of Employees</label>
                      <select
                        id="numberOfEmployees"
                        name="numberOfEmployees"
                        value={formData.numberOfEmployees}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select employees</option>
                        <option value="1-5">1-5 employees</option>
                        <option value="6-20">6-20 employees</option>
                        <option value="21-50">21-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="200+">200+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue</label>
                      <select
                        id="annualRevenue"
                        name="annualRevenue"
                        value={formData.annualRevenue}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select revenue</option>
                        <option value="0-10L">₹0-10 Lakhs</option>
                        <option value="10L-1Cr">₹10 Lakhs - 1 Crore</option>
                        <option value="1Cr-5Cr">₹1-5 Crores</option>
                        <option value="5Cr-10Cr">₹5-10 Crores</option>
                        <option value="10Cr+">₹10+ Crores</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-2 text-yellow-600" />
                    Product Categories
                  </h3>
                  <p className="text-gray-600 mb-4">Select the categories you want to sell in (you can select multiple)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Legal Documents */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-red-600" />
                    Legal Documents
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="22ABCDE1234F1Z5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="SBIN0001234"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Terms and Conditions</h3>
                  <div className="space-y-4">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> *
                      </span>
                    </label>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="agreeToMarketing"
                        checked={formData.agreeToMarketing}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        I would like to receive marketing communications and updates about new features
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-12 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    We'll review your application and get back to you within 24-48 hours
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-600 text-lg">Our team is here to help you get started</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 mb-2">+91 98765 43210</p>
                <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600 mb-2">sellers@showmyfit.com</p>
                <p className="text-sm text-gray-500">24/7 Support</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <Headphones className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-2">Chat with us</p>
                <p className="text-sm text-gray-500">Instant Support</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BecomeSellerPage;
