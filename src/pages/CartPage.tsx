import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, Minus, Plus, Trash2, ArrowLeft, 
  CreditCard, Truck, Shield, Heart, Clock, Package
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useCart } from '../contexts/CartContext';
import CartNotification from '../components/common/CartNotification';

const CartPage: React.FC = () => {
  const {
    cartItems,
    lastAddedProducts,
    updateQuantity,
    removeFromCart,
    moveToWishlist,
    getCartTotal,
    getCartItemCount,
    showAddNotification,
    setShowAddNotification
  } = useCart();

  const [showLastAdded, setShowLastAdded] = useState(false);

  // Show last added products section if there are any
  useEffect(() => {
    setShowLastAdded(lastAddedProducts.length > 0);
  }, [lastAddedProducts]);

  const subtotal = getCartTotal();
  const discount = cartItems.reduce((sum, item) => sum + ((item.originalPrice || 0) - (item.price || 0)) * item.quantity, 0);
  const shipping = subtotal > 50000 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar userRole="user" />
      
      {/* Cart Notification */}
      {showAddNotification && lastAddedProducts.length > 0 && (
        <CartNotification
          show={showAddNotification}
          onClose={() => setShowAddNotification(false)}
          productName={lastAddedProducts[0].name}
          productImage={lastAddedProducts[0].image}
          quantity={lastAddedProducts[0].quantity}
        />
      )}
      
      <div className="main-content pt-24 pb-24">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reserved Items</h1>
                <p className="text-gray-600">{getCartItemCount()} item(s) reserved</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-blue-600">
              <Bookmark className="w-6 h-6" />
              <span className="font-medium">Reserved</span>
            </div>
          </div>

          {/* Last Added Products Section */}
          {showLastAdded && lastAddedProducts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Recently Reserved</h3>
              </div>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {lastAddedProducts.slice(0, 5).map((product, index) => (
                  <div key={`${product.id}-${index}`} className="flex-shrink-0 bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                    <div className="flex items-center space-x-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          ₹{(product.price || 0).toLocaleString()} • Qty: {product.quantity}
                        </p>
                        <p className="text-xs text-blue-600">
                          {new Date(product.addedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reserved items</h3>
              <p className="text-gray-600 mb-8">Looks like you haven't reserved any items yet.</p>
              <Link
                to="/"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Browsing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h3>
                        <p className="text-gray-600 mb-2">{item.brand}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>Size: {item.size}</span>
                          <span>Color: {item.color}</span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveToWishlist(item)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Move to Wishlist"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ₹{(item.price || 0).toLocaleString()}
                        </div>
                        {item.originalPrice && item.originalPrice > (item.price || 0) && (
                          <div className="text-sm text-gray-500 line-through">
                            ₹{(item.originalPrice || 0).toLocaleString()}
                          </div>
                        )}
                        {item.quantity > 1 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Total: ₹{((item.price || 0) * item.quantity).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>₹{(subtotal || 0).toLocaleString()}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{(discount || 0).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>₹{(total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors mb-4">
                    Proceed to Checkout
                  </button>

                  {/* Security Badges */}
                  <div className="flex items-center justify-center space-x-6 text-gray-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4" />
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CreditCard className="w-4 h-4" />
                      <span>Easy Returns</span>
                    </div>
                  </div>

                  {/* Continue Shopping */}
                  <div className="text-center mt-6">
                    <Link
                      to="/"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
