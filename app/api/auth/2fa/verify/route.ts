import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"
import { TwoFactorAuthService } from "@/lib/two-factor-auth"

export async function POST(request: NextRequest) {
  try {
    const { token, isBackupCode = false } = await request.json()

    // 验证用户身份
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    // 从数据库获取用户的2FA信息（模拟数据）
    const mockUserData = {
      twoFactorSecret: "JBSWY3DPEHPK3PXP", // 实际应用中从数据库获取加密的密钥
      backupCodes: ["ABCD1234", "EFGH5678", "IJKL9012"],
      twoFactorEnabled: true,
    }

    let isValid = false

    if (isBackupCode) {
      // 验证备用恢复码
      isValid = TwoFactorAuthService.verifyBackupCode(mockUserData.backupCodes, token)
    } else {
      // 验证TOTP代码
      isValid = TwoFactorAuthService.verifyTwoFactorCode(mockUserData.twoFactorSecret, token)
    }

    if (isValid) {
      // 验证成功，可以启用2FA或完成登录
      return NextResponse.json({
        success: true,
        message: "2FA验证成功",
        data: {
          verified: true,
          remainingBackupCodes: mockUserData.backupCodes.length,
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "验证码无效" }, { status: 400 })
    }
  } catch (error) {
    console.error("2FA验证错误:", error)
    return NextResponse.json({ success: false, message: "2FA验证失败" }, { status: 500 })
  }
}
