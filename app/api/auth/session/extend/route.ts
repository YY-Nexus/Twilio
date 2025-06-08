import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"
import { SessionManager } from "@/lib/session-manager"
import { AuditLogger, extractRequestInfo } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    // 获取会话ID
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "会话不存在" }, { status: 401 })
    }

    // 延长会话
    const extended = SessionManager.extendSession(sessionId)

    if (!extended) {
      return NextResponse.json({ success: false, message: "延长会话失败" }, { status: 400 })
    }

    // 记录审计日志
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await AuditLogger.log({
      userId: user.id,
      userEmail: user.email,
      action: "SESSION_EXTEND",
      resource: "session",
      resourceId: sessionId,
      details: {},
      ipAddress,
      userAgent,
      success: true,
      severity: "low",
      category: "auth",
    })

    return NextResponse.json({
      success: true,
      message: "会话已延长",
    })
  } catch (error) {
    console.error("延长会话错误:", error)
    return NextResponse.json({ success: false, message: "延长会话失败" }, { status: 500 })
  }
}
