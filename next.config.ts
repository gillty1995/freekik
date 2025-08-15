import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})({
  reactStrictMode: true,
  images: {
    domains: [], 
  },
});

export default nextConfig;
