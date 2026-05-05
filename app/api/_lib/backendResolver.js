// Shared tenant-to-backend resolver for all server-side API routes.
export const HOST_BACKEND_MAP = {
  // Local development host
  localhost:
    "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com",

  "campaign-management-1.technologymindz.com":
    "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com",
  "campaign-management-2.technologymindz.com":
    "https://demo-api.technologymindz.net",
  "demo.technologymindz.net": "https://demo-api.technologymindz.net",
  "architessa.technologymindz.net": "https://architessa-api.technologymindz.net",
  "channelbeacon.technologymindz.net":
    "https://channelbeacon-api.technologymindz.net",
  "digiconvo.technologymindz.net": "https://digiconvo-api.technologymindz.net",
  "channelbeacon-11labs-agent1.technologymindz.com":
    "https://channelbeacon-11labs-agent2.technologymindz.com",
  "fms-aisdr-agent1.technologymindz.com":
    "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com",
  "hr-tm.technologymindz.net": "https://hr-tm-api.technologymindz.net",
};

export const DEFAULT_BACKEND =
  "https://ai-sdr-campaign-management-elevenlabs-1.technologymindz.com";

export function resolveBackend(host) {
  const base = (host || "").replace(/:\d+$/, "");
  return HOST_BACKEND_MAP[base] ?? DEFAULT_BACKEND;
}
