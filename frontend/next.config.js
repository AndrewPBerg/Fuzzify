/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config) => {
    return config;
  },
  output: 'export',
  
    // Add any other necessary configuration
    // reactStrictMode: true,
};

module.exports = nextConfig; 
