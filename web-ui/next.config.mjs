/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                'fs/promises': false,
            }
        }
        return config
    },
    transpilePackages: ['raven-test-sdk'],
    output: 'standalone',
}

export default nextConfig
