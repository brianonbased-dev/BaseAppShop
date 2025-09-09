'use client';

export type CartItem = {
  productId: string;
  variantId: string;
  title: string;
  price: string;
  quantity: number;
  image?: string;
  lineId?: string; // Shopify cart line ID for updates/removals
};

type CartButtonProps = {
  items: CartItem[];
  onOpenCart: () => void; // Simplified - just opens the cart
};

export function CartButton({ items, onOpenCart }: CartButtonProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate green intensity based on items in cart (0-1 scale)
  const greenIntensity = Math.min(itemCount / 10, 1); // Max intensity at 10 items
  
  // Dynamic background that gets greener with more items
  const buttonBg = greenIntensity > 0 
    ? `linear-gradient(135deg, rgba(255,255,255,${1 - greenIntensity * 0.3}) 0%, rgba(236,253,245,${0.5 + greenIntensity * 0.5}) 100%)`
    : 'white';
  
  // Border gets more prominent with items
  const borderColor = greenIntensity > 0
    ? `rgba(16, 185, 129, ${0.3 + greenIntensity * 0.7})`
    : 'rgba(16, 185, 129, 0.2)';

  return (
    <>
      <button
        onClick={() => onOpenCart()} // Use the shared modal opener
        className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg z-50"
        style={{
          background: buttonBg,
          border: `2px solid ${borderColor}`,
        }}
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        {/* Cart Icon */}
        <span className={`text-xl transition-all duration-300 ${
          greenIntensity > 0.5
            ? 'text-emerald-900'
            : greenIntensity > 0
              ? 'text-emerald-700'
              : 'text-emerald-600'
        }`}>🛒</span>
        
        {/* Item Count Badge */}
        {itemCount > 0 && (
          <div 
            className="absolute -top-2 -right-2 flex items-center justify-center min-w-[22px] h-[22px] rounded-full text-white text-xs font-bold shadow-lg animate-pulse"
            style={{
              background: `linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(6, 78, 59) 100%)`,
              fontSize: itemCount > 99 ? '10px' : '12px'
            }}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </div>
        )}
        
        {/* Pulse effect when items are added */}
        {greenIntensity > 0 && (
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{
              background: 'rgb(16, 185, 129)',
              animationDuration: '2s'
            }}
          />
        )}
      </button>
    </>
  );
}
