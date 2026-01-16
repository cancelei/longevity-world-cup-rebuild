import type { NextConfig } from "next";

// Security headers configuration
const securityHeaders = [
  {
    // Prevent clickjacking attacks
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Prevent MIME type sniffing
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Enable XSS protection (legacy browsers)
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    // Control referrer information
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // DNS prefetch control
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    // Permissions Policy (formerly Feature-Policy)
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    // Content Security Policy
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.idrivee2.com wss://*.clerk.com",
      "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Disable type checking during build (run separately in CI)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization settings
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "*.idrivee2.com",
      },
      {
        protocol: "https",
        hostname: "longevityworldcup.com",
      },
    ],
  },

  // Experimental features
  experimental: {
    // Optimize server components
    serverActions: {
      bodySizeLimit: "10mb", // Allow larger uploads for OCR
    },
  },

  // Security headers for all routes
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
