"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Copy, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// API测试组件
export function ApiTester({
  endpoint,
  method,
  params = [],
}: {
  endpoint: string
  method: string
  params?: Array<{ name: string; type: string; required: boolean; description: string }>
}) {
  const [requestBody, setRequestBody] = useState("{}")
  const [response, setResponse] = useState<{ data: any; status: number; time: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState("")

  // 发送API请求
  const sendRequest = async () => {
    setLoading(true)
    setError(null)

    try {
      const startTime = Date.now()

      // 构建请求选项
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      // 添加认证令牌（如果有）
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // 添加请求体（对于POST, PUT, PATCH请求）
      if (["POST", "PUT", "PATCH"].includes(method)) {
        try {
          options.body = requestBody
        } catch (e) {
          setError("请求体JSON格式无效")
          setLoading(false)
          return
        }
      }

      // 发送请求（这里仅模拟，实际环境中应该发送真实请求）
      // 注意：这里使用模拟响应，因为在文档页面中通常不会发送真实请求
      setTimeout(() => {
        const mockResponse = {
          success: true,
          data: JSON.parse(requestBody),
          message: "请求成功（模拟响应）",
        }

        const endTime = Date.now()
        setResponse({
          data: mockResponse,
          status: 200,
          time: endTime - startTime,
        })
        setLoading(false)
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求发送失败")
      setLoading(false)
    }
  }

  // 复制响应到剪贴板
  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    }
  }

  return (
    <div className="border rounded-md overflow-hidden mt-4">
      <div className="bg-muted p-4 flex justify-between items-center">
        <div>
          <Badge
            variant={
              method === "GET"
                ? "default"
                : method === "POST"
                  ? "destructive"
                  : method === "PUT"
                    ? "warning"
                    : method === "DELETE"
                      ? "outline"
                      : "secondary"
            }
          >
            {method}
          </Badge>
          <span className="ml-2 font-mono text-sm">{endpoint}</span>
        </div>
        <Button variant="outline" size="sm" onClick={sendRequest} disabled={loading}>
          {loading ? "发送中..." : "测试请求"}
          {!loading && <Play className="ml-2 h-4 w-4" />}
        </Button>
      </div>

      <div className="p-4">
        <Tabs defaultValue="params">
          <TabsList className="mb-4">
            <TabsTrigger value="params">参数</TabsTrigger>
            <TabsTrigger value="headers">请求头</TabsTrigger>
            <TabsTrigger value="body">请求体</TabsTrigger>
            <TabsTrigger value="response">响应</TabsTrigger>
          </TabsList>

          <TabsContent value="params">
            <div className="space-y-4">
              {params.length > 0 ? (
                params.map((param, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-sm font-medium">
                        {param.name}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    </div>
                    <Input className="col-span-2" placeholder={`${param.type} 类型`} />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">此请求没有查询参数</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="headers">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium">Authorization</label>
                <Input
                  className="col-span-2"
                  placeholder="Bearer token"
                  value={token ? `Bearer ${token}` : ""}
                  onChange={(e) => setToken(e.target.value.replace("Bearer ", ""))}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium">Content-Type</label>
                <Input className="col-span-2" value="application/json" disabled />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="body">
            {["POST", "PUT", "PATCH"].includes(method) ? (
              <Textarea
                className="font-mono text-sm h-40"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="输入JSON请求体"
              />
            ) : (
              <p className="text-muted-foreground">{method} 请求不需要请求体</p>
            )}
          </TabsContent>

          <TabsContent value="response">
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {response && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant={response.status < 300 ? "success" : "destructive"}>{response.status}</Badge>
                      <span className="text-sm text-muted-foreground">{response.time}ms</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyResponse}>
                      <Copy className="h-4 w-4 mr-1" />
                      复制
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}

              {!response && !error && <p className="text-muted-foreground">点击"测试请求"按钮发送请求</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
