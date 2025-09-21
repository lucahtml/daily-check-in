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
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  // Ensure client-side routing works with Vercel
  async rewrites() {
    return [
      {
        source: '/trades/:path*',
        destination: '/trades/:path*',
      },
    ];
  },
  // Add output export for static deployment
  output: 'export',
  // Add base path if needed
  // basePath: '',
  // Add asset prefix if needed
  // assetPrefix: '',
  // Enable static exports
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
