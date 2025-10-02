import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CategoriesPage from './pages/CategoriesPage';
import ShopDashboard from './pages/seller/ShopDashboard';
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
import UserManagementPage from './pages/user/UserManagementPage';
import OrderManagementPage from './pages/order/OrderManagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HomePageManagement from './pages/admin/HomePageManagement';
import AdminReservedProducts from './components/admin/AdminReservedProducts';
import AboutUsPage from './pages/AboutUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import Navbar from './components/layout/Navbar';
import Button from './components/ui/Button';
import ScrollToTop from './components/layout/ScrollToTop';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Chatbot from './components/common/Chatbot';

// Bottom Navigation Component
const BottomNavigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bottom-nav">
      <div className="flex justify-around items-center py-2">
        <Link
          to="/"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V14C14 13.4477 13.5523 13 13 13H11C10.4477 13 10 13.4477 10 14V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V9Z"/>
              </svg>
            </div>
          </div>
          <span className="text-xs font-medium">Home</span>
          {location.pathname === '/' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
        
        <Link
          to="/browse"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/browse' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 21L21 21"/>
                <path d="M5 21L5 9L12 3L19 9L19 21"/>
                <path d="M9 9L9 21"/>
                <path d="M15 9L15 21"/>
                <path d="M9 21L15 21"/>
              </svg>
            </div>
          </div>
          <span className="text-xs font-medium">Explore</span>
          {location.pathname === '/browse' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
        
        <Link
          to="/cart"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/cart' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 21L12 16L5 21V5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V21Z"/>
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium">Reserved</div>
          </div>
          {location.pathname === '/cart' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
        
        <Link
          to="/categories"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/categories' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="flex flex-col space-y-0.5">
              <div className="w-4 h-0.5 bg-current"></div>
              <div className="w-4 h-0.5 bg-current"></div>
              <div className="w-4 h-0.5 bg-current"></div>
            </div>
          </div>
          <span className="text-xs font-medium">Categories</span>
          {location.pathname === '/categories' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
        
        <Link
          to="/profile"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/profile' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="w-5 h-5">👤</div>
          </div>
          <span className="text-xs font-medium">Account</span>
          {location.pathname === '/profile' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
      </div>
    </nav>
  );
};



const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([
    { id: 1, name: 'Designer Handbag', price: 199.99, image: '👜', store: 'Elite Boutique', inStock: true, category: 'Accessories' },
    { id: 2, name: 'Premium Sneakers', price: 89.99, image: '👟', store: 'Urban Closet', inStock: true, category: 'Shoes' },
    { id: 3, name: 'Silk Scarf', price: 45.99, image: '🧣', store: 'Style Central', inStock: false, category: 'Accessories' },
    { id: 4, name: 'Leather Jacket', price: 299.99, image: '🧥', store: 'Fashion Hub', inStock: true, category: 'Men' },
    { id: 5, name: 'Summer Dress', price: 79.99, image: '👗', store: 'Style Central', inStock: true, category: 'Women' },
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (item: any) => {
    // Mock reserve functionality
    console.log('Added to cart:', item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary-50">
      <Navbar userRole="user" />
      <div className="main-content px-4 py-6 pt-28">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif font-bold text-warm-900 mb-3">Your Favorites</h1>
            <p className="text-warm-600 text-lg">{wishlistItems.length} items saved for later</p>
          </div>
          
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-2xl font-semibold text-warm-900 mb-2">No favorites yet</h2>
              <p className="text-warm-600 mb-6">Start saving items you love</p>
              <Button variant="primary" size="lg">
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg hover-lift border border-warm-100">
                  <div className="aspect-square bg-gradient-to-br from-warm-100 to-warm-200 rounded-xl flex items-center justify-center text-6xl mb-4 relative overflow-hidden">
                    {item.image}
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      ❤️
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-warm-900 mb-2 line-clamp-2">{item.name}</h3>
                    <p className="text-warm-600 mb-3">{item.store}</p>
                    
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <span className="text-2xl font-bold text-warm-800">${item.price}</span>
                      <span className="text-xs bg-warm-100 text-warm-700 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-full"
                        disabled={!item.inStock}
                        onClick={() => addToCart(item)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Reserve
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        item.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {wishlistItems.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <Router>
          <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary-50 font-sans">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/seller/:sellerId" element={<SellerProductsPage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/shop/auth" element={<BecomeSellerPage />} />
            <Route path="/shop/dashboard" element={<ShopDashboard />} />
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
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
          </Routes>
            
            {/* Bottom Navigation - Always Visible */}
            <BottomNavigation />
            
            {/* Chatbot - Always Visible on All Pages */}
            <Chatbot />
          </div>
          </Router>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;