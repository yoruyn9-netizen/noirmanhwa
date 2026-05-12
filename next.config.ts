import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.mangadex.network',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's2.mangadex.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's5.mangadex.org',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
