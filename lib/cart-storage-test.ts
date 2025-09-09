/**
 * localStorage test utilities for debugging cart persistence
 * These functions can be called from the browser console to test localStorage functionality
 */

import { 
  saveCartToStorage, 
  loadCartFromStorage, 
  clearCartFromStorage,
  addItemToStorage,
  updateItemQuantityInStorage,
  removeItemFromStorage
} from './cart-storage';
import type { CartItem } from '@/app/components/cart';

// Make these functions available on window for easy testing
declare global {
  interface Window {
    cartStorageTest: {
      save: typeof saveCartToStorage;
      load: typeof loadCartFromStorage;
      clear: typeof clearCartFromStorage;
      add: typeof addItemToStorage;
      updateQuantity: typeof updateItemQuantityInStorage;
      remove: typeof removeItemFromStorage;
      testBasicFlow: () => void;
      inspectStorage: () => void;
    };
  }
}

/**
 * Test the basic cart localStorage flow
 */
function testBasicFlow(): void {
  console.log('🧪 Testing localStorage cart flow...');
  
  // Clear any existing data
  clearCartFromStorage();
  
  // Test adding items
  const testItem1: CartItem = {
    productId: 'test-product-1',
    variantId: 'test-variant-1',
    title: 'Test Product 1',
    price: '29.99',
    quantity: 2,
    image: 'https://via.placeholder.com/150'
  };
  
  const testItem2: CartItem = {
    productId: 'test-product-2',
    variantId: 'test-variant-2',
    title: 'Test Product 2',
    price: '19.99',
    quantity: 1,
  };
  
  console.log('➕ Adding test items...');
  addItemToStorage(testItem1);
  addItemToStorage(testItem2);
  
  // Load and verify
  const loaded = loadCartFromStorage();
  console.log('📦 Loaded cart:', loaded);
  
  // Test updating quantity
  console.log('📝 Updating quantity...');
  updateItemQuantityInStorage('test-variant-1', 5);
  
  // Test removing item
  console.log('🗑️ Removing item...');
  removeItemFromStorage('test-variant-2');
  
  // Final state
  const final = loadCartFromStorage();
  console.log('✅ Final cart state:', final);
  
  console.log('🧪 Test completed! Check the results above.');
}

/**
 * Inspect current localStorage state
 */
function inspectStorage(): void {
  console.log('🔍 Inspecting localStorage...');
  
  try {
    const stored = localStorage.getItem('baseappshop_cart');
    if (stored) {
      console.log('📊 Raw storage data:', stored);
      console.log('📦 Parsed cart data:', JSON.parse(stored));
    } else {
      console.log('📭 No cart data in localStorage');
    }
    
    const loadedItems = loadCartFromStorage();
    console.log('✅ Loaded items via utility:', loadedItems);
  } catch (error) {
    console.error('❌ Error inspecting storage:', error);
  }
}

/**
 * Initialize localStorage testing utilities
 * Call this function to make cart storage testing available in console
 */
export function initializeCartStorageTest(): void {
  if (typeof window !== 'undefined') {
    window.cartStorageTest = {
      save: saveCartToStorage,
      load: loadCartFromStorage,
      clear: clearCartFromStorage,
      add: addItemToStorage,
      updateQuantity: updateItemQuantityInStorage,
      remove: removeItemFromStorage,
      testBasicFlow,
      inspectStorage,
    };
    
    console.log('🧪 Cart storage test utilities loaded!');
    console.log('📖 Try these in console:');
    console.log('   window.cartStorageTest.testBasicFlow() - Run full test');
    console.log('   window.cartStorageTest.inspectStorage() - View current state');
    console.log('   window.cartStorageTest.clear() - Clear cart');
    console.log('   window.cartStorageTest.load() - Load current cart');
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    // Delay to ensure localStorage is available
    setTimeout(initializeCartStorageTest, 100);
  }
}
