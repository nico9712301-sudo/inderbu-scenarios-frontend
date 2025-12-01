/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'inderbu.gov.co',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  // Completely remove experimental features for Storybook
  // This prevents webpack compilation errors
};

export default nextConfig;

