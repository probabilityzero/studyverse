/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST || 'localhost',
    NEXT_PUBLIC_API_PORT: process.env.NEXT_PUBLIC_API_PORT || '3001',
  },
}

export default nextConfig
