"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// API状态类型
type ApiStatus = "operational" | "degraded" | "outage" | "maintenance"

// API端点状态接口
interface ApiEndpointStatus {
  endpoint: string
  category: string
  status: ApiStatus
  responseTime: number
  uptime: number
  lastChecked: Date
  incidents: number
}

// 性能指标接口
interface PerformanceMetrics {
  date: Date
  avgResponseTime: number
  requestCount: number
  errorRate: number
  p95ResponseTime: number
}

// 模拟API状态数据
const MOCK_API_STATUS: ApiEndpointStatus[] = [
  {
    endpoint: "/api/auth/login",
    category: "认证",
    status: "operational",
    responseTime: 120,
    uptime: 99.98,
    lastChecked: new Date(),
    incidents: 0,
  },
  {
    endpoint: "/api/auth/refresh",
    category: "认证",
    status: "operational",
    responseTime: 95,
    uptime: 99.95,
    lastChecked: new Date(),
    incidents: 1,
  },
  {
    endpoint: "/api/users",
    category: "用户管理",
    status: "operational",
    responseTime: 180,
    uptime: 99.9,
    lastChecked: new Date(),
    incidents: 2,
  },
  {
    endpoint: "/api/export/batch",
    category: "批量导出",
    status: "degraded",
    responseTime: 350,
    uptime: 98.5,
    lastChecked: new Date(),
    incidents: 5,
  },
  {
    endpoint: "/api/export/batches",
    category: "批量导出",
    status: "operational",
    responseTime: 210,
    uptime: 99.8,
    lastChecked: new Date(),
    incidents: 1,
  },
  {
    endpoint: "/api/stats/overview",
    category: "数据统计",
    status: "operational",
    responseTime: 150,
    uptime: 99.95,
    lastChecked: new Date(),
    incidents: 0,
  },
  {
    endpoint: "/api/stats/usage",
    category: "数据统计",
    status: "maintenance",
    responseTime: 0,
    uptime: 95.0,
    lastChecked: new Date(),
    incidents: 0,
  },
]

// 生成过去7天的性能指标数据
const generatePerformanceData = (): PerformanceMetrics[] => {
  const data: PerformanceMetrics[] = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // 生成一些随机波动的数据
    const baseResponseTime = 150
    const fluctuation = Math.sin(i / 2) * 30
    const avgResponseTime = Math.max(50, baseResponseTime + fluctuation + Math.random() * 20)

    // 请求数量在周末减少
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseRequestCount = isWeekend ? 8500 : 12000
    const requestCount = baseRequestCount + Math.floor(Math.random() * 2000)

    // 错误率通常很低
    const errorRate = Math.max(0.1, Math.random() * 0.5 + (i === 3 ? 1.2 : 0)) // 第3天有个小高峰

    // p95响应时间通常是平均响应时间的1.5-2倍
    const p95ResponseTime = avgResponseTime * (1.5 + Math.random() * 0.5)

    data.push({
      date,
      avgResponseTime,
      requestCount,
      errorRate,
      p95ResponseTime,
    })
  }

  return data
}

// 获取状态徽章
const getStatusBadge = (status: ApiStatus) => {
  switch (status) {
    case "operational":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          正常运行
        </Badge>
      )
    case "degraded":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          性能下降
        </Badge>
      )
    case "outage":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          服务中断
        </Badge>
      )
    case "maintenance":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          维护中
        </Badge>
      )
    default:
      return <Badge>未知状态</Badge>
  }
}

// 获取响应时间评级
const getResponseTimeRating = (time: number) => {
  if (time === 0) return "N/A" // 维护中或中断
  if (time < 100) return "极快"
  if (time < 200) return "快速"
  if (time < 300) return "良好"
  if (time < 500) return "较慢"
  return "缓慢"
}

