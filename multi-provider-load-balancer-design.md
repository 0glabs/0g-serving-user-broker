# 多 Provider 负载均衡设计文档

## 概述

本设计旨在扩展现有的 0G Serving SDK，使其支持多个 provider 的负载均衡，同时确保每个请求的 chat 和对应的 verify 操作使用相同的 provider。

## 当前架构分析

### 现有流程
1. **单 Provider 模式**: 当前 inference server 只支持单个 provider
2. **请求流程**: 
   - `/v1/chat/completions` 使用指定的 provider 进行推理
   - 响应内容被缓存到本地 cache，key 为 response ID
   - `/v1/verify` 使用相同的 provider 验证缓存的内容
3. **关键约束**: verify 必须使用与 chat 相同的 provider，因为签名验证需要对应的 provider 签名地址

## 设计目标

1. **负载均衡**: 支持多个 provider，请求可以分发到不同的 provider
2. **一致性**: 确保同一次对话的 chat 和 verify 使用相同的 provider
3. **高可用**: provider 故障时自动切换到其他可用 provider
4. **兼容性**: 保持现有 API 接口不变
5. **监控**: 支持 provider 健康状态监控

## 架构设计

### 1. 负载均衡器组件

```typescript
interface LoadBalancerOptions {
    providers: string[]  // provider 地址列表
    strategy: 'round-robin' | 'least-connections' | 'weighted-round-robin'
    healthCheckInterval: number  // 健康检查间隔（ms）
    maxRetries: number  // 最大重试次数
}

class ProviderLoadBalancer {
    private providers: ProviderInfo[]
    private strategy: LoadBalancingStrategy
    private sessionMap: Map<string, string>  // sessionId -> providerAddress
    private healthChecker: HealthChecker
}
```

### 2. Provider 信息管理

```typescript
interface ProviderInfo {
    address: string
    endpoint: string
    model: string
    isHealthy: boolean
    connections: number  // 当前连接数
    weight: number      // 权重（用于加权轮询）
    lastHealthCheck: number
}
```

### 3. 会话管理

```typescript
interface SessionInfo {
    sessionId: string
    providerAddress: string
    requestIds: string[]  // 关联的请求 ID 列表
    createdAt: number
    lastActivity: number
}

class SessionManager {
    private sessions: Map<string, SessionInfo>
    
    // 为请求分配 provider，返回 session ID
    assignProvider(requestId: string): { sessionId: string, providerAddress: string }
    
    // 根据请求 ID 获取对应的 provider
    getProviderForRequest(requestId: string): string
    
    // 清理过期会话
    cleanupExpiredSessions(): void
}
```

### 4. 健康检查机制

```typescript
class HealthChecker {
    private checkProvider(provider: ProviderInfo): Promise<boolean>
    private scheduleHealthCheck(): void
    private markProviderUnhealthy(providerAddress: string): void
    private markProviderHealthy(providerAddress: string): void
}
```

## 核心流程设计

### 1. 初始化流程
```
1. 读取 provider 配置列表
2. 为每个 provider 初始化 broker 连接
3. 启动健康检查服务
4. 初始化负载均衡策略
```

### 2. Chat 请求流程
```
1. 接收 /v1/chat/completions 请求
2. 生成或获取 session ID（基于客户端标识或新建）
3. 负载均衡器选择可用的 provider
4. 将 session ID 与 provider 绑定
5. 使用选定的 provider 处理请求
6. 缓存响应内容，key 为 response ID，value 包含 provider 信息
7. 返回响应
```

### 3. Verify 请求流程
```
1. 接收 /v1/verify 请求（包含 response ID）
2. 从 cache 中获取响应内容和对应的 provider 信息
3. 使用相同的 provider 进行 verify 操作
4. 返回验证结果
```

### 4. 故障切换流程
```
1. 健康检查发现 provider 不可用
2. 标记 provider 为不健康状态
3. 新请求不再路由到该 provider
4. 现有会话的后续请求会尝试重试或返回错误
5. 定期重新检查不健康的 provider
```

## 负载均衡策略

### 1. 轮询 (Round Robin)
按顺序依次分配请求到每个健康的 provider

### 2. 最少连接 (Least Connections)
将请求分配给当前连接数最少的 provider

### 3. 加权轮询 (Weighted Round Robin)
根据 provider 的权重分配请求

## 缓存策略优化

```typescript
interface CacheEntry {
    content: string
    providerAddress: string  // 新增：记录使用的 provider
    sessionId: string        // 新增：关联的会话 ID
    timestamp: number
}
```

## 配置示例

```typescript
const loadBalancerConfig: LoadBalancerOptions = {
    providers: [
        "0x1234567890123456789012345678901234567890",
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        "0x9876543210987654321098765432109876543210"
    ],
    strategy: 'round-robin',
    healthCheckInterval: 30000,  // 30秒
    maxRetries: 3
}
```

## API 接口变更

### 现有接口保持不变
- `/v1/chat/completions` - 保持现有行为
- `/v1/verify` - 保持现有行为

### 新增管理接口（可选）
- `GET /admin/providers` - 获取 provider 状态
- `POST /admin/providers/{address}/enable` - 启用 provider
- `POST /admin/providers/{address}/disable` - 禁用 provider

## 监控指标

1. **Provider 指标**
   - 健康状态
   - 响应时间
   - 成功/失败请求数
   - 当前连接数

2. **负载均衡指标**
   - 请求分发统计
   - 故障切换次数
   - 会话分布

3. **系统指标**
   - 总请求数
   - 平均响应时间
   - 错误率

## 实现细节

### 会话标识策略
1. **基于客户端 IP + User-Agent**: 简单但可能冲突
2. **基于请求头中的会话 ID**: 需要客户端支持
3. **基于响应 ID**: 每个响应的 ID 都记录对应的 provider

### 容错机制
1. **超时处理**: 请求超时后自动重试其他 provider
2. **降级策略**: 当所有 provider 都不可用时的处理方式
3. **熔断机制**: 防止持续向故障 provider 发送请求

## 部署考虑

1. **配置管理**: 支持动态配置 provider 列表
2. **日志记录**: 详细记录负载均衡决策和故障信息
3. **性能优化**: 连接池管理，减少 provider 连接开销

## 风险评估

1. **数据一致性**: 确保 chat 和 verify 使用相同 provider
2. **会话管理复杂性**: 需要妥善处理会话生命周期
3. **故障恢复**: 需要完善的故障检测和恢复机制
4. **性能影响**: 负载均衡逻辑不应显著影响响应时间