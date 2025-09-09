/**
 * Cart localStorage utility
 * Handles saving and loading cart data with proper error handling and SSR safety
 */

import type { CartItem } from '@/app/components/cart';

const CART_STORAGE_KEY = 'baseappshop_cart';

/**
 * Check if localStorage is available
 * Returns false during SSR or if localStorage is not supported
 */
function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
  } catch {
    return false;
  }
}

/**
 * Save cart items to localStorage
 */
export function saveCartToStorage(cartItems: CartItem[]): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const cartData = {
      items: cartItems,
      timestamp: Date.now(), // For potential cache invalidation
      version: '1.0' // For future migration compatibility
    };
    
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    console.log('💾 Cart saved to localStorage:', cartItems.length, 'items');
  } catch (error) {
    console.warn('⚠️ Failed to save cart to localStorage:', error);
  }
}

/**
 * Load cart items from localStorage
 */
export function loadCartFromStorage(): CartItem[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      console.log('📋 No cart found in localStorage');
      return [];
    }

    const cartData = JSON.parse(stored);
    
    // Validate the stored data structure
    if (!cartData || !Array.isArray(cartData.items)) {
      console.warn('⚠️ Invalid cart data in localStorage, clearing...');
      clearCartFromStorage();
      return [];
    }

    // Validate each cart item has required fields
    const validItems = cartData.items.filter((item: CartItem) => 
      item && 
      typeof item.productId === 'string' &&
      typeof item.variantId === 'string' &&
      typeof item.title === 'string' &&
      typeof item.price === 'string' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );

    if (validItems.length !== cartData.items.length) {
      console.warn('⚠️ Some cart items were invalid and filtered out');
    }

    console.log('✅ Cart loaded from localStorage:', validItems.length, 'items');
    return validItems;
  } catch (error) {
    console.warn('⚠️ Failed to load cart from localStorage:', error);
    clearCartFromStorage(); // Clear corrupted data
    return [];
  }
}

/**
 * Clear cart from localStorage
 */
export function clearCartFromStorage(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    console.log('🗑️ Cart cleared from localStorage');
  } catch (error) {
    console.warn('⚠️ Failed to clear cart from localStorage:', error);
  }
}

/**
 * Add a single item to the cart in localStorage
 * This is a convenience method that loads, modifies, and saves
 */
export function addItemToStorage(newItem: CartItem): CartItem[] {
  const currentCart = loadCartFromStorage();
  
  // Check if item already exists
  const existingItemIndex = currentCart.findIndex(item => item.variantId === newItem.variantId);
  
  let updatedCart: CartItem[];
  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    updatedCart = currentCart.map((item, index) => 
      index === existingItemIndex 
        ? { ...item, quantity: item.quantity + newItem.quantity }
        : item
    );
  } else {
    // Add new item
    updatedCart = [...currentCart, newItem];
  }
  
  saveCartToStorage(updatedCart);
  return updatedCart;
}

/**
 * Update item quantity in localStorage
 */
export function updateItemQuantityInStorage(variantId: string, quantity: number): CartItem[] {
  const currentCart = loadCartFromStorage();
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    const updatedCart = currentCart.filter(item => item.variantId !== variantId);
    saveCartToStorage(updatedCart);
    return updatedCart;
  }
  
  // Update quantity
  const updatedCart = currentCart.map(item =>
    item.variantId === variantId 
      ? { ...item, quantity }
      : item
  );
  
  saveCartToStorage(updatedCart);
  return updatedCart;
}

/**
 * Remove item from localStorage
 */
export function removeItemFromStorage(variantId: string): CartItem[] {
  const currentCart = loadCartFromStorage();
  const updatedCart = currentCart.filter(item => item.variantId !== variantId);
  saveCartToStorage(updatedCart);
  return updatedCart;
}
