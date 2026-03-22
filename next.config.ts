import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: false,

  serverExternalPackages: [
    "pg",
    "drizzle-orm",
    "multer",
    "openai",
    "passport",
    "passport-local",
    "express-session",
    "connect-pg-simple",
    "memorystore",
    "ws",
  ],

  // Turbopack config for path aliases (Next.js 16 default bundler)
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      "@server": path.resolve(__dirname, "server"),
    },
  },
};

export default nextConfig;
