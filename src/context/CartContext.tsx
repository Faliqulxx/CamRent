'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  pricePerDay: number;
  image: string;
  quantity: number;
  maxAvailable?: number;
}

interface CartContextType {
  items: CartItem[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  rentalDays: number;
  subtotal: number;
  totalItemsCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setDateRange: (start: string, end: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const tomorrow = addDays(new Date(), 1);
  const threeDaysAfter = addDays(tomorrow, 2);

  const [startDate, setStartDate] = useState<string>(() => format(tomorrow, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(() => format(threeDaysAfter, 'yyyy-MM-dd'));
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('camprent_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.items) setItems(parsed.items);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
      }
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(
        'camprent_cart',
        JSON.stringify({ items, startDate, endDate })
      );
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items, startDate, endDate, isMounted]);

  const days = Math.max(1, differenceInDays(parseISO(endDate), parseISO(startDate)) || 1);

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qtyToAdd = newItem.quantity || 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === newItem.productId);
      if (existing) {
        const newQty = existing.quantity + qtyToAdd;
        return prev.map((i) =>
          i.productId === newItem.productId ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { ...newItem, quantity: qtyToAdd }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.pricePerDay * item.quantity * days,
    0
  );

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        startDate,
        endDate,
        rentalDays: days,
        subtotal,
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setDateRange,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
