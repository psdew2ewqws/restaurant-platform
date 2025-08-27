/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Enable compression
  compress: true,
  
  // Optimize bundle splitting and imports
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      'react-hook-form',
      'framer-motion',
      'date-fns',
      'pigeon-maps'
    ]
  },
  
  // Custom webpack configuration for better performance
  webpack: (config, { buildId, dev, isServer }) => {
    // Optimize bundle size with better chunk splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          icons: {
            test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
            name: 'icons',
            priority: 15,
            chunks: 'all',
          },
          maps: {
            test: /[\\/]node_modules[\\/]pigeon-maps[\\/]/,
            name: 'maps',
            priority: 15,
            chunks: 'all',
          }
        }
      }
    }
    
    return config
  },
  
  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/:path*`,
      },
    ]
  },
  
  // Headers for better caching and performance
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig