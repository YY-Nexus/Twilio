import { type NextRequest, NextResponse } from "next/server"
import { rateLimiters, getClientIdentifier, type RateLimiter } from "./rate-limiter"

export function createRateLimitMiddleware(limiter: RateLimiter) {
  return async (request: NextRequest) => {
    const identifier = getClientIdentifier(request)
    const result = limiter.checkLimit(identifier)

    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limiter["config"].maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.resetTime.toString(),
            "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    // 在响应头中添加限制信息
    const response = NextResponse.next()
    response.headers.set("X-RateLimit-Limit", limiter["config"].maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", result.resetTime.toString())

    return response
  }
}

// 应用速率限制到登录API
export const loginRateLimit = createRateLimitMiddleware(rateLimiters.login)
export const apiRateLimit = createRateLimitMiddleware(rateLimiters.api)
export const registerRateLimit = createRateLimitMiddleware(rateLimiters.register)
export const passwordResetRateLimit = createRateLimitMiddleware(rateLimiters.passwordReset)
export const twoFactorRateLimit = createRateLimitMiddleware(rateLimiters.twoFactor)
