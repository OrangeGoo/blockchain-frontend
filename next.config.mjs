/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api5001/:path*",
        destination: "http://localhost:5001/:path*",
      },
      {
        source: "/api5002/:path*",
        destination: "http://localhost:5002/:path*",
      },
      {
        source: "/api5003/:path*",
        destination: "http://localhost:5003/:path*",
      },
      {
        source: "/tracker/:path*",
        destination: "http://localhost:6000/:path*",
      },
    ];
  },
};

export default nextConfig;
