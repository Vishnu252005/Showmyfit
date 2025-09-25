import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit, LogOut, ShoppingBag, Heart, Star, Settings, ArrowLeft, Calendar, Award, Package, Shield, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebase/auth';
import AdminProfilePage from './AdminProfilePage';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProfilePage: React.FC = () => {
  const { currentUser, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userData?.displayName || currentUser?.displayName || '',
    phone: userData?.phone || '',
    address: userData?.address || ''
  });
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Fetch admin emails from user profile
  const fetchAdminEmails = async () => {
    setLoadingAdmins(true);
    try {
      console.log('ProfilePage - UserData:', userData);
      console.log('ProfilePage - AdminEmails:', userData?.adminEmails);
      
      if (userData?.adminEmails) {
        setAdminEmails(userData.adminEmails);
        console.log('ProfilePage - Set admin emails:', userData.adminEmails);
      } else {
        setAdminEmails([]);
        console.log('ProfilePage - No admin emails found');
      }
    } catch (error) {
      console.error('Error fetching admin emails:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchAdminEmails();
  }, [userData]);

  // Show admin profile if user is admin
  if (userData?.role === 'admin') {
    return <AdminProfilePage />;
  }

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
      address: userData?.address || ''
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
      address: userData?.address || ''
    });
  };

  if (!currentUser) {
    // Redirect to auth page instead of showing "Please Sign In"
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar userRole="user" />
      
      <div className="main-content pt-16">
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
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
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
                    <Link to="/shop/auth" className="block">
                      <button className="w-full text-left p-3 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors">
                        <Package className="w-5 h-5 mr-3 inline" />
                        Become a Seller
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Admin Emails Check */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-600" />
                    Admin Emails Available
                  </h3>
                  
                  {loadingAdmins ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading admin emails...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminEmails.length > 0 ? (
                        <>
                          <p className="text-sm text-gray-600 mb-3">
                            Found {adminEmails.length} admin email(s) in your profile:
                          </p>
                          <div className="text-xs text-gray-500 mb-2">
                            Debug: UserData.adminEmails = {JSON.stringify(userData?.adminEmails)}
                          </div>
                          <div className="space-y-2">
                            {adminEmails.map((email, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="font-medium text-gray-900">{email}</span>
                                </div>
                                <div className="flex items-center">
                                  {currentUser?.email === email ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      Your Email
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Note:</strong> If your email is listed above, you should see the admin profile interface. 
                              If not, contact the system administrator.
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No admin emails found in the system.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-2">
                    <Button
                      onClick={fetchAdminEmails}
                      variant="outline"
                      size="sm"
                      disabled={loadingAdmins}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Link to="/admin/test">
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Test Admin
                      </Button>
                    </Link>
                    <Link to="/admin/manage">
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Manage Admins
                      </Button>
                    </Link>
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
