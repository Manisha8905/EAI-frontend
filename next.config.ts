import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // ── Existing tenants ──
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

      // ── New tenants ──
      {
        source: "/backend/:path*",
        has: [{ type: "host", value: "demo.technologymindz.net" }],
        destination: "https://demo-api.technologymindz.net/:path*",
      },
      {
        source: "/backend/:path*",
        has: [{ type: "host", value: "architessa.technologymindz.net" }],
        destination: "https://architessa-api.technologymindz.net/:path*",
      },
      {
        source: "/backend/:path*",
        has: [{ type: "host", value: "channelbeacon.technologymindz.net" }],
        destination: "https://channelbeacon-api.technologymindz.net/:path*",
      },
      {
        source: "/backend/:path*",
        has: [{ type: "host", value: "digiconvo.technologymindz.net" }],
        destination: "https://digiconvo-api.technologymindz.net/:path*",
      },
      {
        source: "/backend/:path*",
        has: [{ type: "host", value: "channelbeacon-11labs-agent1.technologymindz.com" }],
        destination: "https://channelbeacon-11labs-agent2.technologymindz.com/:path*",
      },
      {
        source: "/backend/:path*",
        has: [{ type: "host", value: "fms-aisdr-agent1.technologymindz.com" }],
        destination: "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com/:path*",
      },
    ];
  },
};

export default nextConfig;
