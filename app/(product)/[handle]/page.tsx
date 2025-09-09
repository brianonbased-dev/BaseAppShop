import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { shopifyFetch, SINGLE_PRODUCT_QUERY } from '@/lib/shopify-fixed';
import ProductPageClient from './ProductPageClient';

// Type for the single product response
interface SingleProductResponse {
  data: {
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
    } | null;
  };
}

// Server-side data fetching function
async function getProduct(handle: string) {
  try {
    const response = await shopifyFetch(SINGLE_PRODUCT_QUERY, {
      handle: handle
    }) as SingleProductResponse;
    
    return response.data?.product || null;
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return null;
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  
  if (!product) {
    return {
      title: 'Product Not Found | Brian X Base Store',
      description: 'The requested product could not be found.',
    };
  }

  const mainImage = product.images.edges[0]?.node;
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.priceRange.minVariantPrice.currencyCode,
  }).format(parseFloat(product.priceRange.minVariantPrice.amount));

  const title = product.seo?.title || `${product.title} - ${price}`;
  const description = product.seo?.description || 
    product.description || 
    `${product.title} from Brian X Base Store. Starting at ${price}. Premium health supplements & coffee.`;

  return {
    title: `${title} | Brian X Base Store`,
    description,
    openGraph: {
      title,
      description,
      images: mainImage ? [
        {
          url: mainImage.url,
          width: mainImage.width,
          height: mainImage.height,
          alt: mainImage.altText || product.title,
        }
      ] : [],
      type: 'website',
      siteName: 'Brian X Base Store',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: mainImage ? [mainImage.url] : [],
    },
    // Farcaster Frame metadata
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': mainImage?.url || '',
      'fc:frame:button:1': 'Add to Cart',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': `${process.env.NEXT_PUBLIC_BASE_URL || ''}/${handle}`,
      'fc:frame:button:2': 'View Store',
      'fc:frame:button:2:action': 'link', 
      'fc:frame:button:2:target': process.env.NEXT_PUBLIC_BASE_URL || '',
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  
  if (!product) {
    notFound();
  }

  return (
    <div className="px-4 py-6">
      {/* Client component will handle the actual UI */}
      <ProductPageClient product={product} />
    </div>
  );
}
