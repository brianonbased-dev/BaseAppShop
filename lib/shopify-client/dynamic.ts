"use client";

import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Dynamic client creation to avoid environment variable issues
export function createShopifyClient() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  
  console.log('🔍 Creating dynamic Shopify client:', {
    domain,
    tokenLength: token?.length,
    tokenPrefix: token?.substring(0, 8),
    allEnvVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_SHOPIFY'))
  });
  
  if (!domain) {
    throw new Error(`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN not found. Available env vars: ${Object.keys(process.env).filter(k => k.includes('SHOPIFY')).join(', ')}`);
  }
  
  if (!token) {
    throw new Error(`NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN not found. Available env vars: ${Object.keys(process.env).filter(k => k.includes('SHOPIFY')).join(', ')}`);
  }
  
  return createStorefrontApiClient({
    storeDomain: `https://${domain}`,
    publicAccessToken: token,
    apiVersion: '2024-10',
  });
}

// Test function to check if client works
export async function testShopifyConnection() {
  try {
    const client = createShopifyClient();
    
    const response = await client.request(`{
      products(first: 1) {
        edges {
          node {
            id
            title
          }
        }
      }
    }`);
    
    return {
      success: true,
      productsCount: response.data?.products?.edges?.length || 0,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
