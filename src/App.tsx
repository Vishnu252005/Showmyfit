import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import AppLayout from './components/layout/AppLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { initializePerformanceMonitoring, reportBundleSize } from './utils/performanceMonitoring';

// Critical pages - load immediately
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/product/ProductDetailPage';

// Lazy load non-critical pages for better performance
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const ShopDashboard = lazy(() => import('./pages/seller/ShopDashboard'));
const SellerDashboard = lazy(() => import('./components/seller/SellerDashboard'));
const AuthPage = lazy(() => import('./pages/auth/AuthPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const BecomeSellerPage = lazy(() => import('./pages/seller/BecomeSellerPage'));
const SellerProductsPage = lazy(() => import('./pages/seller/SellerProductsPage'));
const AdminSetupPage = lazy(() => import('./pages/admin/AdminSetupPage'));
const FixAdminEmailPage = lazy(() => import('./pages/admin/FixAdminEmailPage'));
const AdminTestPage = lazy(() => import('./pages/admin/AdminTestPage'));
const DebugAdminPage = lazy(() => import('./pages/admin/DebugAdminPage'));
const CreateUserPage = lazy(() => import('./pages/user/CreateUserPage'));
const ManageAdminsPage = lazy(() => import('./pages/admin/ManageAdminsPage'));
const ProductManagementPage = lazy(() => import('./pages/product/ProductManagementPage'));
const SellerManagementPage = lazy(() => import('./pages/seller/SellerManagementPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const UserManagementPage = lazy(() => import('./pages/user/UserManagementPage'));
const OrderManagementPage = lazy(() => import('./pages/order/OrderManagementPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const HomePageManagement = lazy(() => import('./pages/admin/HomePageManagement'));
const AdminReservedProducts = lazy(() => import('./components/admin/AdminReservedProducts'));
const ImageMigrationPage = lazy(() => import('./pages/admin/ImageMigrationPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-purple-600 font-medium">Loading...</p>
    </div>
  </div>
);



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
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<HomePage />} />
                      <Route path="browse" element={<SearchPage />} />
                      <Route path="search" element={<SearchPage />} />
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
                    <Route path="/admin/image-migration" element={<ImageMigrationPage />} />
                  </Routes>
                </Suspense>
            
                {/* Chatbot - Hidden for now */}
                {/* <Chatbot /> */}
              </Router>
            </WishlistProvider>
          </ErrorBoundary>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;