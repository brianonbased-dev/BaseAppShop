import { NextResponse } from 'next/server';
import { clearCart } from '@/lib/actions/cart';

export async function POST() {
  try {
    console.log('🗑️ Clearing accumulated Shopify cart items...');
    
    const result = await clearCart();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ All accumulated cart items cleared from Shopify cart!',
        result
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '❌ Failed to clear cart',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to clear all items from Shopify cart',
    usage: 'POST /api/clear-shopify-cart'
  });
}
