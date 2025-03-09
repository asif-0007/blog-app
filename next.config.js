/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['dlhpbdxffztyakpqyrac.supabase.co'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dlhpbdxffztyakpqyrac.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
