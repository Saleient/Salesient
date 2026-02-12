import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";
import type { NextConfig } from "next";

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti.import("./src/env/index.ts");
const nextConfig: NextConfig = {
  compiler: {
    // if NODE_ENV is production, remove console.log
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "logos.composio.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fibery.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.githubassets.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
