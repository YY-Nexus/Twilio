import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "未登录或令牌已过期" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("获取用户信息错误:", error)
    return NextResponse.json({ success: false, message: "获取用户信息失败" }, { status: 500 })
  }
}
