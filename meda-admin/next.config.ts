import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "urban-garbanzo-q5j5495xr4rhj7j-3000.app.github.dev",
        "*.app.github.dev",
        "localhost:3000",
        "localhost:3001",
      ],
    },
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
