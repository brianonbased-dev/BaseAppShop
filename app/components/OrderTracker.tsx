"use client";

import { useState } from 'react';
import { Button, Icon } from './DemoComponents';
import type { ShopifyOrder } from '@/lib/actions/cart';

type OrderStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'error';

export function OrderTracker() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<OrderStatus>('idle');
  const [orderData, setOrderData] = useState<ShopifyOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) return;
    
    setStatus('loading');
    setError(null);
    setOrderData(null);
    
    try {
      // Note: This would need the Admin API to work fully
      // For now, we'll show a placeholder implementation
      console.log('🔍 Tracking order:', { orderNumber, email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock order data (replace with real API call when Admin token is configured)
      const mockOrder: ShopifyOrder = {
        id: parseInt(orderNumber) || 12345,
        order_number: orderNumber,
        email: email,
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        total_price: '89.99',
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer: {
          id: 1,
          email: email,
          first_name: 'Test',
          last_name: 'Customer',
          phone: null
        },
        line_items: [
          {
            id: 1,
            title: 'Premium Health Supplement',
            quantity: 2,
            price: '39.99',
            variant_title: 'Default',
            vendor: 'Your Store',
            product_id: 1,
            variant_id: 1
          }
        ],
        shipping_address: {
          first_name: 'Test',
          last_name: 'Customer',
          address1: '123 Test St',
          address2: null,
          city: 'Chicago',
          province: 'Illinois',
          country: 'United States',
          zip: '60601',
          phone: null
        },
        billing_address: null,
        cancel_reason: null,
        cancelled_at: null,
        note: null,
        tags: ''
      };
      
      setOrderData(mockOrder);
      setStatus('found');
      
    } catch (error) {
      console.error('❌ Order tracking error:', error);
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Failed to track order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-600 bg-emerald-100';
      case 'fulfilled': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string): "search" | "heart" | "star" | "check" | "plus" | "arrow-right" | "shopping-cart" | "shopping-bag" | "minus" | "x" => {
    switch (status) {
      case 'paid': return 'check';
      case 'fulfilled': return 'shopping-bag';
      case 'pending': return 'star';
      case 'cancelled': return 'x';
      default: return 'search';
    }
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <Icon name="search" size="lg" className="text-emerald-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-gray-900">Track Your Order</h2>
        <p className="text-gray-600 text-sm">Enter your order details to check status</p>
      </div>

      {status === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Number
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. #1001"
              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            onClick={handleTrackOrder}
            disabled={!orderNumber.trim()}
          >
            🔍 Track Order
          </Button>
        </div>
      )}

      {status === 'loading' && (
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-gray-600">Looking up your order...</p>
        </div>
      )}

      {status === 'found' && orderData && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-emerald-900">Order #{orderData.order_number}</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderData.financial_status)}`}>
                <Icon name={getStatusIcon(orderData.financial_status)} size="sm" className="inline mr-1" />
                {orderData.financial_status?.toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-emerald-800">
              <p><span className="font-medium">Total:</span> ${parseFloat(orderData.total_price).toFixed(2)} {orderData.currency}</p>
              <p><span className="font-medium">Email:</span> {orderData.email}</p>
              <p><span className="font-medium">Date:</span> {new Date(orderData.created_at).toLocaleDateString()}</p>
              {orderData.shipping_address && (
                <p><span className="font-medium">Ship to:</span> {orderData.shipping_address.city}, {orderData.shipping_address.province}</p>
              )}\n            </div>
          </div>
          
          {/* Order Items */}\n          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Items:</h4>
            {orderData.line_items?.map((item, index: number) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">${parseFloat(item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={() => {
              setStatus('idle');
              setOrderNumber('');
              setEmail('');
              setOrderData(null);
            }}
          >
            Track Another Order
          </Button>
        </div>
      )}

      {status === 'not-found' && (
        <div className="text-center space-y-4">
          <Icon name="search" size="lg" className="text-gray-400 mx-auto" />
          <div>
            <p className="text-gray-900 font-medium">Order Not Found</p>
            <p className="text-gray-600 text-sm">Please check your order number and email</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setStatus('idle')}
          >
            Try Again
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center space-y-4">
          <Icon name="x" size="lg" className="text-red-500 mx-auto" />
          <div>
            <p className="text-red-900 font-medium">Tracking Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setStatus('idle')}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

// Order status badge component
type OrderStatusProps = {
  status: string;
  className?: string;
};

export function OrderStatus({ status, className = "" }: OrderStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { icon: 'check' as const, label: 'Paid', color: 'emerald' };
      case 'fulfilled':
        return { icon: 'shopping-bag' as const, label: 'Shipped', color: 'blue' };
      case 'pending':
        return { icon: 'star' as const, label: 'Pending', color: 'yellow' };
      case 'cancelled':
        return { icon: 'x' as const, label: 'Cancelled', color: 'red' };
      default:
        return { icon: 'search' as const, label: status || 'Unknown', color: 'gray' };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 ${className}`}>
      <Icon name={config.icon} size="sm" className="mr-1" />
      {config.label}
    </div>
  );
}
