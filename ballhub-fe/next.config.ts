/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
let url;

try {
  url = new URL(apiUrl);
} catch (e) {
  url = new URL("http://localhost:8080");
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
};

export default nextConfig;