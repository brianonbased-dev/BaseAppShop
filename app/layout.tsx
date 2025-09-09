import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { GlobalHeader } from "./components/GlobalHeader";
import { CartProvider } from "./components/CartProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  const title = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Brian X Base Store";
  const description = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Premium health supplements & coffee";
  const heroImage = process.env.NEXT_PUBLIC_APP_HERO_IMAGE;
  
  return {
    title,
    description,
    // Open Graph metadata
    openGraph: {
      title,
      description,
      url: URL,
      siteName: title,
      images: heroImage ? [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    // Twitter metadata  
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImage ? [heroImage] : [],
    },
    // Additional metadata
    keywords: ['supplements', 'health', 'coffee', 'base', 'crypto', 'onchain'],
    authors: [{ name: 'Brian X Base' }],
    robots: {
      index: true,
      follow: true,
    },
    // Farcaster frame metadata
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: heroImage,
        button: {
          title: `Launch ${title}`,
          action: {
            type: "launch_frame",
            name: title,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>
          <CartProvider>
            <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme" style={{background: 'var(--gradient-background)'}}>
              <GlobalHeader />
              {children}
            </div>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
