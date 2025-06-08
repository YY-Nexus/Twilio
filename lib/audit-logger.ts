interface AuditLogEntry {
  id: string
  timestamp: Date
  userId?: string
  userEmail?: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
  severity: "low" | "medium" | "high" | "critical"
  category: "auth" | "data" | "system" | "security" | "admin"
}

export class AuditLogger {
  private static logs: AuditLogEntry[] = []

  // 记录审计日志
  static async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ...entry,
    }

    // 存储到内存（实际应用中应存储到数据库）
    this.logs.push(logEntry)

    // 如果是高危操作，立即处理
    if (entry.severity === "critical" || entry.severity === "high") {
      await this.handleHighSeverityLog(logEntry)
    }

    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === "development") {
      console.log(`🔍 [AUDIT] ${entry.action} - ${entry.success ? "SUCCESS" : "FAILED"}`, logEntry)
    }

    // 实际应用中应该：
    // 1. 存储到数据库
    // 2. 发送到日志聚合服务（如ELK Stack）
    // 3. 触发安全告警（如果需要）
  }

  // 处理高危日志
  private static async handleHighSeverityLog(entry: AuditLogEntry): Promise<void> {
    // 发送安全告警
    console.warn(`🚨 [SECURITY ALERT] ${entry.action}`, {
      user: entry.userEmail,
      ip: entry.ipAddress,
      details: entry.details,
    })

    // 实际应用中可以：
    // 1. 发送邮件通知管理员
    // 2. 发送到安全监控系统
    // 3. 触发自动安全响应
  }

  // 生成唯一ID
  private static generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 查询审计日志
  static async queryLogs(filters: {
    userId?: string
    action?: string
    category?: string
    startDate?: Date
    endDate?: Date
    severity?: string
    page?: number
    limit?: number
  }): Promise<{ logs: AuditLogEntry[]; total: number }> {
    let filteredLogs = [...this.logs]

    // 应用过滤器
    if (filters.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId)
    }
    if (filters.action) {
      filteredLogs = filteredLogs.filter((log) => log.action.includes(filters.action))
    }
    if (filters.category) {
      filteredLogs = filteredLogs.filter((log) => log.category === filters.category)
    }
    if (filters.severity) {
      filteredLogs = filteredLogs.filter((log) => log.severity === filters.severity)
    }
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= filters.startDate!)
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= filters.endDate!)
    }

    // 排序（最新的在前）
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // 分页
    const page = filters.page || 1
    const limit = filters.limit || 50
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      logs: filteredLogs.slice(startIndex, endIndex),
      total: filteredLogs.length,
    }
  }

  // 预定义的审计操作
  static async logUserLogin(
    userId: string,
    userEmail: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    errorMessage?: string,
  ) {
    await this.log({
      userId,
      userEmail,
      action: "USER_LOGIN",
      resource: "authentication",
      details: { method: "password" },
      ipAddress,
      userAgent,
      success,
      errorMessage,
      severity: success ? "low" : "medium",
      category: "auth",
    })
  }

  static async logUserLogout(userId: string, userEmail: string, ipAddress: string, userAgent: string) {
    await this.log({
      userId,
      userEmail,
      action: "USER_LOGOUT",
      resource: "authentication",
      details: {},
      ipAddress,
      userAgent,
      success: true,
      severity: "low",
      category: "auth",
    })
  }

  static async logPasswordChange(userId: string, userEmail: string, ipAddress: string, userAgent: string) {
    await this.log({
      userId,
      userEmail,
      action: "PASSWORD_CHANGE",
      resource: "user_account",
      resourceId: userId,
      details: {},
      ipAddress,
      userAgent,
      success: true,
      severity: "medium",
      category: "security",
    })
  }

  static async log2FASetup(userId: string, userEmail: string, ipAddress: string, userAgent: string) {
    await this.log({
      userId,
      userEmail,
      action: "2FA_SETUP",
      resource: "user_account",
      resourceId: userId,
      details: {},
      ipAddress,
      userAgent,
      success: true,
      severity: "medium",
      category: "security",
    })
  }

  static async logDataAccess(
    userId: string,
    userEmail: string,
    resource: string,
    resourceId: string,
    action: string,
    ipAddress: string,
    userAgent: string,
  ) {
    await this.log({
      userId,
      userEmail,
      action: `DATA_${action.toUpperCase()}`,
      resource,
      resourceId,
      details: {},
      ipAddress,
      userAgent,
      success: true,
      severity: "low",
      category: "data",
    })
  }

  static async logAdminAction(
    userId: string,
    userEmail: string,
    action: string,
    targetResource: string,
    targetId: string,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string,
  ) {
    await this.log({
      userId,
      userEmail,
      action: `ADMIN_${action.toUpperCase()}`,
      resource: targetResource,
      resourceId: targetId,
      details,
      ipAddress,
      userAgent,
      success: true,
      severity: "high",
      category: "admin",
    })
  }

  static async logSecurityEvent(
    action: string,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string,
    userId?: string,
    userEmail?: string,
  ) {
    await this.log({
      userId,
      userEmail,
      action: `SECURITY_${action.toUpperCase()}`,
      resource: "security",
      details,
      ipAddress,
      userAgent,
      success: false,
      severity: "critical",
      category: "security",
    })
  }
}

// 辅助函数：从请求中提取信息
export function extractRequestInfo(request: Request): {
  ipAddress: string
  userAgent: string
} {
  const forwarded = request.headers.get("x-forwarded-for")
  const ipAddress = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"

  return { ipAddress, userAgent }
}

console.log("📋 安全审计日志服务已初始化")
