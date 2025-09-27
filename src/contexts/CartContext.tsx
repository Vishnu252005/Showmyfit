import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  quantity: number;
  size?: string;
  color?: string;
  sellerId?: string;
  sellerName?: string;
  addedAt: Date;
  category?: string;
}

export interface LastAddedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  lastAddedProducts: LastAddedProduct[];
  addToCart: (product: Omit<CartItem, 'addedAt' | 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  moveToWishlist: (item: CartItem) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isAddingToCart: boolean;
  showAddNotification: boolean;
  setShowAddNotification: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAddedProducts, setLastAddedProducts] = useState<LastAddedProduct[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const { currentUser } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedLastAdded = localStorage.getItem('lastAddedProducts');
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart).map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    
    if (savedLastAdded) {
      try {
        const parsedLastAdded = JSON.parse(savedLastAdded).map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setLastAddedProducts(parsedLastAdded);
      } catch (error) {
        console.error('Error loading last added products from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save last added products to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lastAddedProducts', JSON.stringify(lastAddedProducts));
  }, [lastAddedProducts]);

  const addToCart = (product: Omit<CartItem, 'addedAt' | 'quantity'>) => {
    setIsAddingToCart(true);
    
    // Show notification
    setShowAddNotification(true);
    setTimeout(() => setShowAddNotification(false), 3000);

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        // Update last added products
        setLastAddedProducts(prev => [
          { ...product, addedAt: new Date(), quantity: existingItem.quantity + 1 },
          ...prev.slice(0, 4) // Keep only last 5 products
        ]);
        
        return updatedItems;
      } else {
        // Add new item
        const newItem = { ...product, addedAt: new Date(), quantity: 1 };
        
        // Update last added products
        setLastAddedProducts(prev => [
          { ...product, addedAt: new Date(), quantity: 1 },
          ...prev.slice(0, 4) // Keep only last 5 products
        ]);
        
        return [...prevItems, newItem];
      }
    });

    // Reset adding state after animation
    setTimeout(() => setIsAddingToCart(false), 500);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const moveToWishlist = (item: CartItem) => {
    // TODO: Implement wishlist functionality
    console.log('Moving to wishlist:', item);
    removeFromCart(item.id);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    lastAddedProducts,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    moveToWishlist,
    getCartTotal,
    getCartItemCount,
    isAddingToCart,
    showAddNotification,
    setShowAddNotification
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
