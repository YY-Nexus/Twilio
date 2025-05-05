"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Copy, Database, Play, RefreshCw, Save, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 沙箱环境类型
type SandboxEnvironment = "development" | "staging" | "demo"

// 沙箱请求历史记录项
interface SandboxHistoryItem {
  id: string
  method: string
  endpoint: string
  timestamp: Date
  status: number
  duration: number
}

// 模拟数据生成器
const generateMockData = (endpoint: string, method: string) => {
  // 根据不同的端点生成不同的模拟数据
  if (endpoint.includes("/users")) {
    return {
      success: true,
      data: [
        { id: "user_1", name: "测试用户1", email: "user1@example.com", role: "admin" },
        { id: "user_2", name: "测试用户2", email: "user2@example.com", role: "editor" },
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      },
    }
  } else if (endpoint.includes("/auth")) {
    return {
      success: true,
      data: {
        token: "sandbox_mock_token_" + Math.random().toString(36).substring(2),
        expires_in: 3600,
        user: { id: "user_1", name: "测试用户", role: "admin" },
      },
    }
  } else if (endpoint.includes("/export")) {
    return {
      success: true,
      data: {
        batchId: "batch_" + Math.random().toString(36).substring(2),
        status: "processing",
        progress: 0,
        createdAt: new Date().toISOString(),
      },
    }
  } else if (endpoint.includes("/stats")) {
    return {
      success: true,
      data: {
        totalUsers: 1250,
        activeUsers: 876,
        totalRequests: 45678,
        averageResponseTime: 120,
        errorRate: 0.02,
      },
    }
  } else {
    // 默认响应
    return {
      success: true,
      data: { message: "沙箱环境模拟响应" },
    }
  }
}

// 模拟请求历史数据
const MOCK_HISTORY: SandboxHistoryItem[] = [
  {
    id: "req_1",
    method: "GET",
    endpoint: "/api/users",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 200,
    duration: 120,
  },
  {
    id: "req_2",
    method: "POST",
    endpoint: "/api/auth/login",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: 200,
    duration: 180,
  },
  {
    id: "req_3",
    method: "GET",
    endpoint: "/api/stats/overview",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 200,
    duration: 150,
  },
  {
    id: "req_4",
    method: "POST",
    endpoint: "/api/export/batch",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    status: 400,
    duration: 90,
  },
]

