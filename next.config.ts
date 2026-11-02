import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Clear-Site-Data",
            value: '"cache"',
          },
        ],
      },
      {
        source: "/static/js/bundle.js",
        headers: [
          {
            key: "Clear-Site-Data",
            value: '"cache", "storage"',
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Clear-Site-Data",
            value: '"cache", "storage"',
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/service-worker.js",
        headers: [
          {
            key: "Clear-Site-Data",
            value: '"cache", "storage"',
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
