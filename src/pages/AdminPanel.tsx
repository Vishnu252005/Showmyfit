import React, { useState } from 'react';
import { Users, Package, CheckCircle, XCircle, BarChart3, Store, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import ShopCard from '../components/ShopCard';
import Button from '../components/Button';
import StatsCard from '../components/StatsCard';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const AdminPanel: React.FC = () => {
  const { state, approveShop } = useApp();
  const [activeTab, setActiveTab] = useState('shops');
  const { toasts, removeToast, success } = useToast();

  const pendingShops = state.shops.filter(shop => !shop.approved);
  const approvedShops = state.shops.filter(shop => shop.approved);
  const totalProducts = state.products.length;
  const totalRevenue = state.products.reduce((sum, product) => sum + product.price, 0);

  const handleApprove = (shopId: string) => {
    approveShop(shopId);
    success('Shop approved successfully!');
  };

  const getShopProductCount = (shopId: string) => {
    return state.products.filter(p => p.shopId === shopId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="admin" />
      
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Shops"
            value={state.shops.length}
            icon={Store}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Approved Shops"
            value={approvedShops.length}
            icon={CheckCircle}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Pending Approval"
            value={pendingShops.length}
            icon={XCircle}
            color="yellow"
          />
          <StatsCard
            title="Total Products"
            value={totalProducts}
            icon={Package}
            color="purple"
            trend={{ value: 25, isPositive: true }}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('shops')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shops'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Shop Management
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'shops' && (
              <div>
                {/* Pending Approvals */}
                {pendingShops.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                    <div className="grid gap-4">
                      {pendingShops.map(shop => (
                        <div key={shop.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{shop.name}</h4>
                              <p className="text-gray-600 mb-1">{shop.address}</p>
                              <p className="text-gray-600 mb-2">{shop.contact}</p>
                              <p className="text-xs text-gray-500">
                                Applied: {shop.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="secondary"
                              icon={CheckCircle}
                              onClick={() => handleApprove(shop.id)}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Shops */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Approved Shops</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {approvedShops.map(shop => (
                      <ShopCard
                        key={shop.id}
                        shop={shop}
                        productCount={getShopProductCount(shop.id)}
                      />
                    ))}
                  </div>
                </div>

                {state.shops.length === 0 && (
                  <EmptyState
                    icon={Store}
                    title="No shops yet"
                    description="Shops will appear here once they register"
                  />
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Analytics</h3>
                
                {/* Revenue Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <StatsCard
                    title="Total Platform Value"
                    value={`$${totalRevenue.toFixed(2)}`}
                    icon={TrendingUp}
                    color="green"
                    trend={{ value: 15, isPositive: true }}
                  />
                  <StatsCard
                    title="Avg Product Price"
                    value={`$${totalProducts > 0 ? (totalRevenue / totalProducts).toFixed(2) : '0.00'}`}
                    icon={Package}
                    color="blue"
                  />
                  <StatsCard
                    title="Active Categories"
                    value={new Set(state.products.map(p => p.category)).size}
                    icon={BarChart3}
                    color="purple"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Category Distribution */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Products by Category</h4>
                    <div className="space-y-3">
                      {['Electronics', 'Groceries', 'Clothing', 'Books', 'Other'].map(category => {
                        const count = state.products.filter(p => p.category === category).length;
                        const percentage = totalProducts > 0 ? (count / totalProducts * 100) : 0;
                        
                        return (
                          <div key={category}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{category}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      {[...state.shops, ...state.products]
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                        .slice(0, 5)
                        .map((item, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="text-gray-700 flex-1">
                              {'contact' in item 
                                ? `Shop "${item.name}" registered`
                                : `Product "${item.name}" added`
                              }
                            </span>
                            <span className="text-gray-500 text-xs">
                              {item.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;