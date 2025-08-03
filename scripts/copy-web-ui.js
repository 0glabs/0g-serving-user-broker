#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Copying complete Web UI for embedding in npm package...');

// 1. 源项目路径
const sourceWebUIPath = path.join(__dirname, '../../0g-compute-network-starter-kit/0g-compute-web-example');
const outputPath = path.join(__dirname, '../web-ui');

// 2. 检查源项目是否存在
if (!fs.existsSync(sourceWebUIPath)) {
    console.error(`❌ Source Web UI project not found at: ${sourceWebUIPath}`);
    console.error('Please ensure the web UI project exists');
    process.exit(1);
}

// 3. 清理输出目录
if (fs.existsSync(outputPath)) {
    fs.rmSync(outputPath, { recursive: true, force: true });
}
fs.mkdirSync(outputPath, { recursive: true });

console.log('📁 Copying Web UI files...');

// 4. 复制必要的文件和目录
const directoriesToCopy = ['src', 'public'];
const filesToCopyDirect = ['package.json', 'tsconfig.json', 'tailwind.config.ts', 'postcss.config.mjs', '.eslintrc.json'];

// 复制目录
directoriesToCopy.forEach(dir => {
    const srcPath = path.join(sourceWebUIPath, dir);
    const destPath = path.join(outputPath, dir);
    if (fs.existsSync(srcPath)) {
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`✅ Copied ${dir}/`);
    }
});

// 复制文件
filesToCopyDirect.forEach(file => {
    const srcPath = path.join(sourceWebUIPath, file);
    const destPath = path.join(outputPath, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
    }
});

// 复制根目录的 Providers.tsx 如果存在
const providersPath = path.join(sourceWebUIPath, 'Providers.tsx');
if (fs.existsSync(providersPath)) {
    fs.copyFileSync(providersPath, path.join(outputPath, 'Providers.tsx'));
    console.log(`✅ Copied Providers.tsx`);
}

// 5. 修改 package.json 以解决依赖冲突
const packageJsonPath = path.join(outputPath, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    // 更新包名和版本
    packageJson.name = '0g-compute-web-ui-embedded';
    packageJson.private = true;
    
    // 使用与 broker 相同的 ethers 版本
    if (packageJson.dependencies && packageJson.dependencies.ethers) {
        packageJson.dependencies.ethers = '^6.13.1';
        console.log('✅ Updated ethers version to match broker');
    }
    
    // 添加解决方案部分来处理版本冲突
    packageJson.overrides = {
        "ethers": "^6.13.1"
    };
    
    packageJson.resolutions = {
        "ethers": "^6.13.1"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json for embedding');
}

// 6. 创建适合嵌入的 next.config.mjs
const nextConfigContent = `/** @type {import('next').NextConfig} */
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
    experimental: {
        esmExternals: 'loose',
    }
}

export default nextConfig
`;

fs.writeFileSync(path.join(outputPath, 'next.config.mjs'), nextConfigContent);
console.log('✅ Created optimized next.config.mjs');

// 7. 创建启动说明
const readmeContent = `# 0G Compute Network Web UI (Embedded)

This is the embedded version of the 0G Compute Network Web UI.

## Usage

This Web UI is automatically started when you run:

\`\`\`bash
0g-compute-cli start-web
\`\`\`

## Features

- 💰 Ledger management
- 🧠 Inference operations  
- 🔧 Fine-tuning
- 🌐 Web3 wallet integration

## Development

If you want to develop on this UI:

\`\`\`bash
cd web-ui
npm install
npm run dev
\`\`\`
`;

fs.writeFileSync(path.join(outputPath, 'README.md'), readmeContent);

console.log('✅ Complete Web UI copied successfully!');
console.log(`📁 Output directory: ${outputPath}`);
console.log('🚀 This includes all your existing functionality!');
console.log('🔧 Modified for embedding compatibility');