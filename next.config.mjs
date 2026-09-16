import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
