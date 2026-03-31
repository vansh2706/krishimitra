/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['winston'],
    },
    images: {
        unoptimized: true,
    },
    // Standard build for Firebase Web Frameworks auto-deploy
    trailingSlash: true,
}

module.exports = nextConfig