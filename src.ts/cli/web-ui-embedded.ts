#!/usr/bin/env ts-node

import type { Command } from 'commander'
import { spawn } from 'child_process'
import path from 'path'
import { existsSync } from 'fs'

export default function webUIEmbedded(program: Command) {
    program
        .command('start-web')
        .description('Start the embedded web UI')
        .option(
            '--port <port>',
            'Port to run the web UI on',
            '3000'
        )
        .option(
            '--host <host>',
            'Host to bind the web UI',
            'localhost'
        )
        .action(async (options) => {
            // 查找嵌入的 Web UI
            const embeddedUIPath = path.join(__dirname, '../../web-ui');
            
            if (!existsSync(embeddedUIPath)) {
                console.error('❌ Embedded Web UI not found.');
                console.error('This usually means the package was not built correctly.');
                console.error('Please run: npm run build');
                process.exit(1);
            }
            
            if (!existsSync(path.join(embeddedUIPath, 'package.json'))) {
                console.error('❌ Invalid embedded Web UI structure.');
                process.exit(1);
            }
            
            console.log('🚀 Starting embedded 0G Compute Web UI...');
            console.log(`📁 Using embedded UI at: ${embeddedUIPath}`);
            console.log(`🌐 Starting server on http://${options.host}:${options.port}`);
            
            // 检查 node_modules 是否存在，如果不存在则安装依赖
            const nodeModulesPath = path.join(embeddedUIPath, 'node_modules');
            if (!existsSync(nodeModulesPath)) {
                console.log('📦 Installing dependencies for embedded UI...');
                try {
                    await new Promise((resolve, reject) => {
                        const installProcess = spawn('npm', ['install'], {
                            cwd: embeddedUIPath,
                            stdio: 'inherit'
                        });
                        
                        installProcess.on('close', (code) => {
                            if (code === 0) resolve(undefined);
                            else reject(new Error(`npm install failed with code ${code}`));
                        });
                    });
                } catch (error: any) {
                    console.error('❌ Failed to install dependencies:', error.message);
                    process.exit(1);
                }
            }
            
            // 启动 Next.js 开发服务器
            const nextProcess = spawn('npx', ['next', 'dev', '--port', options.port, '--hostname', options.host], {
                cwd: embeddedUIPath,
                stdio: 'inherit'
            });
            
            nextProcess.on('error', (err) => {
                console.error('❌ Failed to start Web UI:', err);
                process.exit(1);
            });
            
            // 处理退出信号
            process.on('SIGINT', () => {
                console.log('\n🛑 Stopping Web UI...');
                nextProcess.kill('SIGINT');
                process.exit(0);
            });
            
            process.on('SIGTERM', () => {
                nextProcess.kill('SIGTERM');
                process.exit(0);
            });
        })
}