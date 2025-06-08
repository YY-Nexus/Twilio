interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求次数
  message?: string // 限制消息
  skipSuccessfulRequests?: boolean // 是否跳过成功请求
  skipFailedRequests?: boolean // 是否跳过失败请求
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
    blocked: boolean
  }
}

export class RateLimiter {
  private store: RateLimitStore = {}
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      message: "请求过于频繁，请稍后再试",
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    }

    // 定期清理过期记录
    setInterval(() => this.cleanup(), 60000) // 每分钟清理一次
  }

  // 检查是否超出限制
  checkLimit(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    message?: string
  } {
    const now = Date.now()
    const record = this.store[identifier]

    // 如果没有记录或已过期，创建新记录
    if (!record || now > record.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
        blocked: false,
      }

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: this.store[identifier].resetTime,
      }
    }

    // 检查是否被阻止
    if (record.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        message: this.config.message,
      }
    }

    // 增加计数
    record.count++

    // 检查是否超出限制
    if (record.count > this.config.maxRequests) {
      record.blocked = true
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        message: this.config.message,
      }
    }

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    }
  }

  // 记录请求结果（用于跳过成功/失败请求的配置）
  recordResult(identifier: string, success: boolean) {
    const record = this.store[identifier]
    if (!record) return

    if ((success && this.config.skipSuccessfulRequests) || (!success && this.config.skipFailedRequests)) {
      record.count = Math.max(0, record.count - 1)
      if (record.count <= this.config.maxRequests) {
        record.blocked = false
      }
    }
  }

  // 清理过期记录
  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  // 重置特定标识符的限制
  reset(identifier: string) {
    delete this.store[identifier]
  }

  // 获取当前状态
  getStatus(identifier: string) {
    return this.store[identifier] || null
  }
}

// 预定义的限制器
export const rateLimiters = {
  // 登录限制：每15分钟最多5次尝试
  login: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: "登录尝试过于频繁，请15分钟后再试",
  }),

  // API通用限制：每分钟最多100次请求
  api: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: "API请求过于频繁，请稍后再试",
  }),

  // 注册限制：每小时最多3次注册
  register: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: "注册请求过于频繁，请1小时后再试",
  }),

  // 密码重置限制：每小时最多3次
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: "密码重置请求过于频繁，请1小时后再试",
  }),

  // 2FA验证限制：每5分钟最多10次尝试
  twoFactor: new RateLimiter({
    windowMs: 5 * 60 * 1000,
    maxRequests: 10,
    message: "2FA验证尝试过于频繁，请5分钟后再试",
  }),
}

// 获取客户端标识符
export function getClientIdentifier(request: Request): string {
  // 优先使用用户ID（如果已登录）
  const userId = request.headers.get("x-user-id")
  if (userId) {
    return `user:${userId}`
  }

  // 使用IP地址
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

  return `ip:${ip}`
}

console.log("🚦 API速率限制服务已初始化")
