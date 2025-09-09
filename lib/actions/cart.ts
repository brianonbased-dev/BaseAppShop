'use server';

import { shopifyFetch, CART_CREATE_MUTATION, CART_LINES_ADD_MUTATION, CART_LINES_REMOVE_MUTATION, CART_LINES_UPDATE_MUTATION, CART_QUERY } from '@/lib/shopify-fixed';
import { cookies } from 'next/headers';

// Shopify Admin API Order types
export interface ShopifyLineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  variant_title: string | null;
  vendor: string;
  product_id: number;
  variant_id: number;
}

// Cart line item from Shopify Storefront API (legacy - use ShopifyCartLine instead)
export interface ShopifyCartLineNode {
  merchandise: {
    id: string;
    product: {
      handle: string;
      title: string;
      images?: {
        edges: Array<{
          node: {
            url: string;
          };
        }>;
      };
    };
    price: {
      amount: string;
    };
  };
  quantity: number;
}

export interface ShopifyAddress {
  first_name: string | null;
  last_name: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zip: string | null;
  phone: string | null;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

export interface ShopifyOrder {
  id: number;
  order_number: string;
  email: string;
  total_price: string;
  currency: string;
  financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  fulfillment_status: 'fulfilled' | 'partial' | 'restocked' | null;
  created_at: string;
  updated_at: string;
  customer: ShopifyCustomer | null;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress | null;
  billing_address: ShopifyAddress | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  note: string | null;
  tags: string;
}

// Proper cart structure from Shopify API
export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    product: {
      handle: string;
      title: string;
      images?: {
        edges: Array<{
          node: {
            url: string;
            altText?: string;
          };
        }>;
      };
    };
  };
}

export interface ShopifyCartResponse {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  cost?: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount?: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount?: {
      amount: string;
      currencyCode: string;
    };
  };
}

export type CartActionResult = {
  success: boolean;
  error?: string;
  cartId?: string;
  checkoutUrl?: string;
  cart?: ShopifyCartResponse;
};

// Create a new Shopify cart
export async function createCart(items: Array<{ variantId: string; quantity: number }>): Promise<CartActionResult> {
  try {
    const response = await shopifyFetch(CART_CREATE_MUTATION, {
      input: {
        lines: items.map(item => ({
          merchandiseId: item.variantId,
          quantity: item.quantity
        }))
      }
    });

    if (response.data?.cartCreate?.userErrors?.length > 0) {
      const errors = response.data.cartCreate.userErrors.map((error: { message: string }) => error.message).join(', ');
      console.error('❌ Cart creation errors:', errors);
      return { success: false, error: errors };
    }

    const cart = response.data?.cartCreate?.cart;
    if (!cart) {
      console.error('❌ No cart returned from Shopify API');
      return { success: false, error: 'Failed to create cart - no cart data returned' };
    }

    // Store cart ID in cookies for persistence
    const cookieStore = await cookies();
    cookieStore.set('shopify_cart_id', cart.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    console.log('✅ Cart created successfully:', cart.id);
    console.log('🔗 Checkout URL:', cart.checkoutUrl);

    return {
      success: true,
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      cart
    };
  } catch (error) {
    console.error('❌ Error creating cart:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create cart'
    };
  }
}

// Add items to existing cart
export async function addToCart(cartId: string, items: Array<{ variantId: string; quantity: number }>): Promise<CartActionResult> {
  try {
    console.log('➕ Adding items to cart:', cartId, items);
    
    const response = await shopifyFetch(CART_LINES_ADD_MUTATION, {
      cartId,
      lines: items.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity
      }))
    });

    if (response.data?.cartLinesAdd?.userErrors?.length > 0) {
      const errors = response.data.cartLinesAdd.userErrors.map((error: { message: string }) => error.message).join(', ');
      console.error('❌ Add to cart errors:', errors);
      return { success: false, error: errors };
    }

    const cart = response.data?.cartLinesAdd?.cart;
    if (!cart) {
      return { success: false, error: 'Failed to add items to cart' };
    }

    console.log('✅ Items added to cart successfully');

    return {
      success: true,
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      cart
    };
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add to cart'
    };
  }
}

