"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button, Icon } from '@/app/components/DemoComponents';
import { useCart } from '@/app/components/CartProvider';
import { useComposeCast } from '@coinbase/onchainkit/minikit';

// Type for the product prop (matching what we fetch from server)
interface ProductPageClientProps {
  product: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
      maxVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          id: string;
          url: string;
          altText: string | null;
          width: number;
          height: number;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      id: string;
      name: string;
      values: string[];
    }>;
    tags: string[];
    vendor: string;
    productType: string;
    seo: {
      title: string | null;
      description: string | null;
    };
  };
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { handleAddToCart, addingToCart } = useCart();
  const { composeCast } = useComposeCast();

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  const mainImage = product.images.edges[selectedImageIndex]?.node;
  const isAddingThisProduct = selectedVariant ? addingToCart.has(selectedVariant.id) : false;

  const handleShareProduct = () => {
    const currentUrl = window.location.href;
    const price = selectedVariant 
      ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
      : formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode);
    
    composeCast({
      text: `Get ${product.title} for ${price} from Brian X Base Store! 💪`,
      embeds: [currentUrl],
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg relative">
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.altText || product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="star" size="lg" className="text-emerald-400" />
            </div>
          )}
        </div>

        {/* Image Thumbnails */}
        {product.images.edges.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto">
            {product.images.edges.map((imageEdge, index) => (
              <button
                key={imageEdge.node.id}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                  index === selectedImageIndex 
                    ? 'border-emerald-500 scale-105' 
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <Image
                  src={imageEdge.node.url}
                  alt={imageEdge.node.altText || `${product.title} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">
            {product.title}
          </h1>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl font-bold text-emerald-600">
              {selectedVariant 
                ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
                : formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)
              }
            </span>
            {product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && (
              <span className="text-sm text-gray-500">
                - {formatPrice(product.priceRange.maxVariantPrice.amount, product.priceRange.maxVariantPrice.currencyCode)}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Variant Selection */}
        {product.variants.edges.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--app-foreground)]">Options:</h3>
            <select
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const variant = product.variants.edges.find(v => v.node.id === e.target.value)?.node;
                if (variant) setSelectedVariant(variant);
              }}
              className="w-full px-3 py-2 bg-white border border-emerald-300 text-[var(--app-foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            >
              {product.variants.edges.map(({ node: variant }) => (
                <option key={variant.id} value={variant.id}>
                  {variant.title} - {formatPrice(variant.price.amount, variant.price.currencyCode)}
                  {!variant.availableForSale && ' (Sold Out)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          disabled={!selectedVariant?.availableForSale || isAddingThisProduct}
          onClick={() => {
            if (selectedVariant) {
              handleAddToCart(
                product.id,
                selectedVariant.id,
                {
                  title: product.title,
                  price: selectedVariant.price.amount,
                  image: mainImage?.url
                }
              );
            }
          }}
        >
          {isAddingThisProduct ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : selectedVariant?.availableForSale ? (
            '💪 Add to Cart'
          ) : (
            '😔 Sold Out'
          )}
        </Button>

        {/* Share Product Button */}
        <Button
          variant="outline"
          size="md"
          className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          onClick={handleShareProduct}
        >
          🚀 Share this Product
        </Button>

        {/* Description */}
        {product.description && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--app-foreground)]">Description</h3>
            <div className="text-[var(--app-foreground-muted)] text-sm leading-relaxed">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="space-y-2 pt-4 border-t border-emerald-200">
          <h3 className="text-sm font-semibold text-[var(--app-foreground)]">Product Details</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--app-foreground-muted)]">
            <div>
              <span className="font-medium">Vendor:</span> {product.vendor}
            </div>
            <div>
              <span className="font-medium">Type:</span> {product.productType}
            </div>
            <div>
              <span className="font-medium">Variants:</span> {product.variants.edges.length}
            </div>
            <div>
              <span className="font-medium">Available:</span> {product.variants.edges.filter(v => v.node.availableForSale).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
