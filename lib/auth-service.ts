import crypto from "crypto"
import { cookies } from "next/headers"

interface UserPayload {
  id: string
  email: string
  role: string
  permissions: string[]
}

interface TokenPayload extends UserPayload {
  iat: number
  exp: number
  type: "access" | "refresh"
}

export class AuthService {
  private static readonly SECRET_KEY = process.env.CUSTOM_KEY!
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24小时
  private static readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7天

  // 简单的JWT实现（避免依赖冲突）
  private static createToken(payload: any): string {
    const header = {
      alg: "HS256",
      typ: "JWT",
    }

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")

    const signature = crypto
      .createHmac("sha256", this.SECRET_KEY)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url")

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  private static verifyToken(token: string): any {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid token format")
      }

      const [header, payload, signature] = parts
      const expectedSignature = crypto
        .createHmac("sha256", this.SECRET_KEY)
        .update(`${header}.${payload}`)
        .digest("base64url")

      if (signature !== expectedSignature) {
        throw new Error("Invalid signature")
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString())

      // 检查过期时间
      if (Date.now() > decodedPayload.exp) {
        throw new Error("Token expired")
      }

      return decodedPayload
    } catch (error) {
      throw new Error("Token verification failed")
    }
  }

  // 生成访问令牌
  static generateAccessToken(user: UserPayload): string {
    const payload: TokenPayload = {
      ...user,
      iat: Date.now(),
      exp: Date.now() + this.TOKEN_EXPIRY,
      type: "access",
    }

    return this.createToken(payload)
  }

  // 生成刷新令牌
  static generateRefreshToken(userId: string): string {
    const payload = {
      id: userId,
      iat: Date.now(),
      exp: Date.now() + this.REFRESH_TOKEN_EXPIRY,
      type: "refresh",
    }

    return this.createToken(payload)
  }

  // 验证令牌
  static verifyAccessToken(token: string): TokenPayload {
    const decoded = this.verifyToken(token)

    if (decoded.type !== "access") {
      throw new Error("Invalid token type")
    }

    return decoded
  }

  // 密码加密（使用内置crypto）
  static async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString("hex")
      crypto.pbkdf2(password, salt, 10000, 64, "sha512", (err, derivedKey) => {
        if (err) reject(err)
        resolve(`${salt}:${derivedKey.toString("hex")}`)
      })
    })
  }

  // 密码验证
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, hash] = hashedPassword.split(":")
      crypto.pbkdf2(password, salt, 10000, 64, "sha512", (err, derivedKey) => {
        if (err) reject(err)
        resolve(hash === derivedKey.toString("hex"))
      })
    })
  }

  // 设置安全Cookie
  static setAuthCookies(accessToken: string, refreshToken: string) {
    try {
      const cookieStore = cookies()

      cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24小时
        path: "/",
      })

      cookieStore.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7天
        path: "/",
      })
    } catch (error) {
      console.error("设置Cookie失败:", error)
      throw new Error("设置认证Cookie失败")
    }
  }

  // 清除认证Cookie
  static clearAuthCookies() {
    try {
      const cookieStore = cookies()
      cookieStore.delete("access_token")
      cookieStore.delete("refresh_token")
    } catch (error) {
      console.error("清除Cookie失败:", error)
    }
  }

  // 从请求中获取用户信息
  static async getCurrentUser(): Promise<UserPayload | null> {
    try {
      const cookieStore = cookies()
      const accessToken = cookieStore.get("access_token")?.value

      if (!accessToken) {
        return null
      }

      const decoded = this.verifyAccessToken(accessToken)

      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions,
      }
    } catch (error) {
      console.error("获取用户信息失败:", error)
      return null
    }
  }
}

console.log("🔐 认证服务已初始化（使用内置加密）")