// Remove specific line items from cart
export async function removeFromCart(cartId: string, lineIds: string[]): Promise<CartActionResult> {
  try {
    console.log('🗑️ Removing items from cart:', cartId, lineIds);
    
    const response = await shopifyFetch(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds
    });

    if (response.data?.cartLinesRemove?.userErrors?.length > 0) {
      const errors = response.data.cartLinesRemove.userErrors.map((error: { message: string }) => error.message).join(', ');
      console.error('❌ Remove from cart errors:', errors);
      return { success: false, error: errors };
    }

    const cart = response.data?.cartLinesRemove?.cart;
    if (!cart) {
      return { success: false, error: 'Failed to remove items from cart' };
    }

    console.log('✅ Items removed from cart successfully');

    return {
      success: true,
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      cart
    };
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove from cart'
    };
  }
}

// Update line item quantities in cart
export async function updateCartLineQuantity(cartId: string, lineId: string, quantity: number): Promise<CartActionResult> {
  try {
    console.log('🔄 Updating cart line quantity:', cartId, lineId, quantity);
    
    const response = await shopifyFetch(CART_LINES_UPDATE_MUTATION, {
      cartId,
      lines: [{
        id: lineId,
        quantity
      }]
    });

    if (response.data?.cartLinesUpdate?.userErrors?.length > 0) {
      const errors = response.data.cartLinesUpdate.userErrors.map((error: { message: string }) => error.message).join(', ');
      console.error('❌ Update cart line errors:', errors);
      return { success: false, error: errors };
    }

    const cart = response.data?.cartLinesUpdate?.cart;
    if (!cart) {
      return { success: false, error: 'Failed to update cart line quantity' };
    }

    console.log('✅ Cart line quantity updated successfully');

    return {
      success: true,
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      cart
    };
  } catch (error) {
    console.error('❌ Error updating cart line quantity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update cart line quantity'
    };
  }
}

// Get current cart ID from cookies
export async function getCartId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('shopify_cart_id')?.value || null;
  } catch (error) {
    console.error('❌ Error getting cart ID:', error);
    return null;
  }
}

// Clear cart ID from cookies only (doesn't clear Shopify cart)
export async function clearCartCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('shopify_cart_id');
    console.log('✅ Cart cookie cleared');
  } catch (error) {
    console.error('❌ Error clearing cart cookie:', error);
  }
}

// Clear entire Shopify cart by removing all line items
export async function clearCart(): Promise<CartActionResult> {
  try {
    const cartId = await getCartId();
    if (!cartId) {
      console.log('📋 No cart to clear');
      return { success: true };
    }

    // Get current cart to find all line IDs
    const cartDetails = await fetchCartDetails(cartId);
    if (!cartDetails.success || !cartDetails.cart) {
      console.log('📋 Cart not found, clearing cookie');
      await clearCartCookie();
      return { success: true };
    }

    // Extract all line IDs
    const lineIds = cartDetails.cart.lines.edges.map((edge) => edge.node.id);
    
    if (lineIds.length === 0) {
      console.log('📋 Cart already empty');
      return { success: true };
    }

    // Remove all lines from cart
    const result = await removeFromCart(cartId, lineIds);
    
    if (result.success) {
      console.log('✅ All items removed from Shopify cart');
      await clearCartCookie();
      return { success: true };
    } else {
      console.error('❌ Failed to clear Shopify cart:', result.error);
      // Clear cookie anyway to reset local state
      await clearCartCookie();
      return result;
    }
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    // Clear cookie anyway to reset local state
    await clearCartCookie();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cart'
    };
  }
}

// Get cart details by ID
export async function fetchCartDetails(cartId: string): Promise<CartActionResult> {
  try {
    console.log('📋 Fetching cart details for:', cartId);
    
    const response = await shopifyFetch(CART_QUERY, { cartId });
    
    if (!response.data?.cart) {
      return { success: false, error: 'Cart not found' };
    }

    const cart = response.data.cart;
    console.log('✅ Cart details fetched:', cart.totalQuantity, 'items');

    return {
      success: true,
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      cart
    };
  } catch (error) {
    console.error('❌ Error fetching cart details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cart'
    };
  }
}

