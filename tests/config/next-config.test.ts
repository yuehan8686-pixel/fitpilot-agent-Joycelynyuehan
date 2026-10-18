import { networkInterfaces } from "node:os";

import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("Next.js development origins", () => {
  it("allows every current non-internal IPv4 address", () => {
    const localIpv4Addresses = Object.values(networkInterfaces())
      .flatMap((entries) => entries ?? [])
      .filter((entry) => entry.family === "IPv4" && !entry.internal)
      .map((entry) => entry.address);

    expect(localIpv4Addresses.length).toBeGreaterThan(0);
    expect(nextConfig.allowedDevOrigins).toEqual(expect.arrayContaining(localIpv4Addresses));
  });
});
