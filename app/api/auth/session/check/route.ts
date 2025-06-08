import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"
import { SessionManager } from "@/lib/session-manager"

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    // 从Cookie获取会话ID（这里简化处理，实际应用中可能需要更复杂的会话管理）
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "会话不存在" }, { status: 401 })
    }

    // 验证会话
    const validation = SessionManager.validateSession(sessionId)

    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.reason }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        timeUntilExpiry: validation.timeUntilExpiry,
        shouldWarn: validation.shouldWarn,
        session: validation.session,
      },
    })
  } catch (error) {
    console.error("检查会话错误:", error)
    return NextResponse.json({ success: false, message: "检查会话失败" }, { status: 500 })
  }
}
