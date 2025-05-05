"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Copy, RefreshCw } from "lucide-react"

export function TokenGenerator() {
  const [token, setToken] = useState("")
  const [role, setRole] = useState("editor")
  const [expiry, setExpiry] = useState("1h")

  // 生成随机令牌（实际应用中应该通过API获取）
  const generateToken = () => {
    // 这里只是模拟生成一个随机字符串作为令牌
    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)

    // 模拟JWT格式
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    const payload = btoa(
      JSON.stringify({
        role,
        exp: Date.now() + (expiry === "1h" ? 3600000 : expiry === "1d" ? 86400000 : 604800000),
        iat: Date.now(),
        sub: "test-user",
      }),
    )
    const signature = randomString

    setToken(`${header}.${payload}.${signature}`)
  }

  // 复制令牌到剪贴板
  const copyToken = () => {
    navigator.clipboard.writeText(token)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>测试令牌生成器</CardTitle>
        <CardDescription>生成临时令牌用于API测试（仅用于文档测试）</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">用户角色</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="editor">编辑者</SelectItem>
                <SelectItem value="viewer">查看者</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">过期时间</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger id="expiry">
                <SelectValue placeholder="选择过期时间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1小时</SelectItem>
                <SelectItem value="1d">1天</SelectItem>
                <SelectItem value="7d">7天</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">令牌</Label>
          <div className="flex space-x-2">
            <Input id="token" value={token} readOnly className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyToken} title="复制令牌">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={generateToken} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          生成令牌
        </Button>
      </CardFooter>
    </Card>
  )
}
