import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const price = item.product.discount_price || item.product.price;
    return total + price * item.quantity;
  }, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        // Add new item
        const newItems = [...state.items, { product, quantity }];
        
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems)
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.product.id !== action.payload.productId);
      
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } });
      }
      
      const updatedItems = state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };
      
    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  total: 0
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cart, dispatch] = useReducer(cartReducer, initialState, () => {
    const savedCart = localStorage.getItem('phytronix-cart');
    return savedCart ? JSON.parse(savedCart) : initialState;
  });
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('phytronix-cart', JSON.stringify(cart));
  }, [cart]);
  
  const addToCart = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };
  
  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};