import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limiter"

export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const identifier = getClientIdentifier(request)
    const rateLimit = rateLimiters.login.checkLimit(identifier)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: rateLimit.message,
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    const { email, password } = await request.json()

    // 验证输入
    if (!email || !password) {
      // 记录失败请求
      rateLimiters.login.recordResult(identifier, false)
      return NextResponse.json({ success: false, message: "邮箱和密码不能为空" }, { status: 400 })
    }

    // 模拟用户数据查询
    const mockUsers = [
      {
        id: "1",
        email: "admin@example.com",
        password: await AuthService.hashPassword("admin123"),
        role: "admin",
        permissions: ["*"],
      },
      {
        id: "2",
        email: "manager@example.com",
        password: await AuthService.hashPassword("manager123"),
        role: "manager",
        permissions: ["users.view", "products.view", "orders.view"],
      },
      {
        id: "3",
        email: "user@example.com",
        password: await AuthService.hashPassword("user123"),
        role: "user",
        permissions: ["products.view"],
      },
    ]

    // 查找用户
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      rateLimiters.login.recordResult(identifier, false)
      return NextResponse.json({ success: false, message: "用户不存在" }, { status: 401 })
    }

    // 验证密码
    const isValidPassword = await AuthService.verifyPassword(password, user.password)
    if (!isValidPassword) {
      rateLimiters.login.recordResult(identifier, false)
      return NextResponse.json({ success: false, message: "密码错误" }, { status: 401 })
    }

    // 生成令牌
    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    }

    const accessToken = AuthService.generateAccessToken(userPayload)
    const refreshToken = AuthService.generateRefreshToken(user.id)

    // 设置安全Cookie
    AuthService.setAuthCookies(accessToken, refreshToken)

    // 记录成功请求
    rateLimiters.login.recordResult(identifier, true)

    const response = NextResponse.json({
      success: true,
      message: "登录成功",
      data: {
        user: userPayload,
        accessToken,
      },
    })

    // 添加速率限制头
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString())
    response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString())

    return response
  } catch (error) {
    console.error("登录错误:", error)
    return NextResponse.json({ success: false, message: "登录失败，请稍后重试" }, { status: 500 })
  }
}
