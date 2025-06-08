import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"
import { AuditLogger } from "@/lib/audit-logger"

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const user = await AuthService.getCurrentUser()
    if (!user || !user.permissions.includes("*")) {
      return NextResponse.json({ success: false, message: "权限不足" }, { status: 403 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const filters = {
      userId: searchParams.get("userId") || undefined,
      action: searchParams.get("action") || undefined,
      category: searchParams.get("category") || undefined,
      severity: searchParams.get("severity") || undefined,
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: Number.parseInt(searchParams.get("limit") || "50"),
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
    }

    // 查询审计日志
    const result = await AuditLogger.queryLogs(filters)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("查询审计日志错误:", error)
    return NextResponse.json({ success: false, message: "查询失败" }, { status: 500 })
  }
}
