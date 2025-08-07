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
    transpilePackages: ['0g-serving-broker'],
    output: 'standalone',
}

export default nextConfig