// Start checkout process - redirects to Shopify checkout
export async function initiateCheckout(cartItems: Array<{ variantId: string; quantity: number; title: string; price: string }>): Promise<CartActionResult> {
  try {
    console.log('🚀 Starting checkout process with items:', cartItems);
    console.log('🔍 Items to checkout:', cartItems.map(item => ({ 
      variantId: item.variantId, 
      quantity: item.quantity,
      title: item.title 
    })));
    
    // Get existing cart or create new one
    const cartId = await getCartId();
    console.log('📋 Existing cart ID:', cartId);
    
    let result: CartActionResult;
    
    if (cartId) {
      console.log('🔄 Attempting to add to existing cart:', cartId);
      // Try to add to existing cart
      result = await addToCart(cartId, cartItems);
      
      // If cart doesn't exist anymore, create a new one
      if (!result.success) {
        console.log('🔄 Existing cart invalid, creating new cart. Error was:', result.error);
        result = await createCart(cartItems);
      }
    } else {
      console.log('🆕 Creating new cart (no existing cart ID)');
      // Create new cart
      result = await createCart(cartItems);
    }

    console.log('📊 Checkout result:', result);

    if (result.success && result.checkoutUrl) {
      console.log('✅ Checkout initiated successfully:', result.checkoutUrl);
      return {
        success: true,
        cartId: result.cartId,
        checkoutUrl: result.checkoutUrl,
        cart: result.cart
      };
    } else {
      console.error('❌ Checkout initiation failed:', result.error);
      return { success: false, error: result.error || 'Failed to initiate checkout' };
    }
    
  } catch (error) {
    console.error('❌ Error initiating checkout:', error);
    console.error('❌ Checkout error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Checkout failed'
    };
  }
}

// Complete purchase after successful payment
export async function completePurchase(orderId: string, email?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('✅ Purchase completed:', { orderId, email });
    
    // Clear the cart since purchase is complete
    const clearResult = await clearCart();
    if (!clearResult.success) {
      console.warn('⚠️ Failed to clear cart after purchase:', clearResult.error);
    }
    
    // TODO: Add any post-purchase logic here:
    // - Send confirmation email
    // - Update user account
    // - Track analytics
    // - Sync with CRM
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error completing purchase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete purchase'
    };
  }
}

// Load existing cart from Shopify and sync with app state
export async function loadExistingCart(): Promise<{ success: boolean; items?: Array<{ productId: string; variantId: string; title: string; price: string; quantity: number; image?: string; lineId?: string }>; error?: string }> {
  try {
    const cartId = await getCartId();
    if (!cartId) {
      console.log('📋 No existing cart ID found');
      return { success: true, items: [] };
    }

    console.log('🔄 Loading existing cart:', cartId);
    const result = await fetchCartDetails(cartId);
    
    if (!result.success || !result.cart) {
      console.log('❌ Could not load existing cart, clearing cart ID');
      await clearCart();
      return { success: true, items: [] };
    }

    // Convert Shopify cart to app cart format
    const items = result.cart.lines.edges.map((edge) => ({
      productId: edge.node.merchandise.product.handle || edge.node.merchandise.id,
      variantId: edge.node.merchandise.id,
      title: edge.node.merchandise.product.title,
      price: edge.node.merchandise.price.amount,
      quantity: edge.node.quantity,
      image: edge.node.merchandise.product.images?.edges?.[0]?.node?.url,
      lineId: edge.node.id // Store the cart line ID for removals/updates
    }));

    console.log('✅ Existing cart loaded with', items.length, 'items');
    return { success: true, items };
    
  } catch (error) {
    console.error('❌ Error loading existing cart:', error);
    // Clear invalid cart and continue
    await clearCart();
    return { success: true, items: [] };
  }
}

// Get order details from Shopify Admin API (requires admin token)
export async function getOrderDetails(orderId: string): Promise<{ success: boolean; order?: ShopifyOrder; error?: string }> {
  try {
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    
    if (!adminToken) {
      console.log('⚠️ Admin token not configured, cannot fetch order details');
      return { success: false, error: 'Admin API not configured' };
    }
    
    const response = await fetch(`https://${shopDomain}/admin/api/2024-10/orders/${orderId}.json`, {
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📋 Order details fetched:', data.order?.order_number);
    
    return { success: true, order: data.order };
    
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order'
    };
  }
}
