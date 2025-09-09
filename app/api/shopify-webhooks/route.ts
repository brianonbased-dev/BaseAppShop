import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Simple webhook order data interface
interface OrderWebhook {
  id: number;
  order_number: string;
  email: string;
  total_price: string;
  currency: string;
  fulfillment_status?: string | null;
  cancel_reason?: string | null;
  line_items?: Array<{
    id: number;
    title: string;
    quantity: number;
  }>;
}

// Helper function to verify Shopify webhook signature
function verifyShopifyWebhook(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body, 'utf8');
  const computedSignature = hmac.digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(computedSignature, 'base64')
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get the webhook secret from environment
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ SHOPIFY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get headers
    const headersList = await headers();
    const signature = headersList.get('x-shopify-hmac-sha256');
    const topic = headersList.get('x-shopify-topic');
    const shop = headersList.get('x-shopify-shop-domain');

    if (!signature) {
      console.error('❌ No Shopify signature provided');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Verify the webhook signature
    if (!verifyShopifyWebhook(body, signature, webhookSecret)) {
      console.error('❌ Invalid Shopify webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the webhook payload
    const webhook = JSON.parse(body);
    
    console.log('🎣 Received Shopify webhook:', {
      topic,
      shop,
      orderId: webhook.id,
      orderNumber: webhook.order_number,
      email: webhook.email
    });

    // Handle different webhook topics
    switch (topic) {
      case 'orders/paid':
        await handleOrderPaid(webhook);
        break;
        
      case 'orders/fulfilled':
        await handleOrderFulfilled(webhook);
        break;
        
      case 'orders/cancelled':
        await handleOrderCancelled(webhook);
        break;
        
      case 'orders/created':
        await handleOrderCreated(webhook);
        break;
        
      default:
        console.log(`📝 Unhandled webhook topic: ${topic}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}

// Handle order paid webhook
async function handleOrderPaid(order: OrderWebhook) {
  console.log('💰 Order paid:', {
    id: order.id,
    number: order.order_number,
    total: order.total_price,
    currency: order.currency,
    email: order.email
  });

  // TODO: Add notification logic here
  // You could send notifications to users, update database, etc.
}

// Handle order fulfilled webhook  
async function handleOrderFulfilled(order: OrderWebhook) {
  console.log('📦 Order fulfilled:', {
    id: order.id,
    number: order.order_number,
    email: order.email,
    fulfillmentStatus: order.fulfillment_status
  });

  // TODO: Send shipping notifications
}

// Handle order cancelled webhook
async function handleOrderCancelled(order: OrderWebhook) {
  console.log('❌ Order cancelled:', {
    id: order.id,
    number: order.order_number,
    reason: order.cancel_reason,
    email: order.email
  });

  // TODO: Handle refunds, inventory updates
}

// Handle order created webhook
async function handleOrderCreated(order: OrderWebhook) {
  console.log('🆕 Order created:', {
    id: order.id,
    number: order.order_number,
    total: order.total_price,
    currency: order.currency,
    email: order.email,
    lineItems: order.line_items?.length || 0
  });

  // TODO: Send order confirmation
}
