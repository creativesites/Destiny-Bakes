/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'oaidalleapiprodscus.blob.core.windows.net',
      'imgen.x.ai', // ✅ Added this line
    ],
  },
};

module.exports = nextConfig;