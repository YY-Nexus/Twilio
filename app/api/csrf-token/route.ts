import { type NextRequest, NextResponse } from "next/server"
import { CSRFProtection } from "@/lib/csrf-protection"
import { AuditLogger, extractRequestInfo } from "@/lib/audit-logger"

export async function GET(request: NextRequest) {
  try {
    // 生成并设置CSRF令牌
    const token = CSRFProtection.setCSRFToken()

    // 记录CSRF令牌生成（可选的审计日志）
    const { ipAddress, userAgent } = extractRequestInfo(request)
    await AuditLogger.log({
      action: "CSRF_TOKEN_GENERATED",
      resource: "security",
      details: { tokenLength: token.length },
      ipAddress,
      userAgent,
      success: true,
      severity: "low",
      category: "security",
    })

    return NextResponse.json({
      success: true,
      data: {
        csrfToken: token,
        expiresIn: 24 * 60 * 60 * 1000, // 24小时（毫秒）
      },
    })
  } catch (error) {
    console.error("生成CSRF令牌错误:", error)
    return NextResponse.json({ success: false, message: "生成CSRF令牌失败" }, { status: 500 })
  }
}

// 刷新CSRF令牌
export async function POST(request: NextRequest) {
  try {
    // 清除旧令牌
    CSRFProtection.clearCSRFToken()

    // 生成新令牌
    const token = CSRFProtection.setCSRFToken()

    const { ipAddress, userAgent } = extractRequestInfo(request)
    await AuditLogger.log({
      action: "CSRF_TOKEN_REFRESHED",
      resource: "security",
      details: {},
      ipAddress,
      userAgent,
      success: true,
      severity: "low",
      category: "security",
    })

    return NextResponse.json({
      success: true,
      data: {
        csrfToken: token,
        message: "CSRF令牌已刷新",
      },
    })
  } catch (error) {
    console.error("刷新CSRF令牌错误:", error)
    return NextResponse.json({ success: false, message: "刷新CSRF令牌失败" }, { status: 500 })
  }
}
