import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These ship native binaries — keep them external so bundling doesn't
  // touch them, matching the standard Vercel + @sparticuz/chromium setup.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
