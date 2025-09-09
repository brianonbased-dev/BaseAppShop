# Cart & Wallet Implementation

## Overview
This implementation provides a fully functional shopping cart with a beautiful UI and a context-aware wallet button that integrates with the existing Next.js 15 + React 19 + TailwindCSS setup.

## Components

### ContextWalletButton (`/app/components/ContextWalletButton.tsx`)
- **'use client'** React component
- **Context-aware**: Shows user's basename and avatar from Base app
- **Entry point indicators**: Shows badges based on how user discovered the app
  - 🔥 Cast embed (viral discovery)
  - ⭐ Launcher (returning user)  
  - 💬 Messaging (private share)
- **App save status**: Shows 💾 when user has saved the app
- **Fallback support**: Works gracefully on web without context

### CartButton (`/app/components/cart/CartButton.tsx`)
- **'use client'** React component
- Circular cart button positioned in top right
- Uses Fresh Green color scheme (`.color-scheme-6`)
- Dynamic background that intensifies with more cart items
- Animated item count badge
- Pulse effects when items are added

### CartModal (`/app/components/cart/CartModal.tsx`) 
- Full-screen modal for cart management
- Product images, quantities, and totals
- Add/remove/update functionality
- Checkout integration ready
- Smooth slide-in animations
- Keyboard navigation support

## Layout Improvements

### Sticky Header
- **Always accessible**: Header sticks to top when scrolling
- **Backdrop blur**: Glass morphism effect (`backdrop-blur-md`)
- **High z-index**: Ensures wallet and cart are always clickable (`z-40` header, `z-50` buttons)
- **Responsive**: Works on all screen sizes

### Enhanced User Experience
- **Context-driven personalization**: Different experiences based on entry point
- **Social attribution**: Acknowledges how user discovered the app
- **Visual feedback**: Entry badges and save status indicators
- **Graceful fallbacks**: Works on web and within Base app

## Visual Design

### Fresh Green Theme
Uses `.color-scheme-6` from `theme.css`:
- **Primary**: `rgb(16, 185, 129)` (emerald)
- **Background**: `rgb(236, 253, 245)` (light green)
- **Text**: `rgb(6, 78, 59)` (dark green)

### Dynamic Behavior
- **Wallet button**: Shows username/basename with avatar
- **Cart button**: Gets darker green as items are added
- **Entry badges**: Temporary indicators (5s) showing discovery source
- **Save indicator**: Shows when user has saved the app

### Context-Aware Features
```typescript
// Entry point detection
switch (context.location?.type) {
  case 'cast_embed':   // 🔥 Viral discovery
  case 'launcher':     // ⭐ Returning user
  case 'messaging':    // 💬 Private share
}

// User personalization  
const { username, displayName, pfpUrl, fid } = context.user;

// App state
const { added, platformType } = context.client;
```

## Cart State Management
```typescript
type CartItem = {
  productId: string;
  variantId: string; 
  title: string;
  price: string;
  quantity: number;
  image?: string;
};
```

## Integration Points
- **Add to Cart**: Real product data from Shopify
- **Checkout**: Ready for Base Pay integration  
- **State**: Managed in main `page.tsx` component
- **Context**: Leverages Base app user data
- **Persistence**: Session-based (can be extended to localStorage)

## Usage

The enhanced system is automatically integrated:

```tsx
// Context-aware wallet button
<ContextWalletButton />

// Functional cart button
<CartButton 
  items={cartItems}
  onUpdateQuantity={handleUpdateQuantity}
  onCheckout={handleCheckout}
  onRemoveItem={handleRemoveItem}
/>
```

## Accessibility Features

### Always Clickable
- **Sticky header**: Never disappears during scroll
- **High z-index**: Buttons always on top (`z-50`)
- **Large tap targets**: 44px minimum touch areas
- **Keyboard navigation**: Full keyboard support

### Visual Feedback
- **Loading states**: Smooth transitions and animations
- **Error handling**: Graceful image fallbacks
- **Status indicators**: Clear connection and save state
- **Entry context**: Users understand how they arrived

## Next Steps
- [ ] Connect to BasePay for crypto checkout
- [ ] Add localStorage persistence  
- [ ] Implement social sharing features
- [ ] Add context-based onboarding flows
- [ ] Enhance viral attribution tracking
