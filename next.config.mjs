import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Our own destination photos are served at 85-90 so they stay crisp.
    qualities: [75, 85, 90],
    remotePatterns: [
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async redirects() {
    // The bare root has no page of its own (only /[locale] does) and proxy.ts
    // does not reliably intercept the literal "/" path in this Next version
    // (verified: every other path reaches it, "/" does not). This routing-layer
    // redirect is independent of the layout/middleware tree entirely.
    return [
      { source: "/", destination: "/en", permanent: false },
      // Transatel's catalogue spelled Namibia "Nambia"; keep the old address working.
      { source: "/:locale/destinations/nambia", destination: "/:locale/destinations/namibia", permanent: true },
      { source: "/:locale/destinations/nambia/:path*", destination: "/:locale/destinations/namibia/:path*", permanent: true },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
