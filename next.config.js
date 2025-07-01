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
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Development CSP - allows unsafe-eval and unsafe-inline for Next.js hot reloading
    const devCSP = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self'; frame-src 'none'; connect-src 'self' https: ws: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; font-src 'self' data:; manifest-src 'self';";
    
    // Production CSP - strict security for production deployment
    const prodCSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self'; frame-src 'none'; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; font-src 'self' data:; manifest-src 'self';";
    
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
            value: isDevelopment ? devCSP : prodCSP
          }
        ]
      }
    ];
  }
};

export default nextConfig;
