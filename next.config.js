/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/*',
      },
    ],
  },
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.externals = [
      ...config.externals,
      { canvas: 'canvas' },
      '@chroma-core/default-embed',
      'onnxruntime-node',
      '@huggingface/transformers',
    ];
    return config;
  },
};

module.exports = nextConfig;
