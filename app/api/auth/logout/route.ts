import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    // 清除认证Cookie
    AuthService.clearAuthCookies()

    return NextResponse.json({
      success: true,
      message: "登出成功",
    })
  } catch (error) {
    console.error("登出错误:", error)
    return NextResponse.json({ success: false, message: "登出失败" }, { status: 500 })
  }
}
