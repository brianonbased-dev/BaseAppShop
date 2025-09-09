'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Icon, Button } from '../DemoComponents';
import { ClearCartModal } from './ClearCartModal';
import type { CartItem } from './CartButton';

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (variantId: string, quantity: number) => Promise<void>;
  onCheckout: () => void;
  onRemoveItem: (variantId: string) => Promise<void>;
  onClearCart?: () => Promise<void>; // Add clear cart functionality
};

export function CartModal({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onCheckout, 
  onRemoveItem,
  onClearCart
}: CartModalProps) {
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Render modal at document root to bypass any parent positioning
  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 99999
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: '80vh',
          overflow: 'hidden',
          border: '2px solid rgb(167, 243, 208)'
        }}
        className="animate-slide-in-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💪</span>
            <h2 className="text-lg font-bold text-emerald-900">Your Cart</h2>
            {itemCount > 0 && (
              <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-full font-semibold">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-emerald-100 transition-colors duration-200 text-emerald-700"
            aria-label="Close cart"
          >
            <Icon name="x" size="md" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col max-h-[calc(80vh-5rem)]">
          {items.length === 0 ? (
            // Empty Cart
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💪</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to get started!</p>
              <Button 
                variant="primary" 
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex items-start space-x-3 bg-gradient-to-r from-white to-emerald-50 p-3 rounded-lg border border-emerald-200">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover rounded-lg"
                            sizes="64px"
                          />
                        ) : (
                          <Icon name="star" size="md" className="text-emerald-600" />
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                          {item.title}
                        </h4>
                        <p className="text-emerald-700 font-bold text-sm mb-2">
                          ${parseFloat(item.price).toFixed(2)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 bg-white border border-emerald-300 rounded-lg">
                            <button
                              onClick={() => onUpdateQuantity(item.variantId, Math.max(0, item.quantity - 1))}
                              className="p-1.5 hover:bg-emerald-50 transition-colors duration-200 text-emerald-700 rounded-l-lg"
                              aria-label="Decrease quantity"
                            >
                              <Icon name="minus" size="sm" />
                            </button>
                            <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center py-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
                              className="p-1.5 hover:bg-emerald-50 transition-colors duration-200 text-emerald-700 rounded-r-lg"
                              aria-label="Increase quantity"
                            >
                              <Icon name="plus" size="sm" />
                            </button>
                          </div>
                          
                          {/* Remove Item */}
                          <button
                            onClick={() => onRemoveItem(item.variantId)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            aria-label="Remove item"
                          >
                            <Icon name="x" size="sm" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Item Total */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 text-sm">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer with Total and Checkout */}
              <div className="border-t border-emerald-200 bg-gradient-to-r from-white to-emerald-50 p-4 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-emerald-700">${total.toFixed(2)}</span>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg font-semibold" 
                    onClick={() => {
                      onCheckout();
                      onClose();
                    }}
                  >
                    💰 Checkout • ${total.toFixed(2)}
                  </Button>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="md" 
                      className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all duration-200 text-sm"
                      onClick={onClose}
                    >
                      Continue Shopping
                    </Button>
                    {onClearCart && (
                    <Button 
                    variant="outline" 
                    size="md" 
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 transition-all duration-200 text-sm"
                    onClick={() => setIsClearModalOpen(true)}
                    >
                    🗑️ Clear Cart
                    </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Clear Cart Confirmation Modal */}
      <ClearCartModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={async () => {
          if (onClearCart) {
            await onClearCart();
          }
        }}
        itemCount={itemCount}
      />
    </div>,
    document.body
  );
}
