import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any) => {
    // Handle React Native dependencies for web
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
    };
    
    // Ignore pino-pretty for browser builds
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
    };
    
    return config;
  },
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
