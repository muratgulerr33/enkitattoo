import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/book", destination: "/iletisim", permanent: true },
      { source: "/explore", destination: "/kesfet", permanent: true },
      { source: "/profile", destination: "/artistler", permanent: true },
    ];
  },
};

export default nextConfig;
