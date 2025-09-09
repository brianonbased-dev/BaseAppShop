import { NextResponse } from 'next/server';
import { clearCart, loadExistingCart } from '@/lib/actions/cart';

export async function POST() {
  try {
    console.log('🧹 FULL CART RESET - Clearing everything...');
    
    // 1. Clear the Shopify cart completely
    const clearResult = await clearCart();
    console.log('Shopify cart clear result:', clearResult);
    
    // 2. Load cart to verify it's empty
    const loadResult = await loadExistingCart();
    console.log('Cart after clear:', loadResult);
    
    return NextResponse.json({
      success: true,
      message: '✅ Full cart reset completed!',
      shopifyCartCleared: clearResult.success,
      remainingItems: loadResult.items?.length || 0,
      details: {
        clearResult,
        loadResult
      }
    });
  } catch (error) {
    console.error('❌ Error in full cart reset:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const loadResult = await loadExistingCart();
    return NextResponse.json({
      message: 'Current cart status',
      itemCount: loadResult.items?.length || 0,
      items: loadResult.items || [],
      instructions: 'POST to this endpoint to reset cart completely'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
