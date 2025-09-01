import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  eslint: {
    // Continue surfacing ESLint problems locally, but don't block prod builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production build to succeed even if there are type errors
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle GLB/GLTF files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/files/',
          outputPath: 'static/files/',
        },
      },
    })

    // Optimize Three.js for client-side rendering
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }

    return config
  },
};

export default nextConfig;
