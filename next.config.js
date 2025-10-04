/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  env: {
    EXCHANGE_RATE_API_URL: process.env.EXCHANGE_RATE_API_URL,
    COUNTRIES_API_URL: process.env.COUNTRIES_API_URL,
  },
}

module.exports = nextConfig
