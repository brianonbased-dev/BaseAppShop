'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon, Button } from '../DemoComponents';

type ClearCartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
};

export function ClearCartModal({ isOpen, onClose, onConfirm, itemCount }: ClearCartModalProps) {
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

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100000 // Higher than cart modal
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '20rem',
          border: '2px solid rgb(248, 113, 113)' // Red border for warning
        }}
        className="animate-slide-in-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-6 border-b border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="x" size="md" className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-red-900 text-center">Clear Cart?</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-2">
            This will remove all <span className="font-semibold text-red-600">{itemCount}</span> item{itemCount !== 1 ? 's' : ''} from your cart.
          </p>
          <p className="text-gray-500 text-sm">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 pt-0">
          <Button
            variant="outline"
            size="md"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            🗑️ Clear Cart
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}