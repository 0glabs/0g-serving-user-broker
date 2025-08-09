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
        } else {
            // Prevent server-side bundling of browser-only packages
            config.externals = [...(config.externals || []), {
                '@electric-sql/pglite': 'commonjs @electric-sql/pglite',
            }]
        }
        return config
    },
    transpilePackages: ['raven-test-sdk'],
    output: 'standalone',
}

export default nextConfig
