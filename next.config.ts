import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next.js default membatasi body server action ke 1MB.
      // Upload file via Server Action butuh payload lebih besar.
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
