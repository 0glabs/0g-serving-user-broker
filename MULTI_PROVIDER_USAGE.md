# 多 Provider 负载均衡使用指南

## 概述

本 SDK 现在支持多 provider 负载均衡，可以将推理请求分发到多个 provider，同时确保每个对话的 chat 和 verify 操作使用相同的 provider。

## 功能特性

- ✅ **负载均衡**: 支持轮询、最少连接、加权轮询三种策略
- ✅ **高可用**: Provider 故障时自动切换
- ✅ **一致性**: Chat 和 verify 使用相同 provider
- ✅ **健康检查**: 自动监控 provider 健康状态
- ✅ **会话管理**: 基于请求 ID 的会话跟踪
- ✅ **重试机制**: 失败时自动重试其他 provider

## 快速开始

### 1. 基本用法

```typescript
import { runMultiProviderInferenceServer } from './src.ts/example/multi-provider-inference-server'

const options = {
    providers: [
        "0x1234567890123456789012345678901234567890",
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        "0x9876543210987654321098765432109876543210"
    ],
    strategy: 'round-robin', // 'least-connections' | 'weighted-round-robin'
    port: 3001,
    host: '0.0.0.0',
    healthCheckInterval: 30000, // 30 秒
    maxRetries: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 分钟
}

await runMultiProviderInferenceServer(options)
```

### 2. 环境变量配置

```bash
# 私钥 (必需)
export ZG_PRIVATE_KEY="your-private-key"

# RPC 端点 (可选，默认使用 testnet)
export RPC_ENDPOINT="your-rpc-endpoint"
```

### 3. 运行示例

```bash
# 编译项目
npm run build

# 运行多 provider 服务器示例
node lib.commonjs/example/multi-provider-example.js

# 运行负载均衡测试
node lib.commonjs/example/test-load-balancer.js
```

## API 接口

### Chat Completions

```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "max_tokens": 100
  }'
```

响应头会包含使用的 provider 地址：
```
X-Provider-Address: 0x1234567890123456789012345678901234567890
```

### Verify

```bash
curl -X POST http://localhost:3001/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "id": "chatcmpl-7QyqpwdfhqwajicIEznoc6Q47XAyW"
  }'
```

### 健康检查

```bash
curl http://localhost:3001/health
```

响应示例：
```json
{
  "status": "healthy",
  "loadBalancer": {
    "totalProviders": 3,
    "healthyProviders": 2,
    "totalConnections": 5,
    "activeSessions": 3,
    "providers": [
      {
        "address": "0x1234...",
        "endpoint": "https://provider1.example.com",
        "model": "llama-2-7b-chat",
        "isHealthy": true,
        "connections": 2,
        "lastHealthCheck": 1700000000000
      }
    ]
  }
}
```

### 管理接口

```bash
# 查看所有 provider 状态
curl http://localhost:3001/admin/providers
```

## 负载均衡策略

### 1. 轮询 (Round Robin)
按顺序依次分配请求到每个健康的 provider。

```typescript
{
  strategy: 'round-robin'
}
```

### 2. 最少连接 (Least Connections)
将请求分配给当前连接数最少的 provider。

```typescript
{
  strategy: 'least-connections'
}
```

### 3. 加权轮询 (Weighted Round Robin)
根据 provider 的权重分配请求（目前所有 provider 权重相等）。

```typescript
{
  strategy: 'weighted-round-robin'
}
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `providers` | `string[]` | - | Provider 地址列表（必需） |
| `strategy` | `string` | `'round-robin'` | 负载均衡策略 |
| `healthCheckInterval` | `number` | `30000` | 健康检查间隔（毫秒） |
| `maxRetries` | `number` | `3` | 最大重试次数 |
| `sessionTimeout` | `number` | `1800000` | 会话超时时间（毫秒） |
| `port` | `number` | `3000` | 服务器端口 |
| `host` | `string` | `'0.0.0.0'` | 服务器主机 |
| `key` | `string` | - | 钱包私钥 |
| `rpc` | `string` | - | RPC 端点 |

## 工作原理

### 1. 会话一致性

```
Request 1: Chat    -> Provider A -> Response ID: chat-123
Request 2: Verify  -> Provider A (same as chat) -> Verification result
```

系统通过以下机制确保一致性：
- 每个 chat 响应都会缓存使用的 provider 信息
- verify 请求根据响应 ID 查找对应的 provider
- 使用相同的 provider 进行验证

### 2. 故障处理

```
1. Health checker 检测到 Provider A 不可用
2. 标记 Provider A 为不健康状态
3. 新请求路由到其他健康的 provider
4. 定期重新检查 Provider A 的健康状态
```

### 3. 重试逻辑

```
1. 请求发送到 Provider A 失败
2. 将 Provider A 加入排除列表
3. 选择其他 provider 重试
4. 最多重试 maxRetries 次
```

## 监控和调试

### 1. 日志输出

服务器会输出详细的日志信息：
```
🚀 Multi-provider inference server is running on 0.0.0.0:3001
📊 Load balancing strategy: round-robin
🔧 Providers configured: 3
💚 Healthy providers: 2
```

### 2. 健康状态监控

定期检查 `/health` 端点获取系统状态：
- 总 provider 数量
- 健康 provider 数量
- 当前连接数
- 活跃会话数

### 3. Provider 状态

每个 provider 的详细信息：
- 地址和端点
- 模型信息
- 健康状态
- 当前连接数
- 最后健康检查时间

## 最佳实践

### 1. Provider 选择
- 选择地理位置相近的 provider 以减少延迟
- 确保所有 provider 使用相同或兼容的模型
- 配置足够的 provider 数量以实现真正的负载分散

### 2. 配置调优
- 根据网络环境调整健康检查间隔
- 根据服务质量要求调整重试次数
- 根据业务需求调整会话超时时间

### 3. 监控和维护
- 定期检查 provider 健康状态
- 监控负载分布是否均匀
- 及时处理不健康的 provider

## 故障排除

### 1. Provider 初始化失败
```
Error: Failed to initialize provider 0x1234...
```
- 检查 provider 地址是否正确
- 确认私钥有足够权限访问该 provider
- 验证网络连接

### 2. 健康检查失败
```
Health check failed for provider 0x1234...
```
- 检查 provider 端点是否可访问
- 验证 `/models` 端点是否正常响应
- 检查防火墙设置

### 3. Verify 失败
```
Error: No cached content for this id
```
- 确认响应 ID 正确
- 检查缓存是否过期
- 验证使用的 provider 仍然健康

## 性能考虑

### 1. 连接池
每个 provider 维护独立的连接，避免连接竞争。

### 2. 缓存策略
响应内容缓存 5-10 分钟，平衡内存使用和验证需求。

### 3. 健康检查
健康检查间隔应该平衡及时性和网络开销。

## 升级指南

如果你正在使用单 provider 的版本，升级步骤：

1. **配置更新**: 将单个 provider 配置改为数组
2. **代码更新**: 使用新的 `runMultiProviderInferenceServer` 函数
3. **测试验证**: 使用测试脚本验证负载均衡功能

### 向后兼容性

新版本完全兼容原有的 API 接口，只需要更新配置即可。