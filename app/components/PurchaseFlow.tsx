"use client";

import { useState, useEffect } from 'react';
import { Button, Icon } from './DemoComponents';
import { initiateCheckout } from '@/lib/actions/cart';

type PurchaseFlowProps = {
  cartItems: Array<{
    productId: string;
    variantId: string;
    title: string;
    price: string;
    quantity: number;
    image?: string;
  }>;
  onPurchaseComplete?: () => void;
  onCancel?: () => void;
};

type PurchaseStatus = 'idle' | 'processing' | 'redirecting' | 'completed' | 'error';

export function PurchaseFlow({ cartItems, onPurchaseComplete, onCancel }: PurchaseFlowProps) {
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleShopifyCheckout = async () => {
    try {
      setStatus('processing');
      setError(null);

      // Convert cart items to the format expected by initiateCheckout
      const checkoutItems = cartItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        title: item.title,
        price: item.price
      }));

      const result = await initiateCheckout(checkoutItems);

      if (result.success && result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
        setStatus('redirecting');
        
        // Redirect to Shopify checkout
        window.open(result.checkoutUrl, '_blank');
        
        // Optionally clear the cart and call completion callback
        setTimeout(() => {
          setStatus('completed');
          onPurchaseComplete?.();
        }, 2000);
      } else {
        setStatus('error');
        setError(result.error || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Checkout failed');
    }
  };

  const handleCancel = () => {
    setStatus('idle');
    setError(null);
    onCancel?.();
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-lg p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Your Purchase</h3>
        <p className="text-gray-600 text-sm">Total: <span className="font-bold text-emerald-600">${total.toFixed(2)}</span></p>
      </div>

      {status === 'idle' && (
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            onClick={handleShopifyCheckout}
          >
            🛍️ Checkout with Shopify
          </Button>
          
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      )}

      {status === 'processing' && (
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-gray-600">Setting up your checkout...</p>
        </div>
      )}

      {status === 'redirecting' && (
        <div className="text-center space-y-3">
          <Icon name="check" size="lg" className="text-emerald-500 mx-auto" />
          <div>
            <p className="text-gray-900 font-medium">Redirecting to checkout!</p>
            <p className="text-gray-600 text-sm">Complete your purchase in the new tab.</p>
          </div>
          {checkoutUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(checkoutUrl, '_blank')}
            >
              🔗 Open Checkout Again
            </Button>
          )}
        </div>
      )}

      {status === 'completed' && (
        <div className="text-center space-y-3">
          <Icon name="heart" size="lg" className="text-emerald-500 mx-auto" />
          <div>
            <p className="text-gray-900 font-bold">Thank you!</p>
            <p className="text-gray-600 text-sm">Your order is being processed.</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center space-y-3">
          <Icon name="x" size="lg" className="text-red-500 mx-auto" />
          <div>
            <p className="text-red-900 font-medium">Checkout Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <div className="space-y-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => setStatus('idle')}
            >
              Try Again
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Purchase confirmation modal
type PurchaseConfirmationProps = {
  isOpen: boolean;
  orderNumber?: string;
  email?: string;
  total?: number;
  onClose: () => void;
};

export function PurchaseConfirmation({ isOpen, orderNumber, email, total, onClose }: PurchaseConfirmationProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 10 seconds
      const timer = setTimeout(onClose, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size="lg" className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Purchase Complete!</h2>
          <p className="text-gray-600">Thank you for your order</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          {orderNumber && (
            <p className="text-sm text-emerald-800">
              <span className="font-medium">Order #:</span> {orderNumber}
            </p>
          )}
          {email && (
            <p className="text-sm text-emerald-800">
              <span className="font-medium">Email:</span> {email}
            </p>
          )}
          {total && (
            <p className="text-sm text-emerald-800">
              <span className="font-medium">Total:</span> ${total.toFixed(2)}
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 mb-4">
            You&apos;ll receive a confirmation email shortly
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
