/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:host/:port/:path*",
        destination: "http://:host::port/:path*",
      },
      {
        source: "/tracker/:path*",
        destination: "http://localhost:6000/:path*",
      },
    ];
  },
};

export default nextConfig;
