/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !! 
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Enable static exports
  output: 'export',
  // Disable image optimization since we're using static export
  images: {
    unoptimized: true,
  },
  // Handle trailing slashes
  trailingSlash: true,
  // Configure base path if needed
  // basePath: '',
  // Configure asset prefix if needed
  // assetPrefix: '',
  // Enable static HTML export
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/trades': { page: '/trades' },
      '/trades/new': { page: '/trades/new' },
      // Dynamic routes for trade details will be handled client-side
    };
  },
  // Handle client-side routing for dynamic routes
  async rewrites() {
    return [
      // Handle client-side routing for trade details
      {
        source: '/trades/:id',
        destination: '/trades/[id]',
      },
    ];
  },
};

module.exports = nextConfig;
