/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      'https://lmsarohak-production-7334.up.railway.app/api',
  },
}

module.exports = nextConfig
