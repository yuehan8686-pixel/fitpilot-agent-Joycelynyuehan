import { networkInterfaces } from "node:os";

import type { NextConfig } from "next";

const localDevOrigins = Object.values(networkInterfaces())
  .flatMap((entries) => entries ?? [])
  .filter((entry) => entry.family === "IPv4" && !entry.internal)
  .map((entry) => entry.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: Array.from(new Set(["127.0.0.1", ...localDevOrigins])),
  reactStrictMode: true,
};

export default nextConfig;
