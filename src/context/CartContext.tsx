"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getHandoverURL: () => string;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  
  // Shipping info
  freeShippingThreshold: number;
  isFreeShipping: boolean;
  remainingForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('imbra_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error cargando carrito:", e);
      }
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('imbra_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setSidebarOpen(true); // ← abre sidebar automáticamente
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
  
  const freeShippingThreshold = 50000;
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

  const getHandoverURL = () => {
    const wooUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "";
    if (items.length === 0) return `${wooUrl}/checkout/`;
    const itemsParam = items.map(item => `${item.product.id}:${item.quantity}`).join(',');
    return `${wooUrl}/checkout/?saprix_handover=1&items=${itemsParam}`;
  };

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice, getHandoverURL,
      sidebarOpen, openSidebar: () => setSidebarOpen(true), closeSidebar: () => setSidebarOpen(false),
      freeShippingThreshold, isFreeShipping, remainingForFreeShipping
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart debe ser usado dentro de un CartProvider');
  return context;
};
