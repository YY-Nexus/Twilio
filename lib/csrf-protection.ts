import crypto from "crypto"
import { cookies } from "next/headers"

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly COOKIE_NAME = "csrf_token"
  private static readonly HEADER_NAME = "x-csrf-token"
  private static readonly SECRET_KEY = process.env.CUSTOM_KEY!

  // 生成CSRF令牌
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString("hex")
  }

  // 生成带签名的CSRF令牌（增强安全性）
  static generateSignedToken(): { token: string; signature: string } {
    const token = this.generateToken()
    const signature = crypto.createHmac("sha256", this.SECRET_KEY).update(token).digest("hex")

    return { token, signature }
  }

  // 验证签名的CSRF令牌
  static verifySignedToken(token: string, signature: string): boolean {
    const expectedSignature = crypto.createHmac("sha256", this.SECRET_KEY).update(token).digest("hex")

    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  }

  // 设置CSRF令牌到Cookie
  static setCSRFToken(): string {
    const { token, signature } = this.generateSignedToken()
    const cookieStore = cookies()

    // 设置令牌Cookie（客户端可访问）
    cookieStore.set(this.COOKIE_NAME, token, {
      httpOnly: false, // 需要JavaScript访问
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // 重要：防止CSRF攻击
      maxAge: 60 * 60 * 24, // 24小时
      path: "/",
    })

    // 设置签名Cookie（仅服务器访问）
    cookieStore.set(`${this.COOKIE_NAME}_sig`, signature, {
      httpOnly: true, // 只有服务器可以访问
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24小时
      path: "/",
    })

    return token
  }

  // 验证CSRF令牌
  static verifyToken(request: Request): {
    valid: boolean
    reason?: string
  } {
    try {
      // 从Cookie获取令牌和签名
      const cookieHeader = request.headers.get("cookie")
      const cookieToken = this.extractTokenFromCookie(cookieHeader, this.COOKIE_NAME)
      const cookieSignature = this.extractTokenFromCookie(cookieHeader, `${this.COOKIE_NAME}_sig`)

      // 从请求头获取令牌
      const headerToken = request.headers.get(this.HEADER_NAME)

      // 验证令牌是否存在
      if (!cookieToken || !cookieSignature || !headerToken) {
        return {
          valid: false,
          reason: "CSRF令牌缺失",
        }
      }

      // 验证Cookie中的令牌和请求头中的令牌是否匹配
      if (cookieToken !== headerToken) {
        return {
          valid: false,
          reason: "CSRF令牌不匹配",
        }
      }

      // 验证令牌签名
      if (!this.verifySignedToken(cookieToken, cookieSignature)) {
        return {
          valid: false,
          reason: "CSRF令牌签名无效",
        }
      }

      return { valid: true }
    } catch (error) {
      console.error("CSRF令牌验证错误:", error)
      return {
        valid: false,
        reason: "CSRF令牌验证失败",
      }
    }
  }

  // 从Cookie字符串中提取指定名称的令牌
  private static extractTokenFromCookie(cookieHeader: string | null, cookieName: string): string | null {
    if (!cookieHeader) return null

    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim())
    const targetCookie = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`))

    if (!targetCookie) return null

    return decodeURIComponent(targetCookie.split("=")[1])
  }

  // 获取当前CSRF令牌
  static getCurrentToken(): string | null {
    try {
      const cookieStore = cookies()
      return cookieStore.get(this.COOKIE_NAME)?.value || null
    } catch (error) {
      return null
    }
  }

  // 刷新CSRF令牌
  static refreshToken(): string {
    return this.setCSRFToken()
  }

  // 清除CSRF令牌
  static clearCSRFToken(): void {
    try {
      const cookieStore = cookies()
      cookieStore.delete(this.COOKIE_NAME)
      cookieStore.delete(`${this.COOKIE_NAME}_sig`)
    } catch (error) {
      console.error("清除CSRF令牌失败:", error)
    }
  }

  // 验证请求来源（额外的安全检查）
  static verifyOrigin(request: Request): boolean {
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")
    const host = request.headers.get("host")

    // 检查Origin头
    if (origin) {
      const originHost = new URL(origin).host
      return originHost === host
    }

    // 检查Referer头（作为备选）
    if (referer) {
      const refererHost = new URL(referer).host
      return refererHost === host
    }

    // 如果都没有，拒绝请求
    return false
  }
}

// 增强的CSRF中间件
export function createCSRFMiddleware(
  options: {
    excludePaths?: string[]
    requireOriginCheck?: boolean
    customErrorResponse?: (reason: string) => Response
  } = {},
) {
  const { excludePaths = [], requireOriginCheck = true, customErrorResponse } = options

  return async (request: Request) => {
    const url = new URL(request.url)
    const method = request.method

    // 只对状态改变的请求进行CSRF保护
    if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      return null
    }

    // 检查是否在排除路径中
    if (excludePaths.some((path) => url.pathname.startsWith(path))) {
      return null
    }

    // 验证请求来源
    if (requireOriginCheck && !CSRFProtection.verifyOrigin(request)) {
      const errorResponse =
        customErrorResponse?.("请求来源验证失败") ||
        new Response(
          JSON.stringify({
            success: false,
            message: "请求来源验证失败",
            error: "INVALID_ORIGIN",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        )
      return errorResponse
    }

    // 验证CSRF令牌
    const tokenVerification = CSRFProtection.verifyToken(request)
    if (!tokenVerification.valid) {
      const errorResponse =
        customErrorResponse?.(tokenVerification.reason!) ||
        new Response(
          JSON.stringify({
            success: false,
            message: tokenVerification.reason,
            error: "CSRF_TOKEN_INVALID",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        )
      return errorResponse
    }

    return null
  }
}

console.log("🛡️ 增强版CSRF保护服务已初始化")
