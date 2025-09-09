import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check all environment variables related to Shopify
    const envVars = {
      NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
      NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ? 'Set ✅' : 'Missing ❌',
      SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? 'Set ✅' : 'Missing ❌',
      SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET ? 'Set ✅' : 'Missing ❌',
      NODE_ENV: process.env.NODE_ENV
    };

    console.log('🔍 Environment Variables Check:', envVars);

    // Test the cart creation process
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!domain || !token) {
      return NextResponse.json({
        success: false,
        error: 'Missing Shopify environment variables',
        envVars
      });
    }

    // Test a simple cart creation query
    const testCartQuery = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            totalQuantity
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Test with a simple product (you'll need to get a real variant ID from your store)
    const testVariantId = 'gid://shopify/ProductVariant/1'; // This needs to be a real variant ID
    
    const response = await fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: testCartQuery,
        variables: {
          input: {
            lines: [
              {
                merchandiseId: testVariantId,
                quantity: 1
              }
            ]
          }
        }
      })
    });

    const data = await response.json();
    console.log('🛒 Cart Creation Test:', data);

    return NextResponse.json({
      success: response.ok,
      envVars,
      cartTest: {
        status: response.status,
        data,
        testVariantId
      },
      instructions: {
        message: 'To fix checkout, you need a real variant ID from your Shopify store',
        steps: [
          'Go to your Shopify admin',
          'Navigate to Products',
          'Click on any product',
          'Click on a variant',
          'Copy the variant ID from the URL or inspect element'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug failed'
    }, { status: 500 });
  }
}
