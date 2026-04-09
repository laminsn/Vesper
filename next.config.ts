import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode in dev to prevent double-mount (halves WebSocket subscriptions)
  reactStrictMode: false,
};

export default nextConfig;
