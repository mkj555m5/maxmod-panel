import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway: standalone output for production deployment
  output: "standalone",
  // Skip type errors during build (dev env compatibility)
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow Railway proxy to forward properly
  experimental: {
    // Optimize for serverless/standalone deployments
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  // Trust Railway proxy headers (X-Forwarded-Proto, X-Forwarded-Host)
  // This is REQUIRED for custom domains to work with HTTPS properly
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
