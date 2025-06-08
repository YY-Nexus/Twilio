import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth-service"
import { TwoFactorAuthService } from "@/lib/two-factor-auth"

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    // 生成2FA设置
    const twoFactorSetup = await TwoFactorAuthService.generateTwoFactorSetup(user.email)

    // 加密密钥后存储（实际应用中存储到数据库）
    const encryptedSecret = TwoFactorAuthService.encryptTwoFactorSecret(twoFactorSetup.secret)

    // 这里应该将加密的密钥和备用码存储到数据库
    // await database.user.update({
    //   where: { id: user.id },
    //   data: {
    //     twoFactorSecret: encryptedSecret,
    //     backupCodes: twoFactorSetup.backupCodes,
    //     twoFactorEnabled: false // 设置完成后才启用
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: {
        qrCodeUrl: twoFactorSetup.qrCodeUrl,
        backupCodes: twoFactorSetup.backupCodes,
        secret: twoFactorSetup.secret, // 仅用于测试，生产环境不返回
      },
    })
  } catch (error) {
    console.error("2FA设置错误:", error)
    return NextResponse.json({ success: false, message: "2FA设置失败" }, { status: 500 })
  }
}
