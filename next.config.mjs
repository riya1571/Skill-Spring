/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub Images (যাতে পরে এরর না আসে)
      }
    ],
  },
};

export default nextConfig;