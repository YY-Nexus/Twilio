import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"

// 需要认证的路径
const protectedPaths = ["/users", "/products", "/orders", "/analytics", "/settings"]

// 管理员专用路径
const adminPaths = ["/users/roles", "/users/permissions", "/settings/security", "/settings/integrations"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否为受保护的路径
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))

  if (isProtectedPath) {
    try {
      // 获取访问令牌
      const accessToken = request.cookies.get("access_token")?.value

      if (!accessToken) {
        // 重定向到登录页
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // 验证令牌
      const decoded = AuthService.verifyToken(accessToken)

      // 检查管理员权限
      if (isAdminPath) {
        const hasAdminAccess =
          decoded.role === "admin" || decoded.permissions.includes("*") || decoded.permissions.includes("admin.access")

        if (!hasAdminAccess) {
          return NextResponse.redirect(new URL("/unauthorized", request.url))
        }
      }

      // 在请求头中添加用户信息
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", decoded.id)
      requestHeaders.set("x-user-role", decoded.role)
      requestHeaders.set("x-user-permissions", JSON.stringify(decoded.permissions))

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error("认证中间件错误:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api/auth (认证相关API)
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public文件夹
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
