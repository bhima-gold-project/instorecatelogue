import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
 // basePath: '/instoreui',
  typescript: {
    // ❗ This will skip type errors during build
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true, 
  },

  images: {
    unoptimized: true,
    remotePatterns: [
            {
         protocol: "https",
         hostname: "suvarnagopura.com",
          pathname: "/NJMIS/**",
      },
      {
        protocol: "http",
        hostname: "192.168.10.32",
      },
      {
        protocol: "https",
        hostname: "192.168.10.32",
      },
      {
         protocol: "http",
         hostname: "suvarnagopura.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.10.12",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.bhimagold.com",
      },
      {
        protocol: "http",
        hostname: "productimages.bhimagold.com",
      },
      {
        protocol: "https",
        hostname: "productimages.bhimagold.com",
      },
      {
        protocol: "https",
        hostname: "apis.sharaanapps.co",
      },
      {
        protocol: "http",
        hostname: "productimages.sarayu.com",
      },
      {
        protocol: "http",
        hostname: "strapiiijs.sharaanapps.co.in",
      },
      {
        protocol: "https",
        hostname: "sharaaninfo.com",
      },
      {
        protocol: "http",
        hostname: "sharaanapps.co.in",
      },
      {
        protocol: "https",
        hostname: "images.sharaanapps.co.in",
      },
      {
        protocol: "http",
        hostname: "suvarnagopura.com",
      },
      {
        protocol: "https",
        hostname: "suvarnagopura.com",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
