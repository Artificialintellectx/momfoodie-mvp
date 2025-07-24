/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent duplicate analytics calls
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig
