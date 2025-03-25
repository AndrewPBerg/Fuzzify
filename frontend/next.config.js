/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config) => {
    return config;
  },
  
    // Add any other necessary configuration
    // reactStrictMode: true,
};

module.exports = nextConfig; 
