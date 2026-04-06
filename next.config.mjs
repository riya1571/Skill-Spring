const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // সাময়িকভাবে টাইপ এরর ইগনোর করবে
  },
  eslint: {
    ignoreDuringBuilds: true, // বিল্ডের সময় লিন্টিং চেক করবে না
  },
}