export function ApiSandbox() {
  const [environment, setEnvironment] = useState<SandboxEnvironment>("development")
  const [endpoint, setEndpoint] = useState("/api/users")
  const [method, setMethod] = useState("GET")
  const [requestBody, setRequestBody] = useState("{}")
  const [headers, setHeaders] = useState(
    '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer sandbox_token"\n}',
  )
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<SandboxHistoryItem[]>(MOCK_HISTORY)
  const [mockDelay, setMockDelay] = useState(500)
  const [autoGenerateMockData, setAutoGenerateMockData] = useState(true)

  // 发送沙箱请求
  const sendRequest = () => {
    setLoading(true)
    setError(null)

    // 模拟请求延迟
    setTimeout(() => {
      try {
        // 解析请求体和请求头
        let parsedBody = {}
        let parsedHeaders = {}

        try {
          parsedBody = JSON.parse(requestBody)
        } catch (e) {
          setError("请求体JSON格式无效")
          setLoading(false)
          return
        }

        try {
          parsedHeaders = JSON.parse(headers)
        } catch (e) {
          setError("请求头JSON格式无效")
          setLoading(false)
          return
        }

        // 生成模拟响应
        let mockResponse
        if (autoGenerateMockData) {
          mockResponse = generateMockData(endpoint, method)
        } else {
          // 使用用户提供的请求体作为响应
          mockResponse = {
            success: true,
            data: parsedBody,
          }
        }

        // 随机生成一些错误响应
        if (Math.random() < 0.1 && endpoint !== "/api/auth/login") {
          mockResponse = {
            success: false,
            error: {
              code: "SANDBOX_ERROR",
              message: "沙箱环境模拟错误响应",
            },
          }
        }

        // 更新响应和历史记录
        setResponse({
          data: mockResponse,
          status: mockResponse.success ? 200 : 400,
          headers: {
            "Content-Type": "application/json",
            "X-Sandbox-Environment": environment,
          },
          time: Math.floor(Math.random() * 200) + 50, // 50-250ms
        })

        // 添加到历史记录
        const newHistoryItem: SandboxHistoryItem = {
          id: "req_" + Date.now(),
          method,
          endpoint,
          timestamp: new Date(),
          status: mockResponse.success ? 200 : 400,
          duration: Math.floor(Math.random() * 200) + 50,
        }

        setHistory((prev) => [newHistoryItem, ...prev].slice(0, 10))
        setLoading(false)
      } catch (err) {
        setError("请求处理失败")
        setLoading(false)
      }
    }, mockDelay)
  }

  // 清除历史记录
  const clearHistory = () => {
    setHistory([])
  }

  // 保存当前请求为预设
  const saveAsPreset = () => {
    // 这里只是模拟保存功能
    alert("请求已保存为预设！")
  }

  // 复制响应到剪贴板
  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    }
  }

  // 格式化请求体
  const formatRequestBody = () => {
    try {
      const parsed = JSON.parse(requestBody)
      setRequestBody(JSON.stringify(parsed, null, 2))
    } catch (e) {
      setError("无法格式化：JSON格式无效")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API沙箱环境</h2>
          <p className="text-muted-foreground">在安全的环境中测试API，不会影响生产数据</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sandbox-env">环境：</Label>
            <Select value={environment} onValueChange={(value) => setEnvironment(value as SandboxEnvironment)}>
              <SelectTrigger id="sandbox-env" className="w-[180px]">
                <SelectValue placeholder="选择环境" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">开发环境</SelectItem>
                <SelectItem value="staging">测试环境</SelectItem>
                <SelectItem value="demo">演示环境</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            沙箱模式
          </Badge>
        </div>
      </div>

      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>沙箱环境提示</AlertTitle>
        <AlertDescription>沙箱环境中的所有操作都是模拟的，不会影响实际数据。响应数据仅用于测试目的。</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>请求配置</CardTitle>
              <CardDescription>配置API请求参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="method">请求方法</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="方法" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="endpoint">API端点</Label>
                  <Input
                    id="endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/resource"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="headers">请求头</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHeaders(JSON.stringify(JSON.parse(headers), null, 2))}
                  >
                    格式化
                  </Button>
                </div>
                <Textarea
                  id="headers"
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  className="font-mono text-sm h-24"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="body">请求体 {method === "GET" && "(GET请求不需要请求体)"}</Label>
                  <Button variant="ghost" size="sm" onClick={formatRequestBody} disabled={method === "GET"}>
                    格式化
                  </Button>
                </div>
                <Textarea
                  id="body"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="font-mono text-sm h-40"
                  disabled={method === "GET"}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-mock" checked={autoGenerateMockData} onCheckedChange={setAutoGenerateMockData} />
                <Label htmlFor="auto-mock">自动生成模拟数据</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mock-delay">模拟延迟 ({mockDelay}ms)</Label>
                <Input
                  id="mock-delay"
                  type="range"
                  min="0"
                  max="2000"
                  step="100"
                  value={mockDelay}
                  onChange={(e) => setMockDelay(Number.parseInt(e.target.value))}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={saveAsPreset}>
                <Save className="mr-2 h-4 w-4" />
                保存为预设
              </Button>
              <Button onClick={sendRequest} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    发送请求
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>请求历史</CardTitle>
              <CardDescription>最近的API请求记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => {
                        setMethod(item.method)
                        setEndpoint(item.endpoint)
                      }}
                    >
                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className={`mr-2 ${
                            item.method === "GET"
                              ? "bg-blue-100 text-blue-800"
                              : item.method === "POST"
                                ? "bg-green-100 text-green-800"
                                : item.method === "PUT"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item.method === "DELETE"
                                    ? "bg-red-100 text-red-800"
                                    : ""
                          }`}
                        >
                          {item.method}
                        </Badge>
                        <span className="font-mono text-sm truncate max-w-[200px]">{item.endpoint}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge
                          variant="outline"
                          className={item.status < 400 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
                        >
                          {item.status}
                        </Badge>
                        <span>{item.duration}ms</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">暂无请求历史</div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={clearHistory}
                disabled={history.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清除历史记录
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>响应结果</CardTitle>
                {response && (
                  <Button variant="ghost" size="sm" onClick={copyResponse}>
                    <Copy className="mr-2 h-4 w-4" />
                    复制
                  </Button>
                )}
              </div>
              <CardDescription>API请求的响应数据</CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-8rem)] overflow-auto">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>错误</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading && (
                <div className="flex items-center justify-center h-40">
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">请求处理中...</p>
                  </div>
                </div>
              )}

              {!loading && !error && !response && (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Database className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">点击"发送请求"按钮测试API</p>
                  <p className="text-sm text-muted-foreground mt-2">响应将显示在这里</p>
                </div>
              )}

              {!loading && !error && response && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={response.status < 400 ? "default" : "destructive"}
                        className={response.status < 400 ? "bg-green-100 text-green-800" : ""}
                      >
                        {response.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{response.time}ms</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      沙箱响应
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">响应头</h4>
                    <div className="bg-muted p-2 rounded-md">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="text-sm font-mono">
                          <span className="text-muted-foreground">{key}:</span> {value as string}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">响应体</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
