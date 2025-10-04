import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CategoriesPage from './pages/CategoriesPage';
import ShopDashboard from './pages/seller/ShopDashboard';
import SellerDashboard from './components/seller/SellerDashboard';
import AuthPage from './pages/auth/AuthPage';
import ProfilePage from './pages/profile/ProfilePage';
import BecomeSellerPage from './pages/seller/BecomeSellerPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import CartPage from './pages/CartPage';
import AdminSetupPage from './pages/admin/AdminSetupPage';
import FixAdminEmailPage from './pages/admin/FixAdminEmailPage';
import AdminTestPage from './pages/admin/AdminTestPage';
import DebugAdminPage from './pages/admin/DebugAdminPage';
import CreateUserPage from './pages/user/CreateUserPage';
import ManageAdminsPage from './pages/admin/ManageAdminsPage';
import ProductManagementPage from './pages/product/ProductManagementPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import SellerManagementPage from './pages/seller/SellerManagementPage';
import WishlistPage from './pages/WishlistPage';
import UserManagementPage from './pages/user/UserManagementPage';
import OrderManagementPage from './pages/order/OrderManagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HomePageManagement from './pages/admin/HomePageManagement';
import AdminReservedProducts from './components/admin/AdminReservedProducts';
import AboutUsPage from './pages/AboutUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AppLayout from './components/layout/AppLayout';
import Button from './components/ui/Button';
import ScrollToTop from './components/layout/ScrollToTop';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Chatbot from './components/common/Chatbot';
import ErrorBoundary from './components/common/ErrorBoundary';
import { initializePerformanceMonitoring, reportBundleSize } from './utils/performanceMonitoring';



function App() {
  // Initialize performance monitoring
  useEffect(() => {
    const performanceMonitor = initializePerformanceMonitoring();
    
    // Report bundle size after initial load
    setTimeout(() => {
      reportBundleSize();
    }, 2000);
    
    // Cleanup on unmount
    return () => {
      performanceMonitor.cleanup();
    };
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <ErrorBoundary>
            <WishlistProvider>
              <Router>
                <ScrollToTop />
                <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="browse" element={<SearchPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="seller/:sellerId" element={<SellerProductsPage />} />
                <Route path="product/:productId" element={<ProductDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="about" element={<AboutUsPage />} />
                <Route path="privacy" element={<PrivacyPolicyPage />} />
                <Route path="terms" element={<TermsOfServicePage />} />
                <Route path="homepage-management" element={<HomePageManagement />} />
                <Route path="admin/reserved-products" element={<AdminReservedProducts />} />
              </Route>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/shop/auth" element={<BecomeSellerPage />} />
              <Route path="/shop/dashboard" element={<ShopDashboard />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/setup" element={<AdminSetupPage />} />
              <Route path="/admin/fix-email" element={<FixAdminEmailPage />} />
              <Route path="/admin/test" element={<AdminTestPage />} />
              <Route path="/admin/debug" element={<DebugAdminPage />} />
              <Route path="/admin/create-user" element={<CreateUserPage />} />
              <Route path="/admin/manage" element={<ManageAdminsPage />} />
              <Route path="/admin/products" element={<ProductManagementPage />} />
              <Route path="/admin/sellers" element={<SellerManagementPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/orders" element={<OrderManagementPage />} />
              <Route path="/admin/homepage" element={<HomePageManagement />} />
              <Route path="/admin/reserved-products" element={<AdminReservedProducts />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Routes>
            
                {/* Chatbot - Always Visible on All Pages */}
                <Chatbot />
              </Router>
            </WishlistProvider>
          </ErrorBoundary>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;