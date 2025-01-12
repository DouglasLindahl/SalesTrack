import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = withPWA({
  reactStrictMode: true, // Add other Next.js config here
});

export default nextConfig;
