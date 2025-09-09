"use client";

import { useState } from "react";
import { Button } from "./components/DemoComponents";
import { ProductGrid } from "./components/ShopifyComponents";
import { Banner, ProductBanner } from "./components/Banner";
import { useCart } from "./components/CartProvider";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";

export default function App() {
  const [activeTab, setActiveTab] = useState("shop");
  const { cartItems, handleAddToCart, setIsCartModalOpen } = useCart();
  const openUrl = useOpenUrl();

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Content Area */}
      <div className="px-4 py-3">
        {/* Navigation */}
        <nav className="flex space-x-1 mb-4 bg-gradient-to-r from-white to-emerald-50 border border-emerald-300 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("shop")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === "shop"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transform scale-105"
                : "text-[var(--app-foreground-muted)] hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            💪 Shop
          </button>
          <button
            onClick={() => {
              setActiveTab("cart");
              setIsCartModalOpen(true); // Open cart modal when cart tab is clicked
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 relative ${
              activeTab === "cart"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transform scale-105"
                : "text-[var(--app-foreground-muted)] hover:text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            💪 Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                {cartItemCount}
              </span>
            )}
          </button>
        </nav>

        <main className="flex-1 pb-4">
          {activeTab === "shop" && (
            <div className="space-y-4 animate-fade-in">
              <Banner 
                title="Brian X Base Store"
                subtitle={process.env.NEXT_PUBLIC_APP_TAGLINE || "Premium health supplements & coffee"}
              />
              
              <ProductBanner className="mb-4" />
              
              <ProductGrid onAddToCart={handleAddToCart} />
            </div>
          )}
          
          {activeTab === "cart" && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💪</span>
                </div>
                <h2 className="text-xl text-[var(--app-foreground)] font-[var(--font-heading-family)] mb-2">
                  Your Cart
                </h2>
                <p className="text-[var(--app-foreground-muted)] mb-6">
                  {cartItems.length === 0 
                    ? "Your cart is empty. Add some products to get started!"
                    : `You have ${cartItemCount} item${cartItemCount !== 1 ? 's' : ''} in your cart`
                  }
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    if (cartItems.length === 0) {
                      setActiveTab("shop"); // Switch to shop tab when cart is empty
                    } else {
                      setIsCartModalOpen(true); // Open cart modal when items exist
                    }
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {cartItems.length === 0 ? '💪 Start Shopping' : '💪 View Cart'}
                </Button>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-2 pt-4 flex flex-col justify-center text-center border-t border-emerald-200/30">
          <Button
            variant="ghost"
            size="md"
            className="text-[var(--ock-text-foreground-muted)] text-xs hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
            onClick={() => openUrl("https://shop.brianxbase.com")}
          >
            🔗 Visit Full Store
          </Button>
          <p className="text-[var(--ock-text-foreground-muted)] text-xs mx-2 select-none">
            Visit Full Store to view:
          </p>
          <p className="text-[var(--ock-text-foreground-muted)] text-xs mx-2 select-none">
            Return policy | Terms of Service | Privacy Policy
          </p>
        </footer>
      </div>
    </div>
  );
}
