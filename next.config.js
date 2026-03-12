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
    outputFileTracingExcludes: {
      '*': [
        'node_modules/onnxruntime-node/**',
        'node_modules/@img/sharp-libvips-*/**',
        'node_modules/@huggingface/transformers/**',
        'node_modules/@chroma-core/default-embed/**',
      ],
    },
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
