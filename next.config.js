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
  
  // Disable image optimization since we're using static export
  images: {
    unoptimized: true,
  },
  
  // Handle trailing slashes
  trailingSlash: true,
  
  // Required for dynamic routes with static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Configure base path if needed
  // basePath: '',
  
  // Configure asset prefix if needed
  // assetPrefix: '',
  
  // App Router doesn't use exportPathMap - it's automatically handled
  // The following routes will be statically generated based on your app directory structure:
  // - app/page.tsx -> /
  // - app/trades/page.tsx -> /trades
  // - app/trades/new/page.tsx -> /trades/new
  // - app/trades/[id]/page.tsx -> /trades/[id] (will be handled client-side for dynamic routes)
  
  // Remove rewrites as they're not needed with App Router
  // App Router handles dynamic routes automatically based on folder structure
  
  // Optional: Configure how dynamic routes are handled during static export
  // This is only needed if you want to pre-generate specific trade detail pages
  // generateBuildId: async () => {
  //   return 'my-build-id'
  // },
  
  // If you need to handle dynamic routes during static export,
  // you can use generateStaticParams in your page components instead
  
  // Optional: Add experimental features if needed
  // experimental: {
  //   // Enable if you need specific experimental features
  // },
};

module.exports = nextConfig;