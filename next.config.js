import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",           // keeps WASM compatibility happy
    scrollRestoration: true
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false
  },
  webpack(config, { isServer }) {
    // Bundle‑size inspection
    if (process.env.ANALYZE) {
      // BundleAnalyzerPlugin imported at top
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
          reportFilename: "../analyze/bundle.html"
        })
      );
    }

    // Let Next transpile WASM for both client & server
    config.experiments = { 
      ...config.experiments,
      asyncWebAssembly: true, 
      topLevelAwait: true 
    };

    // Example absolute‑import alias
    config.resolve.alias["@"] = path.resolve(__dirname);

    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src * blob: data:; media-src 'none'; frame-src 'none'; connect-src *;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;