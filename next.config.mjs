/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: '*.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: '*.imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'shop.brianxbase.com',
      },
      // Add any other domains you might use for images
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
