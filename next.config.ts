import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page in this app is auth-gated and reads the session cookie,
  // so per-route caching brings no benefit — opting out of the
  // cacheComponents model keeps rendering simply dynamic.
  cacheComponents: false,
  output: "standalone", // so the app runs inside the Docker image built below
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
