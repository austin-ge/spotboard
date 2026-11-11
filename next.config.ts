import type { NextConfig } from "next";

// Conservative security headers. Deliberately NOT included: Content-Security-Policy
// and X-Frame-Options/frame-ancestors (the Mapbox setup and any dropzone sites that
// embed a board need to be checked before enforcing those).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), usb=()",
  },
  // Production domain is HTTPS-only; max-age only (no includeSubDomains/preload)
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
