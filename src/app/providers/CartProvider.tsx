'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, GeneratedCart, HouseholdProfile } from '@/types/index';
import cuid from 'cuid';

interface CartContextType {
  items: CartItem[];
  cart: GeneratedCart | null;
  intentLabels: string[];
  lastDescription: string;
  userId: string | null;
  householdProfile: HouseholdProfile | null;
  journeyStartTime: number | null;

  // Actions
  setCart: (cart: GeneratedCart) => void;
  setItems: (items: CartItem[]) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  swapItem: (id: string, newName: string, newPrice: number) => void;
  clearCart: () => void;
  setIntentLabels: (labels: string[]) => void;
  setLastDescription: (desc: string) => void;
  setUserId: (id: string) => void;
  setHouseholdProfile: (profile: HouseholdProfile) => void;
  setJourneyStartTime: (ts: number) => void;
  computeTotal: () => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<CartItem[]>([]);
  const [cart, setCartState] = useState<GeneratedCart | null>(null);
  const [intentLabels, setIntentLabelsState] = useState<string[]>([]);
  const [lastDescription, setLastDescriptionState] = useState('');
  const [userId, setUserIdState] = useState<string | null>(null);
  const [householdProfile, setHouseholdProfileState] = useState<HouseholdProfile | null>(null);
  const [journeyStartTime, setJourneyStartTimeState] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('swiftcart_user_id');
    if (stored) setUserIdState(stored);

    const storedProfile = localStorage.getItem('swiftcart_household_profile');
    if (storedProfile) {
      try { setHouseholdProfileState(JSON.parse(storedProfile)); } catch {}
    }
  }, []);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    setItemsState(prev => [...prev, { ...item, id: cuid() }]);
  };

  const removeItem = (id: string) => {
    setItemsState(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItemsState(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const swapItem = (id: string, newName: string, newPrice: number) => {
    setItemsState(prev => prev.map(i => i.id === id ? { ...i, productName: newName, estimatedPrice: newPrice } : i));
  };

  const clearCart = () => {
    setItemsState([]);
    setCartState(null);
    setIntentLabelsState([]);
    setLastDescriptionState('');
    setJourneyStartTimeState(null);
  };

  const setUserId = (id: string) => {
    setUserIdState(id);
    localStorage.setItem('swiftcart_user_id', id);
  };

  const setHouseholdProfile = (profile: HouseholdProfile) => {
    setHouseholdProfileState(profile);
    localStorage.setItem('swiftcart_household_profile', JSON.stringify(profile));
  };

  const computeTotal = () => items.reduce((sum, i) => sum + i.estimatedPrice * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      cart,
      intentLabels,
      lastDescription,
      userId,
      householdProfile,
      journeyStartTime,
      setCart: setCartState,
      setItems: setItemsState,
      addItem,
      removeItem,
      updateQuantity,
      swapItem,
      clearCart,
      setIntentLabels: setIntentLabelsState,
      setLastDescription: setLastDescriptionState,
      setUserId,
      setHouseholdProfile,
      setJourneyStartTime: setJourneyStartTimeState,
      computeTotal,
      itemCount: items.length,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
