/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_API_URL}/api/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true, // You can leave this true or remove it depending on your media needs
  }
};

export default nextConfig;



