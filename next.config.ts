import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'secure.gravatar.com',
      'file.fury.tw'
    ]
  }
};

export default nextConfig;
