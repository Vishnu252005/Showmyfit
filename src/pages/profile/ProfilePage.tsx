import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit, LogOut, ShoppingBag, Heart, Star, Settings, ArrowLeft, Calendar, Award, Package, Clock, XCircle, CheckCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/common/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, getSellerApplicationStatus } from '../../firebase/auth';
import AdminProfilePage from './AdminProfilePage';
import SellerProfilePage from './SellerProfilePage';

const ProfilePage: React.FC = () => {
  const { currentUser, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userData?.displayName || currentUser?.displayName || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    profilePicture: userData?.profilePicture || ''
  });
  const [applicationStatus, setApplicationStatus] = useState<'not_applied' | 'pending' | 'approved' | 'rejected'>('not_applied');
  const [showProfilePicUpload, setShowProfilePicUpload] = useState(false);



  // Check application status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      if (currentUser) {
        try {
          const status = await getSellerApplicationStatus(currentUser.uid);
          setApplicationStatus(status);
        } catch (error) {
          console.error('Error checking application status:', error);
        }
      }
    };
    
    checkStatus();
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
      profilePicture: userData?.profilePicture || ''
    });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    try {
      await updateUserProfile(currentUser.uid, editData);
      setIsEditing(false);
      // The userData will be updated automatically through the AuthContext
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

  // Show loading or redirect if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show admin profile if user is admin
  if (userData?.role === 'admin') {
    return <AdminProfilePage currentUser={currentUser} userData={userData} />;
  }

  // Show seller profile if user is seller
  if (userData?.role === 'shop') {
    return <SellerProfilePage currentUser={currentUser} userData={userData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar userRole="user" />
      
      <div className="main-content pt-24">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-4xl mx-auto">
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

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  {editData.profilePicture ? (
                    <img 
                      src={editData.profilePicture} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button 
                    onClick={() => setShowProfilePicUpload(!showProfilePicUpload)}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    title="Edit profile picture"
                    aria-label="Edit profile picture"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentUser.displayName || 'User'}
                  </h1>
                  <p className="text-gray-600 text-lg mb-2">{currentUser.email}</p>
                  <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Member since {new Date(currentUser.metadata.creationTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span>Verified User</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Picture Upload Modal */}
            {showProfilePicUpload && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
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

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    <button
                      onClick={handleEdit}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      title="Edit personal information"
                      aria-label="Edit personal information"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editData.displayName}
                          onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                          aria-label="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                          value={editData.address}
                          onChange={(e) => setEditData({...editData, address: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your address"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button onClick={handleSave} variant="primary" size="md">
                          Save Changes
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="md">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">{currentUser.displayName || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{userData?.phone || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-900">{userData?.address || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Activity</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">Orders</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">0</div>
                      <div className="text-sm text-gray-600">Favorites</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-xl">
                      <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">0</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Items</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <Settings className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Account Settings</div>
                        <div className="text-sm text-gray-600">Manage your account</div>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Email Preferences</div>
                        <div className="text-sm text-gray-600">Notification settings</div>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                      <Package className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Order History</div>
                        <div className="text-sm text-gray-600">View your orders</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to="/cart" className="block">
                      <button className="w-full text-left p-3 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors">
                        <ShoppingBag className="w-5 h-5 mr-3 inline" />
                        View Cart
                      </button>
                    </Link>
                    <Link to="/wishlist" className="block">
                      <button className="w-full text-left p-3 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors">
                        <Heart className="w-5 h-5 mr-3 inline" />
                        My Wishlist
                      </button>
                    </Link>
                    {/* Dynamic Seller Button based on application status */}
                    {applicationStatus === 'not_applied' && (
                      <Link to="/shop/auth" className="block">
                        <button className="w-full text-left p-3 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors">
                          <Package className="w-5 h-5 mr-3 inline" />
                          Become a Seller
                        </button>
                      </Link>
                    )}
                    
                    {applicationStatus === 'pending' && (
                      <div className="w-full text-left p-3 rounded-lg bg-yellow-500 bg-opacity-20 text-yellow-100">
                        <Clock className="w-5 h-5 mr-3 inline" />
                        Application Pending
                        <div className="text-xs mt-1 text-yellow-200">Under review</div>
                      </div>
                    )}
                    
                    {applicationStatus === 'approved' && (
                      <Link to="/profile" className="block">
                        <button className="w-full text-left p-3 rounded-lg bg-green-500 bg-opacity-20 text-green-100 hover:bg-opacity-30 transition-colors">
                          <CheckCircle className="w-5 h-5 mr-3 inline" />
                          Seller Dashboard
                          <div className="text-xs mt-1 text-green-200">Approved!</div>
                        </button>
                      </Link>
                    )}
                    
                    {applicationStatus === 'rejected' && (
                      <Link to="/shop/auth" className="block">
                        <button className="w-full text-left p-3 rounded-lg bg-red-500 bg-opacity-20 text-red-100 hover:bg-opacity-30 transition-colors">
                          <XCircle className="w-5 h-5 mr-3 inline" />
                          Apply Again
                          <div className="text-xs mt-1 text-red-200">Application rejected</div>
                        </button>
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
