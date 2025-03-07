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
};

module.exports = nextConfig; 