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
                crypto: false,
            }
            // Handle node: protocol imports
            config.resolve.alias = {
                ...config.resolve.alias,
                'node:crypto': false,
                'node:buffer': false,
                'node:stream': false,
                'node:util': false,
            }
        } else {
            // Prevent server-side bundling of browser-only packages
            config.externals = [
                ...(config.externals || []),
                {
                    '@electric-sql/pglite': 'commonjs @electric-sql/pglite',
                },
            ]
        }
        return config
    },
    transpilePackages: ['@0glabs/0g-serving-broker'],
    output: 'standalone',
}

export default nextConfig
