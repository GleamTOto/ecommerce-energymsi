import type { NextConfig } from "next";

const r2PublicHostname = (() => {
  const value = process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_BASE_URL;
  if (!value) return undefined;
  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      ...(r2PublicHostname
        ? [{ protocol: "https" as const, hostname: r2PublicHostname }]
        : []),
    ],
  },
};

export default nextConfig;
