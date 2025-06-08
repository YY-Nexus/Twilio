interface SessionConfig {
  maxAge: number // 会话最大存活时间（毫秒）
  idleTimeout: number // 空闲超时时间（毫秒）
  warningTime: number // 超时警告时间（毫秒）
  extendOnActivity: boolean // 是否在活动时延长会话
}

interface SessionData {
  userId: string
  createdAt: number
  lastActivity: number
  expiresAt: number
  isActive: boolean
}

export class SessionManager {
  private static readonly DEFAULT_CONFIG: SessionConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    idleTimeout: 30 * 60 * 1000, // 30分钟空闲超时
    warningTime: 5 * 60 * 1000, // 5分钟警告
    extendOnActivity: true,
  }

  private static sessions: Map<string, SessionData> = new Map()
  private static config: SessionConfig = this.DEFAULT_CONFIG

  // 设置配置
  static setConfig(config: Partial<SessionConfig>) {
    this.config = { ...this.DEFAULT_CONFIG, ...config }
  }

  // 创建会话
  static createSession(userId: string): string {
    const sessionId = this.generateSessionId()
    const now = Date.now()

    const sessionData: SessionData = {
      userId,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.config.maxAge,
      isActive: true,
    }

    this.sessions.set(sessionId, sessionData)
    return sessionId
  }

  // 验证会话
  static validateSession(sessionId: string): {
    valid: boolean
    session?: SessionData
    reason?: string
    timeUntilExpiry?: number
    shouldWarn?: boolean
  } {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return { valid: false, reason: "会话不存在" }
    }

    if (!session.isActive) {
      return { valid: false, reason: "会话已被禁用" }
    }

    const now = Date.now()

    // 检查绝对过期时间
    if (now > session.expiresAt) {
      this.destroySession(sessionId)
      return { valid: false, reason: "会话已过期" }
    }

    // 检查空闲超时
    const idleTime = now - session.lastActivity
    if (idleTime > this.config.idleTimeout) {
      this.destroySession(sessionId)
      return { valid: false, reason: "会话因空闲而超时" }
    }

    // 检查是否需要警告
    const timeUntilIdleExpiry = this.config.idleTimeout - idleTime
    const shouldWarn = timeUntilIdleExpiry <= this.config.warningTime

    // 更新最后活动时间
    if (this.config.extendOnActivity) {
      session.lastActivity = now
    }

    return {
      valid: true,
      session,
      timeUntilExpiry: Math.min(session.expiresAt - now, timeUntilIdleExpiry),
      shouldWarn,
    }
  }

  // 更新会话活动
  static updateActivity(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      return false
    }

    session.lastActivity = Date.now()
    return true
  }

  // 延长会话
  static extendSession(sessionId: string, additionalTime?: number): boolean {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      return false
    }

    const extension = additionalTime || this.config.idleTimeout
    session.lastActivity = Date.now()
    session.expiresAt = Math.min(session.expiresAt, Date.now() + extension)

    return true
  }

  // 销毁会话
  static destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  // 销毁用户的所有会话
  static destroyUserSessions(userId: string): number {
    let count = 0
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId)
        count++
      }
    }
    return count
  }

  // 获取会话信息
  static getSessionInfo(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) || null
  }

  // 获取用户的所有活跃会话
  static getUserSessions(userId: string): Array<{ sessionId: string; session: SessionData }> {
    const userSessions: Array<{ sessionId: string; session: SessionData }> = []

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && session.isActive) {
        userSessions.push({ sessionId, session })
      }
    }

    return userSessions
  }

  // 清理过期会话
  static cleanupExpiredSessions(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [sessionId, session] of this.sessions.entries()) {
      const idleTime = now - session.lastActivity
      if (now > session.expiresAt || idleTime > this.config.idleTimeout) {
        this.sessions.delete(sessionId)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  // 生成会话ID
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取统计信息
  static getStats(): {
    totalSessions: number
    activeSessions: number
    expiredSessions: number
  } {
    const now = Date.now()
    let activeSessions = 0
    let expiredSessions = 0

    for (const session of this.sessions.values()) {
      const idleTime = now - session.lastActivity
      if (session.isActive && now <= session.expiresAt && idleTime <= this.config.idleTimeout) {
        activeSessions++
      } else {
        expiredSessions++
      }
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      expiredSessions,
    }
  }
}

// 定期清理过期会话
setInterval(
  () => {
    const cleaned = SessionManager.cleanupExpiredSessions()
    if (cleaned > 0) {
      console.log(`🧹 清理了 ${cleaned} 个过期会话`)
    }
  },
  5 * 60 * 1000,
) // 每5分钟清理一次

console.log("⏰ 会话超时管理服务已初始化")
