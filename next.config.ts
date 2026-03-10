import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const distDir = process.env.NEXT_DIST_DIR?.trim();

const nextConfig: NextConfig = {
  ...(distDir ? { distDir } : {}),
  async redirects() {
    return [
      { source: "/book", destination: "/iletisim", permanent: true },
      { source: "/explore", destination: "/kesfet", permanent: true },
      { source: "/profile", destination: "/artistler", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/gallery/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
