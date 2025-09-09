"use client";

import { useState } from 'react';
import { Button } from '../components/DemoComponents';
import { shopifyFetch, PRODUCT_QUERY } from '@/lib/shopify-fixed';

export function ShopifyDebugger() {
  const [testResult, setTestResult] = useState<{ success: boolean; productsCount: number; sampleProduct?: string; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing direct Shopify connection...');
      const response = await shopifyFetch(PRODUCT_QUERY, {
        first: 1
      });
      
      const productsCount = response.data?.products?.edges?.length || 0;
      setTestResult({
        success: true,
        productsCount,
        message: productsCount > 0 ? `Found ${productsCount} products!` : 'Connected but no products found'
      });
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 p-4 mb-4" style={{backgroundColor: '#f5f5f5'}}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-black text-sm">
          🔧 Shopify Connection Test
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={runTest}
          disabled={testing}
          style={{color: '#000000'}}
        >
          {testing ? 'Testing...' : 'Test'}
        </Button>
      </div>
      
      {testResult && (
        <div className="text-xs">
          {testResult.success ? (
            <div style={{color: '#059669'}}>
              ✅ {testResult.message}
            </div>
          ) : (
            <div style={{color: '#dc2626'}}>
              ❌ Failed: {testResult.error}
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs" style={{color: '#666666'}}>
        Domain: 0xyq0w-e7.myshopify.com
        <br />
        Token: b25dc2e1...
      </div>
    </div>
  );
}
