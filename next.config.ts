import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        has: [{ type: "host", value: "campaign-management-1.technologymindz.com" }],
        destination: "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com/:path*",
      },
      {
        source: "/backend/:path*",
        has: [{ type: "host", value: "campaign-management-2.technologymindz.com" }],
        destination: "https://demo-api.technologymindz.net/:path*",
      },
    ];
  },
};

export default nextConfig;
