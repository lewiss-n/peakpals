import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker uses the standalone server; Vercel builds its own output.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["sharp"],
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