export function ApiStatusMonitor() {
  const [apiStatus, setApiStatus] = useState<ApiEndpointStatus[]>(MOCK_API_STATUS)
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>(generatePerformanceData())
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 刷新状态数据
  const refreshStatus = () => {
    setLoading(true)

    // 模拟API调用延迟
    setTimeout(() => {
      // 随机更新一些状态
      const updatedStatus = [...apiStatus]
      const randomIndex = Math.floor(Math.random() * updatedStatus.length)

      // 大多数情况下保持正常，偶尔出现问题
      const randomStatus: ApiStatus[] = ["operational", "operational", "operational", "degraded", "maintenance"]
      updatedStatus[randomIndex] = {
        ...updatedStatus[randomIndex],
        status: randomStatus[Math.floor(Math.random() * randomStatus.length)],
        responseTime: Math.floor(Math.random() * 300) + 50,
        lastChecked: new Date(),
      }

      setApiStatus(updatedStatus)
      setLoading(false)
    }, 1000)
  }

  // 过滤API状态数据
  const filteredApiStatus = selectedCategory ? apiStatus.filter((api) => api.category === selectedCategory) : apiStatus

  // 计算整体系统状态
  const calculateOverallStatus = () => {
    const hasOutage = apiStatus.some((api) => api.status === "outage")
    const hasDegraded = apiStatus.some((api) => api.status === "degraded")
    const hasMaintenance = apiStatus.some((api) => api.status === "maintenance")

    if (hasOutage) return "outage"
    if (hasDegraded) return "degraded"
    if (hasMaintenance) return "maintenance"
    return "operational"
  }

  // 计算平均响应时间
  const calculateAverageResponseTime = () => {
    const operationalApis = apiStatus.filter((api) => api.status === "operational" || api.status === "degraded")
    if (operationalApis.length === 0) return 0

    const totalResponseTime = operationalApis.reduce((sum, api) => sum + api.responseTime, 0)
    return Math.round(totalResponseTime / operationalApis.length)
  }

  // 计算系统可用性
  const calculateSystemUptime = () => {
    const totalUptime = apiStatus.reduce((sum, api) => sum + api.uptime, 0)
    return (totalUptime / apiStatus.length).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API状态监控</h2>
          <p className="text-muted-foreground">实时监控API状态和性能指标</p>
        </div>
        <Button variant="outline" onClick={refreshStatus} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {loading ? "刷新中..." : "刷新状态"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24">
              {getStatusBadge(calculateOverallStatus())}
              <p className="mt-2 text-2xl font-bold">
                {calculateOverallStatus() === "operational" ? "所有系统正常" : "部分系统异常"}
              </p>
              <p className="text-sm text-muted-foreground">最后更新: {new Date().toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24">
              <p className="text-3xl font-bold">{calculateAverageResponseTime()} ms</p>
              <div className="flex items-center mt-2">
                <Badge
                  variant="outline"
                  className={
                    calculateAverageResponseTime() < 150
                      ? "bg-green-50 text-green-700"
                      : calculateAverageResponseTime() < 300
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                  }
                >
                  {calculateAverageResponseTime() < 150
                    ? "良好"
                    : calculateAverageResponseTime() < 300
                      ? "一般"
                      : "较慢"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">系统可用性</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24">
              <p className="text-3xl font-bold">{calculateSystemUptime()}%</p>
              <Progress value={Number.parseFloat(calculateSystemUptime())} max={100} className="w-full h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">过去30天</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>API端点状态</CardTitle>
            <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="所有分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                <SelectItem value="认证">认证</SelectItem>
                <SelectItem value="用户管理">用户管理</SelectItem>
                <SelectItem value="批量导出">批量导出</SelectItem>
                <SelectItem value="数据统计">数据统计</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>各API端点的当前状态和性能指标</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">端点</th>
                  <th className="text-left py-3 px-4">分类</th>
                  <th className="text-left py-3 px-4">状态</th>
                  <th className="text-left py-3 px-4">响应时间</th>
                  <th className="text-left py-3 px-4">可用性</th>
                  <th className="text-left py-3 px-4">最近检查</th>
                </tr>
              </thead>
              <tbody>
                {filteredApiStatus.map((api, index) => (
                  <tr key={index} className={index !== filteredApiStatus.length - 1 ? "border-b" : ""}>
                    <td className="py-3 px-4 font-mono text-sm">{api.endpoint}</td>
                    <td className="py-3 px-4">{api.category}</td>
                    <td className="py-3 px-4">{getStatusBadge(api.status)}</td>
                    <td className="py-3 px-4">
                      {api.status !== "maintenance" && api.status !== "outage" ? (
                        <div className="flex items-center">
                          <span className="font-medium">{api.responseTime} ms</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({getResponseTimeRating(api.responseTime)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="font-medium">{api.uptime.toFixed(2)}%</span>
                        <Progress
                          value={api.uptime}
                          max={100}
                          className={`w-16 h-2 ml-2 ${
                            api.uptime > 99.9 ? "bg-green-100" : api.uptime > 99 ? "bg-yellow-100" : "bg-red-100"
                          }`}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{api.lastChecked.toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>性能趋势</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">过去24小时</SelectItem>
                <SelectItem value="7d">过去7天</SelectItem>
                <SelectItem value="30d">过去30天</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>API性能和使用情况趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="response-time">
            <TabsList className="mb-4">
              <TabsTrigger value="response-time">响应时间</TabsTrigger>
              <TabsTrigger value="requests">请求量</TabsTrigger>
              <TabsTrigger value="errors">错误率</TabsTrigger>
            </TabsList>

            <TabsContent value="response-time">
              <div className="h-80 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">图表组件将在这里显示响应时间趋势</p>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-7 gap-2">
                    {performanceData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="h-40 w-full flex items-end justify-center">
                          <div
                            className={`w-8 rounded-t-md ${
                              data.avgResponseTime < 150
                                ? "bg-green-200"
                                : data.avgResponseTime < 300
                                  ? "bg-yellow-200"
                                  : "bg-red-200"
                            }`}
                            style={{ height: `${Math.min(100, (data.avgResponseTime / 500) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {data.date.toLocaleDateString(undefined, { weekday: "short" })}
                        </div>
                        <div className="text-xs font-medium">{Math.round(data.avgResponseTime)} ms</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="requests">
              <div className="h-80 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">图表组件将在这里显示请求量趋势</p>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-7 gap-2">
                    {performanceData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="h-40 w-full flex items-end justify-center">
                          <div
                            className="w-8 bg-blue-200 rounded-t-md"
                            style={{ height: `${Math.min(100, (data.requestCount / 15000) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {data.date.toLocaleDateString(undefined, { weekday: "short" })}
                        </div>
                        <div className="text-xs font-medium">{(data.requestCount / 1000).toFixed(1)}k</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="errors">
              <div className="h-80 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">图表组件将在这里显示错误率趋势</p>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-7 gap-2">
                    {performanceData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="h-40 w-full flex items-end justify-center">
                          <div
                            className={`w-8 rounded-t-md ${
                              data.errorRate < 0.5
                                ? "bg-green-200"
                                : data.errorRate < 1
                                  ? "bg-yellow-200"
                                  : "bg-red-200"
                            }`}
                            style={{ height: `${Math.min(100, (data.errorRate / 2) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {data.date.toLocaleDateString(undefined, { weekday: "short" })}
                        </div>
                        <div className="text-xs font-medium">{data.errorRate.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>监控说明</AlertTitle>
        <AlertDescription>
          API状态每5分钟自动更新一次。您也可以点击"刷新状态"按钮手动更新。如果发现API异常，请联系技术支持团队。
        </AlertDescription>
      </Alert>
    </div>
  )
}
