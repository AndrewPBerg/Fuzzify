/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,      // Check for changes every second
      aggregateTimeout: 300,   // Delay before rebuilding
      ignored: /node_modules/  // Don't watch node_modules
    };
    return config;
  },
  // Only use static export in production
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  
  // Add any other necessary configuration
  // reactStrictMode: true,
};

module.exports = nextConfig; 