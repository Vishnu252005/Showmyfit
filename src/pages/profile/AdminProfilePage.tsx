import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Store, BarChart3, Settings, LogOut, 
  TrendingUp, Eye, Edit, Trash2, CheckCircle, XCircle,
  User, Mail, Phone, MapPin, Calendar, Award, Crown,
  ShoppingBag, Heart, Star, Package, DollarSign, Activity
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface AdminProfilePageProps {
  currentUser: any;
  userData: any;
}

const AdminProfilePage: React.FC<AdminProfilePageProps> = ({ currentUser, userData }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userData?.displayName || currentUser?.displayName || '',
    phone: userData?.phone || '',
    address: userData?.address || ''
  });

  // Real-time data state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    userGrowth: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    loading: true
  });

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Fetch total users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // Fetch active sellers
      const sellersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'shop'),
        where('sellerApplication.status', '==', 'approved')
      );
      const sellersSnapshot = await getDocs(sellersQuery);
      const activeSellers = sellersSnapshot.size;

      // Fetch orders and calculate revenue
      const ordersQuery = query(collection(db, 'orders'));
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Calculate user growth (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentUsers = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt >= thirtyDaysAgo;
      }).length;

      const previousUsers = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
      }).length;

      const userGrowth = previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers) * 100 : 0;

      // Calculate conversion rate (simplified - orders/users)
      const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

      // Calculate average order value
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalUsers,
        activeSellers,
        totalOrders,
        totalRevenue,
        userGrowth: Math.round(userGrowth * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgOrderValue: Math.round(avgOrderValue),
        loading: false
      });

      // Fetch pending approvals
      const pendingSellersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'shop'),
        where('sellerApplication.status', '==', 'pending')
      );
      const pendingSellersSnapshot = await getDocs(pendingSellersQuery);
      const pendingApprovalsData = pendingSellersSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'Seller Registration',
        name: doc.data().businessName || 'Unknown Business',
        email: doc.data().email,
        submitted: doc.data().createdAt?.toDate() || new Date()
      }));
      setPendingApprovals(pendingApprovalsData);

      // Fetch recent activity (simplified - recent orders and user registrations)
      const recentOrdersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
      const recentOrders = recentOrdersSnapshot.docs.map(doc => ({
        action: 'Order completed',
        user: `Order #${doc.id.slice(-4)}`,
        time: doc.data().createdAt?.toDate() || new Date(),
        status: 'completed'
      }));

      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsersData = recentUsersSnapshot.docs.map(doc => ({
        action: 'User registered',
        user: doc.data().email,
        time: doc.data().createdAt?.toDate() || new Date(),
        status: 'completed'
      }));

      setRecentActivity([...recentOrders, ...recentUsersData].sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      ).slice(0, 5));

      // System alerts (simplified - based on data)
      const alerts = [];
      if (totalUsers > 1000) {
        alerts.push({
          alert: 'High user growth detected',
          severity: 'success',
          time: 'Just now'
        });
      }
      if (totalOrders > 100) {
        alerts.push({
          alert: 'High order volume',
          severity: 'info',
          time: '5 minutes ago'
        });
      }
      if (activeSellers < 10) {
        alerts.push({
          alert: 'Low seller count - consider marketing',
          severity: 'warning',
          time: '1 hour ago'
        });
      }
      setSystemAlerts(alerts);

    } catch (error) {
      console.error('Error fetching real-time data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRealTimeData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

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
    try {
      // Update user data in Firestore
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebase/config');
      
      if (currentUser?.uid) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          displayName: editData.displayName,
          phone: editData.phone,
          address: editData.address,
          updatedAt: new Date()
        });
        
        // Update local state
        if (userData) {
          userData.displayName = editData.displayName;
          userData.phone = editData.phone;
          userData.address = editData.address;
        }
        
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
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

  // Handle authentication redirect
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 admin-content">
      <div className="main-content pt-4">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Admin Badge */}
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-red-600" />
                  </div>
                </div>

                {/* Admin Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start mb-2">
                    <Shield className="w-6 h-6 mr-2" />
                    <h1 className="text-3xl font-bold">
                      {currentUser.displayName || 'Admin'}
                    </h1>
                  </div>
                  <p className="text-red-100 text-lg mb-2">{currentUser.email}</p>
                  <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-red-100">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Admin since {new Date(currentUser.metadata.creationTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span>Super Admin</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-white/20 backdrop-blur-lg text-white rounded-lg hover:bg-white/30 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-white/20 backdrop-blur-lg text-white rounded-lg hover:bg-white/30 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Admin Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    {stats.loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                        <div className={`text-xs mt-1 ${stats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}% this month
                        </div>
                      </>
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                    <Store className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    {stats.loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-900">{stats.activeSellers}</div>
                        <div className="text-sm text-gray-600">Active Sellers</div>
                        <div className="text-xs text-green-600 mt-1">Live count</div>
                      </>
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                    <ShoppingBag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    {stats.loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                        <div className="text-xs text-green-600 mt-1">All time</div>
                      </>
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                    <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    {stats.loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{stats.totalRevenue >= 1000000 
                            ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` 
                            : stats.totalRevenue >= 1000 
                            ? `${(stats.totalRevenue / 1000).toFixed(1)}K` 
                            : stats.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Revenue</div>
                        <div className="text-xs text-green-600 mt-1">All time</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Advanced Analytics */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-red-600" />
                    Advanced Analytics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-blue-900">User Growth</h3>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      {stats.loading ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      ) : (
                        <>
                          <div className={`text-2xl font-bold ${stats.userGrowth >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                            {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}%
                          </div>
                          <div className="text-sm text-blue-700">vs last month</div>
                        </>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-green-900">Conversion Rate</h3>
                        <Eye className="w-5 h-5 text-green-600" />
                      </div>
                      {stats.loading ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-green-900">{stats.conversionRate}%</div>
                          <div className="text-sm text-green-700">visitor to customer</div>
                        </>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-purple-900">Avg Order Value</h3>
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      {stats.loading ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-purple-900">₹{stats.avgOrderValue.toLocaleString()}</div>
                          <div className="text-sm text-purple-700">per transaction</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-red-600" />
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/admin/users" className="group">
                      <div className="bg-blue-50 rounded-xl p-4 text-center group-hover:bg-blue-100 transition-colors">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold text-gray-900">User Management</div>
                        <div className="text-sm text-gray-600">Manage Users</div>
                      </div>
                    </Link>
                    <Link to="/admin/sellers" className="group">
                      <div className="bg-green-50 rounded-xl p-4 text-center group-hover:bg-green-100 transition-colors">
                        <Store className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-semibold text-gray-900">Seller Management</div>
                        <div className="text-sm text-gray-600">Manage Sellers</div>
                      </div>
                    </Link>
                    <Link to="/admin/orders" className="group">
                      <div className="bg-purple-50 rounded-xl p-4 text-center group-hover:bg-purple-100 transition-colors">
                        <ShoppingBag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-semibold text-gray-900">Order Management</div>
                        <div className="text-sm text-gray-600">Track Orders</div>
                      </div>
                    </Link>
                    <Link to="/admin/products" className="group">
                      <div className="bg-orange-50 rounded-xl p-4 text-center group-hover:bg-orange-100 transition-colors">
                        <Package className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-semibold text-gray-900">Product Management</div>
                        <div className="text-sm text-gray-600">Manage Products</div>
                      </div>
                    </Link>
                    <Link to="/admin/settings" className="group">
                      <div className="bg-gray-50 rounded-xl p-4 text-center group-hover:bg-gray-100 transition-colors">
                        <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <div className="font-semibold text-gray-900">Settings</div>
                        <div className="text-sm text-gray-600">Platform Settings</div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-2 text-yellow-600" />
                    Pending Approvals ({pendingApprovals.length})
                  </h2>
                  <div className="space-y-4">
                    {pendingApprovals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p>No pending approvals</p>
                      </div>
                    ) : (
                      pendingApprovals.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                            <div>
                              <div className="font-medium text-gray-900">{item.type}</div>
                              <div className="text-sm text-gray-600">{item.name} - {item.email}</div>
                              <div className="text-xs text-gray-500">
                                Submitted {item.submitted ? new Date(item.submitted).toLocaleDateString() : 'Unknown date'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                              Approve
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* System Alerts */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <XCircle className="w-6 h-6 mr-2 text-red-600" />
                    System Alerts ({systemAlerts.length})
                  </h2>
                  <div className="space-y-4">
                    {systemAlerts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p>No system alerts</p>
                      </div>
                    ) : (
                      systemAlerts.map((alert, index) => (
                        <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                          alert.severity === 'error' ? 'bg-red-50 border border-red-200' :
                          alert.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                          alert.severity === 'success' ? 'bg-green-50 border border-green-200' :
                          'bg-blue-50 border border-blue-200'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              alert.severity === 'error' ? 'bg-red-500' :
                              alert.severity === 'warning' ? 'bg-yellow-500' :
                              alert.severity === 'success' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}></div>
                            <div>
                              <div className="font-medium text-gray-900">{alert.alert}</div>
                              <div className="text-sm text-gray-600">{alert.time}</div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600" aria-label="Dismiss alert">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity ({recentActivity.length})</h2>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p>No recent activity</p>
                      </div>
                    ) : (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <div className="font-medium text-gray-900">{activity.action}</div>
                              <div className="text-sm text-gray-600">{activity.user}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {activity.time ? new Date(activity.time).toLocaleString() : 'Unknown time'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          id="displayName"
                          type="text"
                          value={editData.displayName}
                          onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          id="phone"
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                          id="address"
                          value={editData.address}
                          onChange={(e) => setEditData({...editData, address: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} variant="primary" size="sm">
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">{currentUser.displayName || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{userData?.phone || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-900">{userData?.address || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Tools */}
                <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Admin Tools</h3>
                  <div className="space-y-3">
                    <Link to="/admin" className="block">
                      <button className="w-full text-left p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                        <BarChart3 className="w-5 h-5 mr-3 inline" />
                        Admin Dashboard
                      </button>
                    </Link>
                    <Link to="/admin/users" className="block">
                      <button className="w-full text-left p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                        <Users className="w-5 h-5 mr-3 inline" />
                        User Management
                      </button>
                    </Link>
                    <Link to="/admin/sellers" className="block">
                      <button className="w-full text-left p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                        <Store className="w-5 h-5 mr-3 inline" />
                        Seller Management
                      </button>
                    </Link>
                    <Link to="/admin/products" className="block">
                      <button className="w-full text-left p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                        <Package className="w-5 h-5 mr-3 inline" />
                        Product Management
                      </button>
                    </Link>
                    <Link to="/admin/settings" className="block">
                      <button className="w-full text-left p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                        <Settings className="w-5 h-5 mr-3 inline" />
                        System Settings
                      </button>
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

export default AdminProfilePage;
