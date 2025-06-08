import crypto from "crypto"

export class EncryptionService {
  private static readonly SECRET_KEY = process.env.CUSTOM_KEY!
  private static readonly ALGORITHM = "aes-256-gcm"

  // 加密文本数据
  static encryptText(text: string): string {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipher(this.ALGORITHM, this.SECRET_KEY)

      let encrypted = cipher.update(text, "utf8", "hex")
      encrypted += cipher.final("hex")

      return `${iv.toString("hex")}:${encrypted}`
    } catch (error) {
      throw new Error("数据加密失败")
    }
  }

  // 解密文本数据
  static decryptText(encryptedText: string): string {
    try {
      const [ivHex, encrypted] = encryptedText.split(":")
      const decipher = crypto.createDecipher(this.ALGORITHM, this.SECRET_KEY)

      let decrypted = decipher.update(encrypted, "hex", "utf8")
      decrypted += decipher.final("utf8")

      return decrypted
    } catch (error) {
      throw new Error("数据解密失败")
    }
  }

  // 加密对象数据
  static encryptObject(obj: any): string {
    try {
      const jsonString = JSON.stringify(obj)
      return this.encryptText(jsonString)
    } catch (error) {
      throw new Error("对象加密失败")
    }
  }

  // 解密对象数据
  static decryptObject<T>(encryptedData: string): T {
    try {
      const decryptedString = this.decryptText(encryptedData)
      return JSON.parse(decryptedString)
    } catch (error) {
      throw new Error("对象解密失败")
    }
  }

  // 生成数据签名
  static generateSignature(data: string): string {
    return crypto.createHmac("sha256", this.SECRET_KEY).update(data).digest("hex")
  }

  // 验证数据签名
  static verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(data)
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  }

  // 生成随机密钥
  static generateRandomKey(length = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }

  // 哈希数据
  static hashData(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex")
  }
}

console.log("🔒 加密服务已初始化（使用内置crypto）")
