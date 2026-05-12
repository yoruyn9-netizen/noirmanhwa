import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        pathname: '/covers/**',
      },
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        pathname: '/data/**',
      },
      {
        protocol: 'https',
        hostname: '*.mangadex.network',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's2.mangadex.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's5.mangadex.org',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
