import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../lib/database';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getCartMessage: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('store_cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (cartItems: CartItem[]) => {
    setItems(cartItems);
    localStorage.setItem('store_cart', JSON.stringify(cartItems));
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      const updatedItems = items.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item
      );
      saveCart(updatedItems);
    } else {
      saveCart([...items, { product, quantity: Math.min(quantity, product.stock) }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedItems = items.filter(item => item.product.id !== productId);
    saveCart(updatedItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedItems = items.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(quantity, item.product.stock) }
        : item
    );
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartMessage = () => {
    if (items.length === 0) return '';

    const itemsList = items.map(item => 
      `- ${item.quantity}x ${item.product.name} – ${item.product.price * item.quantity} MAD`
    ).join('\n');

    const total = getTotalPrice();

    return `Bonjour, j'aimerais commander:\n${itemsList}\n\nTotal: ${total} MAD\n\nNom: _____\nAdresse: _____\nTéléphone: _____`;
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      getCartMessage
    }}>
      {children}
    </CartContext.Provider>
  );
};