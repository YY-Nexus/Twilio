import crypto from "crypto"
import { EncryptionService } from "./encryption-service"

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export class TwoFactorAuthService {
  // 生成简单的6位数字验证码（替代TOTP）
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // 生成2FA密钥
  static generateSecret(): string {
    return crypto.randomBytes(20).toString("base32")
  }

  // 生成2FA设置（简化版）
  static async generateTwoFactorSetup(userEmail: string, appName = "整合应用平台"): Promise<TwoFactorSetup> {
    // 生成密钥
    const secret = this.generateSecret()

    // 生成简化的二维码URL（实际应用中可以使用QR码生成库）
    const qrCodeUrl = `data:image/svg+xml;base64,${Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
          ${appName}
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="10">
          ${userEmail}
        </text>
        <text x="100" y="140" text-anchor="middle" font-family="Arial" font-size="8">
          密钥: ${secret}
        </text>
      </svg>`,
    ).toString("base64")}`

    // 生成备用恢复码
    const backupCodes = this.generateBackupCodes()

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    }
  }

  // 验证6位数字代码（简化版）
  static verifyCode(secret: string, code: string, storedCode?: string): boolean {
    // 在实际应用中，这里应该验证TOTP代码
    // 现在我们简化为验证存储的代码
    return storedCode === code
  }

  // 生成备用恢复码
  static generateBackupCodes(count = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase()
      codes.push(code)
    }
    return codes
  }

  // 验证备用恢复码
  static verifyBackupCode(userBackupCodes: string[], inputCode: string): boolean {
    const index = userBackupCodes.indexOf(inputCode.toUpperCase())
    if (index !== -1) {
      // 使用后移除该恢复码
      userBackupCodes.splice(index, 1)
      return true
    }
    return false
  }

  // 加密存储2FA密钥
  static encryptTwoFactorSecret(secret: string): string {
    return EncryptionService.encryptText(secret)
  }

  // 解密2FA密钥
  static decryptTwoFactorSecret(encryptedSecret: string): string {
    return EncryptionService.decryptText(encryptedSecret)
  }

  // 发送验证码（模拟实现）
  static async sendVerificationCode(
    method: "sms" | "email",
    contact: string,
    code: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 模拟发送延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log(`📱 模拟发送${method === "sms" ? "短信" : "邮件"}到 ${contact}: 验证码 ${code}`)

      return { success: true, message: "验证码发送成功" }
    } catch (error) {
      console.error("发送验证码失败:", error)
      return { success: false, message: "验证码发送失败" }
    }
  }

  // 生成临时验证码
  static generateTemporaryCode(): string {
    return this.generateVerificationCode()
  }
}

console.log("🔐 简化版双因素认证服务已初始化")
