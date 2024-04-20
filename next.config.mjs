/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
