"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Icon } from './DemoComponents';
import { shopifyFetch, PRODUCT_QUERY, type ShopifyProduct } from '@/lib/shopify-fixed';

// Type for GraphQL response structure
type ProductEdge = {
  node: ShopifyProduct;
  cursor: string;
};

type ProductsResponse = {
  products: {
    edges: ProductEdge[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

type ProductCardProps = {
  product: ShopifyProduct;
  onAddToCart: (productId: string, variantId: string, productDetails?: { title: string; price: string; image?: string }) => void;
};

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);
  const mainImage = product.images.edges[0]?.node;
  
  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[var(--app-accent)] hover:-translate-y-1 group">
      {/* Product Image */}
      <Link href={`/${product.handle}`} className="block">
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 relative cursor-pointer">
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.altText || product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--app-foreground-muted)]">
              <Icon name="star" size="lg" className="text-emerald-400" />
            </div>
          )}
          {/* Emerald overlay on hover */}
          <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4 text-center">
        <Link href={`/${product.handle}`}>
          <h3 className="text-[var(--app-foreground)] mb-2 font-[var(--font-heading-family)] hover:text-emerald-600 transition-colors cursor-pointer">
            {product.title}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="mb-3">
          {selectedVariant ? (
            <span className="text-lg font-bold text-[var(--app-foreground)]">
              {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
            </span>
          ) : (
            <span className="text-lg font-bold text-[var(--app-foreground)]">
              {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
            </span>
          )}
        </div>
        
        {/* Variant Selection */}
        {product.variants.edges.length > 1 && (
          <div className="mb-3">
            <select 
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const variant = product.variants.edges.find(v => v.node.id === e.target.value)?.node;
                if (variant) setSelectedVariant(variant);
              }}
              className="w-full px-2 py-1 bg-white border border-emerald-300 text-[var(--app-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 rounded transition-all duration-200"
            >
              {product.variants.edges.map(({ node: variant }) => (
                <option key={variant.id} value={variant.id}>
                  {variant.title} - {formatPrice(variant.price.amount, variant.price.currencyCode)}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="md"
          className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] transform hover:scale-105 transition-all duration-200"
          onClick={() => selectedVariant && onAddToCart(
            product.id, 
            selectedVariant.id,
            {
              title: product.title,
              price: selectedVariant.price.amount,
              image: mainImage?.url
            }
          )}
          disabled={!selectedVariant?.availableForSale}
        >
          {selectedVariant?.availableForSale ? '+ Add to Cart' : 'Sold Out'}
        </Button>
        
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 justify-center">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={tag}
                className="text-xs px-2 py-1 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300 rounded-full font-medium transform hover:scale-105 transition-all duration-200"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type ProductGridProps = {
  onAddToCart: (productId: string, variantId: string, productDetails?: { title: string; price: string; image?: string }) => void;
};

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching products with direct fetch...');
        
        const response = await shopifyFetch(PRODUCT_QUERY, {
          first: 12 // Show more products initially
        }) as { data: ProductsResponse };
        
        const productsData = response.data?.products;
        const products = productsData?.edges?.map((edge: ProductEdge) => edge.node) || [];
        setProducts(products);
        setHasNextPage(productsData?.pageInfo?.hasNextPage || false);
        setEndCursor(productsData?.edges?.[productsData.edges.length - 1]?.cursor || null);
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        setError(`Failed to load products: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const loadMoreProducts = async () => {
    if (!hasNextPage || !endCursor || loadingMore) return;
    
    try {
      setLoadingMore(true);
      console.log('🔍 Loading more products...');
      
      const response = await shopifyFetch(PRODUCT_QUERY, {
        first: 9,
        after: endCursor
      }) as { data: ProductsResponse };
      
      const productsData = response.data?.products;
      const newProducts = productsData?.edges?.map((edge: ProductEdge) => edge.node) || [];
      
      setProducts(prev => [...prev, ...newProducts]);
      setHasNextPage(productsData?.pageInfo?.hasNextPage || false);
      setEndCursor(productsData?.edges?.[productsData.edges.length - 1]?.cursor || null);
      
      console.log('✅ More products loaded:', newProducts.length);
    } catch (err) {
      console.error('❌ Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-emerald-200 rounded-lg animate-pulse shadow-sm">
            <div className="aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100"></div>
            <div className="p-4">
              <div className="h-4 bg-emerald-100 border border-emerald-200 rounded mb-2 animate-pulse"></div>
              <div className="h-6 bg-emerald-100 border border-emerald-200 rounded mb-3 animate-pulse"></div>
              <div className="h-8 bg-emerald-100 border border-emerald-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--app-foreground-muted)] mb-4">
          <Icon name="star" size="lg" className="mx-auto mb-2" />
          <p>{error}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2"
          onClick={() => window.open('/diagnostic', '_blank')}
        >
          🔧 Debug
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--app-foreground-muted)]">
          <Icon name="star" size="lg" className="mx-auto mb-2" />
          <p>No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
      
      {/* Load More Button */}
      {hasNextPage && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            size="md" 
            onClick={loadMoreProducts}
            disabled={loadingMore}
            className="min-w-[140px]"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--app-accent)] mr-2"></div>
                Loading...
              </>
            ) : (
              <>Load More ({products.length} shown)</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Simple cart component
import type { CartItem } from './cart';
import { ClearCartModal } from './cart/ClearCartModal';

type SimpleCartProps = {
  items: CartItem[];
  onUpdateQuantity: (variantId: string, quantity: number) => Promise<void>;
  onCheckout: () => void;
  onRemoveItem?: (variantId: string) => Promise<void>;
  onClearCart?: () => void;
  onOpenUrl?: (url: string) => void;
};

export function SimpleCart({ items, onUpdateQuantity, onCheckout, onRemoveItem, onClearCart }: Omit<SimpleCartProps, 'onOpenUrl'>) {
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  
  const total = items.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * item.quantity);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="text-center py-6">
        <Icon name="heart" size="lg" className="mx-auto mb-2 text-[var(--app-foreground-muted)]" />
        <p className="text-[var(--app-foreground-muted)]">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      {items.map((item) => (
        <div key={item.variantId} className="flex items-center space-x-3 border-b border-[var(--app-card-border)] pb-4">
          {/* Product Image */}
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            {item.image ? (
              <Image 
                src={item.image} 
                alt={item.title} 
                fill
                className="object-cover rounded-lg" 
                sizes="48px"
              />
            ) : (
              <Icon name="star" size="sm" className="text-emerald-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-[var(--app-foreground)] text-sm truncate">{item.title}</h4>
            <p className="text-emerald-700 font-semibold text-sm">${parseFloat(item.price).toFixed(2)}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white border border-emerald-300 rounded">
              <button
                onClick={() => onUpdateQuantity(item.variantId, Math.max(0, item.quantity - 1))}
                className="w-6 h-6 flex items-center justify-center text-[var(--app-foreground)] hover:bg-emerald-50 transition-colors duration-200"
              >
                <Icon name="minus" size="sm" />
              </button>
              <span className="text-sm font-medium text-[var(--app-foreground)] min-w-[1.5rem] text-center">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
                className="w-6 h-6 flex items-center justify-center text-[var(--app-foreground)] hover:bg-emerald-50 transition-colors duration-200"
              >
                <Icon name="plus" size="sm" />
              </button>
            </div>
            
            {onRemoveItem && (
              <button
                onClick={() => onRemoveItem(item.variantId)}
                className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                aria-label="Remove item"
              >
                <Icon name="x" size="sm" />
              </button>
            )}
          </div>
        </div>
      ))}
      
      {/* Total */}
      <div className="border-t border-[var(--app-card-border)] pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-[var(--app-foreground)]">Total:</span>
          <span className="font-bold text-lg text-[var(--app-foreground)]">${total.toFixed(2)}</span>
        </div>
        
        {/* Checkout Buttons */}
        <div className="space-y-2">
          <Button 
            variant="primary" 
            size="md" 
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg" 
            onClick={() => {
              console.log('🛒 SimpleCart checkout button clicked!');
              console.log('🔍 SimpleCart onCheckout function:', typeof onCheckout);
              onCheckout();
            }}
          >
            💰 Checkout
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
            >
              💪 Continue on Shopify
            </Button>
            {onClearCart && items.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                onClick={() => setIsClearModalOpen(true)}
              >
                🗑️ Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Clear Cart Confirmation Modal */}
      <ClearCartModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          if (onClearCart) {
            onClearCart();
          }
        }}
        itemCount={items.reduce((sum, item) => sum + item.quantity, 0)}
      />
    </div>
  );
}
