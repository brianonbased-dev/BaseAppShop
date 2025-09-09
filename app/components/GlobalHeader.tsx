"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";
import { Button, Icon } from './DemoComponents';
import { CartButton, CartModal } from './cart';
import { ContextWalletButton } from './ContextWalletButton';
import { PurchaseConfirmation } from './PurchaseFlow';
import { useCart } from './CartProvider';

export function GlobalHeader() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const addFrame = useAddFrame();

  const {
    cartItems,
    isCartModalOpen,
    setIsCartModalOpen,
    handleUpdateQuantity,
    handleCheckout,
    handleRemoveItem,
    handleClearCart,
    showConfirmation,
    purchaseDetails,
    setShowConfirmation,
  } = useCart();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <>
      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-200/50 px-4 py-3 shadow-sm sticky-header">
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between items-center h-11">
            <div>
              <div className="flex items-center space-x-2">
                <ContextWalletButton />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CartButton 
                items={cartItems}
                onOpenCart={() => setIsCartModalOpen(true)}
              />
              {saveFrameButton}
            </div>
          </div>
        </div>
      </header>

      {/* Global Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => {
          handleCheckout();
          setIsCartModalOpen(false);
        }}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmation
        isOpen={showConfirmation}
        orderNumber={purchaseDetails.orderNumber}
        email={purchaseDetails.email}
        total={purchaseDetails.total}
        onClose={() => setShowConfirmation(false)}
      />
    </>
  );
}
