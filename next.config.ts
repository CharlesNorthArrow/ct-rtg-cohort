import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mapbox GL requires transpilation
  transpilePackages: ['mapbox-gl'],
};

export default nextConfig;
