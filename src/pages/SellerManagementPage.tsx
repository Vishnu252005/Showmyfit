import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  documents: {
    gst?: string;
    pan?: string;
    bankAccount?: string;
    ifsc?: string;
  };
  stats: {
    totalProducts: number;
    totalSales: number;
    totalOrders: number;
    rating: number;
  };
}

const SellerManagementPage: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if user is admin
  if (!currentUser || userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You need admin access to manage sellers.</p>
            <Button onClick={() => window.location.href = '/profile'} variant="primary" size="lg">
              Go to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Load sellers
  const loadSellers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading sellers...');
      const sellersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'shop')
      );
      
      console.log('📊 Executing Firestore query...');
      const snapshot = await getDocs(sellersQuery);
      console.log('✅ Query successful, found', snapshot.docs.length, 'sellers');
      
      const sellersData = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        console.log(`📄 Processing seller ${index + 1}:`, {
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status
        });
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.submittedAt?.toDate() || data.createdAt?.toDate() || new Date(),
          stats: {
            totalProducts: data.stats?.totalProducts || 0,
            totalSales: data.stats?.totalSales || 0,
            totalOrders: data.stats?.totalOrders || 0,
            rating: data.stats?.rating || 0
          }
        };
      }) as Seller[];
      
      // Sort by creation date (newest first)
      sellersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('✅ Sellers loaded successfully:', sellersData.length);
      setSellers(sellersData);
    } catch (error: any) {
      console.error('❌ Error loading sellers:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setMessage(`Error loading sellers: ${error.message}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  // Update seller status
  const updateSellerStatus = async (sellerId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'users', sellerId), {
        status,
        reviewedAt: new Date(),
        reviewedBy: currentUser?.email || 'admin',
        updatedAt: new Date()
      });
      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, status } : seller
      ));
      setMessage(`Seller ${status} successfully!`);
      setIsSuccess(true);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating seller status:', error);
      setMessage('Error updating seller status');
      setIsSuccess(false);
    }
  };

  // Filter sellers
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || seller.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-red-600" />
                Seller Management
              </h1>
              <p className="text-gray-600 mt-2">Manage seller accounts and approvals</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{sellers.length}</div>
                <div className="text-sm text-gray-600">Total Sellers</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {sellers.filter(s => s.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-yellow-600">
                  {sellers.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
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

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Search sellers by name, email, or business..."
              />
            </div>
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sellers List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading sellers...</p>
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sellers found</h3>
              <p className="text-gray-600">No sellers match your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                              {seller.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                            <div className="text-sm text-gray-500">{seller.email}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {seller.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{seller.businessName}</div>
                        <div className="text-sm text-gray-500">{seller.businessType}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {seller.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(seller.status)}`}>
                          {getStatusIcon(seller.status)}
                          <span className="ml-1">{seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                            ₹{seller.stats.totalSales.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {seller.stats.totalProducts} products • {seller.stats.totalOrders} orders
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {seller.stats.rating.toFixed(1)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {seller.createdAt.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setSelectedSeller(seller)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {seller.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => updateSellerStatus(seller.id, 'approved')}
                                variant="primary"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => updateSellerStatus(seller.id, 'rejected')}
                                variant="danger"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Seller Details Modal */}
        {selectedSeller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Seller Details</h2>
                  <Button
                    onClick={() => setSelectedSeller(null)}
                    variant="outline"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{selectedSeller.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedSeller.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{selectedSeller.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSeller.status)}`}>
                          {getStatusIcon(selectedSeller.status)}
                          <span className="ml-1">{selectedSeller.status.charAt(0).toUpperCase() + selectedSeller.status.slice(1)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Business Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Name</label>
                        <p className="text-gray-900">{selectedSeller.businessName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Type</label>
                        <p className="text-gray-900">{selectedSeller.businessType}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <p className="text-gray-900">{selectedSeller.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">GST Number</label>
                        <p className="text-gray-900">{selectedSeller.documents.gst || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                        <p className="text-gray-900">{selectedSeller.documents.pan || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                        <p className="text-gray-900">{selectedSeller.documents.bankAccount || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                        <p className="text-gray-900">{selectedSeller.documents.ifsc || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedSeller.stats.totalProducts}</div>
                        <div className="text-sm text-gray-600">Products</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedSeller.stats.totalOrders}</div>
                        <div className="text-sm text-gray-600">Orders</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">₹{selectedSeller.stats.totalSales.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Sales</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedSeller.stats.rating.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedSeller.status === 'pending' && (
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => {
                          updateSellerStatus(selectedSeller.id, 'approved');
                          setSelectedSeller(null);
                        }}
                        variant="primary"
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Seller
                      </Button>
                      <Button
                        onClick={() => {
                          updateSellerStatus(selectedSeller.id, 'rejected');
                          setSelectedSeller(null);
                        }}
                        variant="danger"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Seller
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerManagementPage;
