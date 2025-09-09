"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  loadExistingCart, 
  clearCart, 
  removeFromCart, 
  updateCartLineQuantity, 
  getCartId, 
  addToCart,
  initiateCheckout,
  fetchCartDetails
} from '@/lib/actions/cart';
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import {
  saveCartToStorage,
  loadCartFromStorage,
  clearCartFromStorage
} from '@/lib/cart-storage';
import { initializeCartStorageTest } from '@/lib/cart-storage-test';
import type { CartItem } from './cart';

interface CartContextType {
  cartItems: CartItem[];
  isCartModalOpen: boolean;
  setIsCartModalOpen: (open: boolean) => void;
  addingToCart: Set<string>;
  handleAddToCart: (productId: string, variantId: string, productDetails?: { title: string; price: string; image?: string }) => Promise<void>;
  handleRemoveItem: (variantId: string) => Promise<void>;
  handleUpdateQuantity: (variantId: string, quantity: number) => Promise<void>;
  handleClearCart: () => Promise<void>;
  handleCheckout: () => Promise<void>;
  showConfirmation: boolean;
  purchaseDetails: { orderNumber?: string; email?: string; total?: number };
  setShowConfirmation: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<{ orderNumber?: string; email?: string; total?: number }>({});
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());

  const openUrl = useOpenUrl();

  // Load cart from localStorage first, then sync with remote cart
  useEffect(() => {
    const loadCart = async () => {
      console.log('🔄 Loading cart on mount...');
      
      // Initialize localStorage testing utilities in development
      if (process.env.NODE_ENV === 'development') {
        initializeCartStorageTest();
      }
      
      // First, try to load from localStorage (immediate)
      const localCart = loadCartFromStorage();
      if (localCart.length > 0) {
        console.log('✅ Cart loaded from localStorage with', localCart.length, 'items');
        setCartItems(localCart);
      }
      
      // Then, try to load from remote cart (may overwrite localStorage)
      try {
        const result = await loadExistingCart();
        if (result.success && result.items && result.items.length > 0) {
          console.log('✅ Remote cart loaded with', result.items.length, 'items');
          setCartItems(result.items);
          // Save remote cart to localStorage for future sessions
          saveCartToStorage(result.items);
        } else if (localCart.length === 0) {
          console.log('📋 No cart items found locally or remotely');
        }
      } catch (error) {
        console.warn('⚠️ Failed to load remote cart, using localStorage:', error);
        // If remote fails but we have local data, that's OK
      }
    };
    
    loadCart();
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    if (cartItems.length >= 0) { // Save even empty carts to clear localStorage
      saveCartToStorage(cartItems);
    }
  }, [cartItems]);

  const handleRemoveItem = useCallback(async (variantId: string) => {
    try {
      const cartItem = cartItems.find(item => item.variantId === variantId);
      if (!cartItem) {
        console.error('❌ Cart item not found for variant:', variantId);
        return;
      }

      if (!cartItem.lineId) {
        setCartItems(prev => prev.filter(item => item.variantId !== variantId));
        return;
      }

      const cartId = await getCartId();
      if (!cartId) {
        setCartItems(prev => prev.filter(item => item.variantId !== variantId));
        return;
      }

      const result = await removeFromCart(cartId, [cartItem.lineId]);
      
      if (result.success) {
        setCartItems(prev => prev.filter(item => item.variantId !== variantId));
      } else {
        setCartItems(prev => prev.filter(item => item.variantId !== variantId));
      }
    } catch (error) {
      console.error('❌ Error in handleRemoveItem:', error);
      setCartItems(prev => prev.filter(item => item.variantId !== variantId));
    }
  }, [cartItems]);

  const handleUpdateQuantity = useCallback(async (variantId: string, quantity: number) => {
    try {
      const cartItem = cartItems.find(item => item.variantId === variantId);
      if (!cartItem) return;

      if (quantity === 0) {
        await handleRemoveItem(variantId);
        return;
      }

      if (!cartItem.lineId) {
        setCartItems(prev =>
          prev.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
        );
        return;
      }

      const cartId = await getCartId();
      if (!cartId) {
        setCartItems(prev =>
          prev.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
        );
        return;
      }

      await updateCartLineQuantity(cartId, cartItem.lineId, quantity);
      
      setCartItems(prev =>
        prev.map(item =>
          item.variantId === variantId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('❌ Error in handleUpdateQuantity:', error);
      setCartItems(prev =>
        prev.map(item =>
          item.variantId === variantId ? { ...item, quantity } : item
        )
      );
    }
  }, [cartItems, handleRemoveItem]);

  const handleAddToCart = useCallback(async (productId: string, variantId: string, productDetails?: { title: string; price: string; image?: string }) => {
    if (addingToCart.has(variantId)) return;
    
    setAddingToCart(prev => new Set(prev).add(variantId));
    
    try {
      const existingItem = cartItems.find(item => item.variantId === variantId);
      
      if (existingItem) {
        await handleUpdateQuantity(variantId, existingItem.quantity + 1);
        return;
      }
      
      const productToAdd = {
        productId,
        variantId,
        title: productDetails?.title || "Sample Product",
        price: productDetails?.price || "29.99",
        quantity: 1,
        image: productDetails?.image,
      };

      const cartId = await getCartId();
      
      if (cartId) {
        const result = await addToCart(cartId, [{ variantId, quantity: 1 }]);
        
        if (result.success) {
          const loadResult = await loadExistingCart();
          if (loadResult.success && loadResult.items) {
            setCartItems(loadResult.items);
          }
        } else {
          setCartItems(prev => [...prev, productToAdd]);
        }
      } else {
        setCartItems(prev => [...prev, productToAdd]);
      }
      
    } catch (error) {
      console.error('❌ Error in handleAddToCart:', error);
      
      const productToAdd = {
        productId,
        variantId,
        title: productDetails?.title || "Sample Product",
        price: productDetails?.price || "29.99",
        quantity: 1,
        image: productDetails?.image,
      };
      
      setCartItems(prev => {
        const existingItem = prev.find(item => item.variantId === variantId);
        if (existingItem) {
          return prev.map(item =>
            item.variantId === variantId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, productToAdd];
      });
    } finally {
      setTimeout(() => {
        setAddingToCart(prev => {
          const newSet = new Set(prev);
          newSet.delete(variantId);
          return newSet;
        });
      }, 500);
    }
  }, [cartItems, handleUpdateQuantity, addingToCart]);

  const handleClearCart = useCallback(async () => {
    try {
      await clearCart();
      setCartItems([]);
      clearCartFromStorage(); // Also clear localStorage
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      setCartItems([]);
      clearCartFromStorage(); // Clear localStorage even if remote clear failed
    }
  }, []);

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;
    
    try {
      const checkoutItems = cartItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        title: item.title,
        price: item.price
      }));
      
      const cartId = await getCartId();
      
      if (!cartId) {
        const result = await initiateCheckout(checkoutItems);
        
        if (result.success && result.checkoutUrl) {
          // Calculate total before clearing cart
          const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
          
          // Clear the cart immediately after successful checkout
          await handleClearCart();
          
          openUrl(result.checkoutUrl);
          
          setPurchaseDetails({ total });
          setShowConfirmation(true);
          setTimeout(() => setShowConfirmation(false), 5000);
        } else {
          alert(`Checkout Error: ${result.error}\\n\\nPlease try again.`);
        }
        return;
      }
      
      const cartDetails = await fetchCartDetails(cartId);
      
      if (!cartDetails.success || !cartDetails.cart) {
        const result = await initiateCheckout(checkoutItems);
        
        if (result.success && result.checkoutUrl) {
          // Calculate total before clearing cart
          const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
          
          // Clear the cart immediately after successful checkout
          await handleClearCart();
          
          openUrl(result.checkoutUrl);
          
          setPurchaseDetails({ total });
          setShowConfirmation(true);
          setTimeout(() => setShowConfirmation(false), 5000);
        } else {
          alert(`Checkout Error: ${result.error}\\n\\nPlease try again.`);
        }
        return;
      }
      
      const checkoutUrl = cartDetails.cart.checkoutUrl;
      
      // Calculate total before clearing cart
      const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      
      // Clear the cart immediately after successful checkout
      await handleClearCart();
      
      openUrl(checkoutUrl);
      
      setPurchaseDetails({ total });
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 5000);
      
    } catch (error) {
      console.error('❌ Checkout exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Checkout Failed: ${errorMessage}\\n\\nCheck console for details and try again.`);
    }
  }, [cartItems, openUrl, handleClearCart]);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartModalOpen,
      setIsCartModalOpen,
      addingToCart,
      handleAddToCart,
      handleRemoveItem,
      handleUpdateQuantity,
      handleClearCart,
      handleCheckout,
      showConfirmation,
      purchaseDetails,
      setShowConfirmation,
    }}>
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
