/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ballhub-backend-production.up.railway.app";
let url;

try {
  url = new URL(apiUrl);
} catch (e) {
  url = new URL("https://ballhub-backend-production.up.railway.app");
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        port: url.port,
        pathname: "/img/**",
      },
    ],

    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Bật unoptimized cho toàn bộ các môi trường để đảm bảo ảnh từ backend luôn hiển thị tốt
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;