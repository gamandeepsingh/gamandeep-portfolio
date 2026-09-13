import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /**
   * Stamped once per build and inlined. Reading the clock at render time would
   * instead report whenever a page was regenerated, which drifts on the ISR
   * routes and disagrees with the fully static ones.
   */
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
  reactStrictMode: true,
  typedRoutes: true,
  // Keep the TCP client out of the server bundle; it relies on Node internals.
  serverExternalPackages: ["ioredis"],
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "turbin3.org" },
      { protocol: "https", hostname: "unavatar.io" },
    ],
    qualities: [75, 100],
  },
  compiler:
    process.env.NODE_ENV === "production"
      ? {
          removeConsole: {
            exclude: ["error"],
          },
        }
      : undefined,
  async redirects() {
    return [
      {
        source: "/llms-full.txt",
        destination: "/llms.txt",
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return {
      // beforeFiles so these run before prerendered pages are served;
      // afterFiles rewrites never fire for SSG pages on Vercel, which
      // silently breaks Accept-based markdown negotiation in production
      beforeFiles: [
        {
          source: "/index.md",
          destination: "/llms.txt",
        },
        {
          source: "/",
          destination: "/llms.txt",
          has: [
            {
              type: "header",
              key: "accept",
              value: "(?<accept>.*text/markdown.*)",
            },
          ],
        },
      ],
      afterFiles: [],
    }
  },
}

export default nextConfig
