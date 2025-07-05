import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
      },
    ],
  },
};

export default withPWA(nextConfig);
