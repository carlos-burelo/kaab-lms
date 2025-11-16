import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**'
      }
    ]
  },
  experimental: {
    mcpServer: true,
    serverActions: {
      bodySizeLimit: '1gb'
    },
    turbopackFileSystemCacheForDev: true
  },
  reactCompiler: true
}

export default nextConfig
