"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Search,
  Share2,
  Zap,
} from "lucide-react"

// 时间范围类型
type TimeRange = "24h" | "7d" | "30d" | "90d" | "custom"

// 图表类型
type ChartType = "requests" | "latency" | "errors" | "users" | "endpoints"

// 端点使用数据接口
interface EndpointUsage {
  endpoint: string
  category: string
  requests: number
  avgLatency: number
  errorRate: number
  cachingRate: number
}

// 用户使用数据接口
interface UserUsage {
  userId: string
  username: string
  organization: string
  requests: number
  lastActive: Date
  topEndpoints: string[]
}

// 时间序列数据点接口
interface TimeSeriesDataPoint {
  timestamp: Date
  requests: number
  uniqueUsers: number
  avgLatency: number
  errorRate: number
  cacheHitRate: number
}

// 错误分布数据接口
interface ErrorDistribution {
  errorCode: string
  errorMessage: string
  count: number
  percentage: number
}

// 地理分布数据接口
interface GeoDistribution {
  country: string
  requests: number
  percentage: number
}

// 生成模拟的端点使用数据
const generateMockEndpointUsage = (): EndpointUsage[] => {
  const endpoints = [
    { endpoint: "/api/auth/login", category: "认证" },
    { endpoint: "/api/auth/refresh", category: "认证" },
    { endpoint: "/api/users", category: "用户管理" },
    { endpoint: "/api/users/{id}", category: "用户管理" },
    { endpoint: "/api/export/batch", category: "批量导出" },
    { endpoint: "/api/export/batches", category: "批量导出" },
    { endpoint: "/api/stats/overview", category: "数据统计" },
    { endpoint: "/api/stats/usage", category: "数据统计" },
  ]

  return endpoints.map((endpoint) => ({
    ...endpoint,
    requests: Math.floor(Math.random() * 10000) + 1000,
    avgLatency: Math.floor(Math.random() * 200) + 50,
    errorRate: Math.random() * 0.05,
    cachingRate: Math.random() * 0.8,
  }))
}

// 生成模拟的用户使用数据
const generateMockUserUsage = (): UserUsage[] => {
  const users = [
    { userId: "user_1", username: "admin@example.com", organization: "总部" },
    { userId: "user_2", username: "developer1@example.com", organization: "研发部" },
    { userId: "user_3", username: "developer2@example.com", organization: "研发部" },
    { userId: "user_4", username: "analyst@example.com", organization: "数据分析部" },
    { userId: "user_5", username: "manager@example.com", organization: "管理部" },
  ]

  const endpoints = ["/api/auth/login", "/api/users", "/api/export/batch", "/api/stats/overview", "/api/stats/usage"]

  return users.map((user) => {
    // 随机选择2-3个常用端点
    const numEndpoints = Math.floor(Math.random() * 2) + 2
    const shuffled = [...endpoints].sort(() => 0.5 - Math.random())
    const topEndpoints = shuffled.slice(0, numEndpoints)

    return {
      ...user,
      requests: Math.floor(Math.random() * 5000) + 100,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      topEndpoints,
    }
  })
}

// 生成模拟的时间序列数据
const generateMockTimeSeriesData = (days: number): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = []
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    // 工作日请求量更高
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseRequests = isWeekend ? 5000 : 12000

    // 添加一些随机波动
    const requests = Math.max(100, baseRequests + Math.floor(Math.random() * 3000 - 1500))
    const uniqueUsers = Math.max(10, Math.floor(requests / (10 + Math.random() * 5)))
    const avgLatency = Math.max(50, 120 + Math.floor(Math.random() * 60 - 30))
    const errorRate = Math.max(0.001, 0.02 + Math.random() * 0.02 - 0.01)
    const cacheHitRate = Math.max(0.1, 0.6 + Math.random() * 0.2 - 0.1)

    data.push({
      timestamp: date,
      requests,
      uniqueUsers,
      avgLatency,
      errorRate,
      cacheHitRate,
    })
  }

  return data
}

// 生成模拟的错误分布数据
const generateMockErrorDistribution = (): ErrorDistribution[] => {
  const errors = [
    { errorCode: "401", errorMessage: "未授权访问" },
    { errorCode: "403", errorMessage: "权限不足" },
    { errorCode: "404", errorMessage: "资源不存在" },
    { errorCode: "429", errorMessage: "请求频率超限" },
    { errorCode: "500", errorMessage: "服务器内部错误" },
    { errorCode: "503", errorMessage: "服务不可用" },
  ]

  // 总错误数
  const totalErrors = 1000

  // 分配错误比例
  const errorCounts = [350, 250, 150, 120, 100, 30]

  return errors.map((error, index) => ({
    ...error,
    count: errorCounts[index],
    percentage: (errorCounts[index] / totalErrors) * 100,
  }))
}

// 生成模拟的地理分布数据
const generateMockGeoDistribution = (): GeoDistribution[] => {
  const countries = [
    { country: "中国", requests: 8500 },
    { country: "美国", requests: 3200 },
    { country: "日本", requests: 1800 },
    { country: "韩国", requests: 1200 },
    { country: "德国", requests: 950 },
    { country: "英国", requests: 850 },
    { country: "法国", requests: 750 },
    { country: "其他", requests: 1750 },
  ]

  const totalRequests = countries.reduce((sum, country) => sum + country.requests, 0)

  return countries.map((country) => ({
    ...country,
    percentage: (country.requests / totalRequests) * 100,
  }))
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// 格式化日期
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  })
}

// 颜色配置
const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#8b5cf6",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#06b6d4",
  success: "#22c55e",
  background: "#f8fafc",
  pieColors: ["#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#f59e0b", "#06b6d4", "#22c55e", "#94a3b8"],
}

export function ApiUsageStats() {
  const { t } = useLanguage()
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [chartType, setChartType] = useState<ChartType>("requests")
  const [loading, setLoading] = useState(false)
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  // 模拟数据
  const [endpointUsage, setEndpointUsage] = useState<EndpointUsage[]>([])
  const [userUsage, setUserUsage] = useState<UserUsage[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([])
  const [errorDistribution, setErrorDistribution] = useState<ErrorDistribution[]>([])
  const [geoDistribution, setGeoDistribution] = useState<GeoDistribution[]>([])

  // 加载数据
  useEffect(() => {
    loadData()
  }, [timeRange])

  // 加载数据函数
  const loadData = () => {
    setLoading(true)

    // 模拟API调用延迟
    setTimeout(() => {
      // 根据时间范围生成不同的数据
      let days = 7
      switch (timeRange) {
        case "24h":
          days = 1
          break
        case "7d":
          days = 7
          break
        case "30d":
          days = 30
          break
        case "90d":
          days = 90
          break
        case "custom":
          // 计算自定义日期范围的天数
          const start = new Date(customDateRange.start)
          const end = new Date(customDateRange.end)
          days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          break
      }

      setEndpointUsage(generateMockEndpointUsage())
      setUserUsage(generateMockUserUsage())
      setTimeSeriesData(generateMockTimeSeriesData(days))
      setErrorDistribution(generateMockErrorDistribution())
      setGeoDistribution(generateMockGeoDistribution())

      setLoading(false)
    }, 800)
  }

  // 刷新数据
  const refreshData = () => {
    loadData()
  }

  // 计算总请求数
  const totalRequests = timeSeriesData.reduce((sum, dataPoint) => sum + dataPoint.requests, 0)

  // 计算平均延迟
  const avgLatency =
    timeSeriesData.reduce((sum, dataPoint) => sum + dataPoint.avgLatency, 0) / timeSeriesData.length || 0

  // 计算平均错误率
  const avgErrorRate =
    timeSeriesData.reduce((sum, dataPoint) => sum + dataPoint.errorRate, 0) / timeSeriesData.length || 0

  // 计算平均缓存命中率
  const avgCacheHitRate =
    timeSeriesData.reduce((sum, dataPoint) => sum + dataPoint.cacheHitRate, 0) / timeSeriesData.length || 0

  // 计算同比增长率（假设与上一个相同时间段相比）
  const growthRate = 0.23 // 模拟23%的增长率

  // 获取请求量最高的端点
  const topEndpoint = endpointUsage.length > 0 ? endpointUsage.sort((a, b) => b.requests - a.requests)[0] : null

  // 获取错误率最高的端点
  const highestErrorEndpoint =
    endpointUsage.length > 0 ? endpointUsage.sort((a, b) => b.errorRate - a.errorRate)[0] : null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API使用统计</h2>
          <p className="text-muted-foreground">详细的API使用数据和分析</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">过去24小时</SelectItem>
              <SelectItem value="7d">过去7天</SelectItem>
              <SelectItem value="30d">过去30天</SelectItem>
              <SelectItem value="90d">过去90天</SelectItem>
              <SelectItem value="custom">自定义范围</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {timeRange === "custom" && (
        <div className="flex items-center space-x-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="start-date" className="text-sm font-medium">
                开始日期
              </label>
              <input
                id="start-date"
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="end-date" className="text-sm font-medium">
                结束日期
              </label>
              <input
                id="end-date"
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <Button onClick={loadData} disabled={loading}>
            应用
          </Button>
        </div>
      )}

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总请求数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{formatNumber(totalRequests)}</span>
                <Badge variant="outline" className={`ml-2 ${growthRate > 0 ? "text-green-600" : "text-red-600"}`}>
                  {growthRate > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs(growthRate * 100).toFixed(1)}%
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">与上一时段相比</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{avgLatency.toFixed(0)} ms</span>
                <Badge variant="outline" className={`ml-2 ${avgLatency < 150 ? "text-green-600" : "text-yellow-600"}`}>
                  {avgLatency < 150 ? "良好" : "一般"}
                </Badge>
              </div>
              <Progress
                value={Math.min(100, (avgLatency / 300) * 100)}
                max={100}
                className="h-1 mt-2"
                style={
                  {
                    backgroundColor: "#e2e8f0",
                    "--progress-color":
                      avgLatency < 100 ? COLORS.success : avgLatency < 200 ? COLORS.warning : COLORS.error,
                  } as any
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均错误率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{(avgErrorRate * 100).toFixed(2)}%</span>
                <Badge
                  variant="outline"
                  className={`ml-2 ${
                    avgErrorRate < 0.01 ? "text-green-600" : avgErrorRate < 0.05 ? "text-yellow-600" : "text-red-600"
                  }`}
                >
                  {avgErrorRate < 0.01 ? "极低" : avgErrorRate < 0.05 ? "正常" : "偏高"}
                </Badge>
              </div>
              <Progress
                value={Math.min(100, avgErrorRate * 1000)}
                max={100}
                className="h-1 mt-2"
                style={
                  {
                    backgroundColor: "#e2e8f0",
                    "--progress-color":
                      avgErrorRate < 0.01 ? COLORS.success : avgErrorRate < 0.05 ? COLORS.warning : COLORS.error,
                  } as any
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">缓存命中率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{(avgCacheHitRate * 100).toFixed(1)}%</span>
                <Badge
                  variant="outline"
                  className={`ml-2 ${
                    avgCacheHitRate > 0.7
                      ? "text-green-600"
                      : avgCacheHitRate > 0.4
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {avgCacheHitRate > 0.7 ? "优秀" : avgCacheHitRate > 0.4 ? "一般" : "较低"}
                </Badge>
              </div>
              <Progress
                value={avgCacheHitRate * 100}
                max={100}
                className="h-1 mt-2"
                style={
                  {
                    backgroundColor: "#e2e8f0",
                    "--progress-color":
                      avgCacheHitRate > 0.7 ? COLORS.success : avgCacheHitRate > 0.4 ? COLORS.warning : COLORS.error,
                  } as any
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要图表 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>API使用趋势</CardTitle>
            <div className="flex items-center space-x-2">
              <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                <TabsList>
                  <TabsTrigger value="requests">请求量</TabsTrigger>
                  <TabsTrigger value="latency">响应时间</TabsTrigger>
                  <TabsTrigger value="errors">错误率</TabsTrigger>
                  <TabsTrigger value="users">用户数</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
          <CardDescription>
            {chartType === "requests"
              ? "API请求量随时间变化趋势"
              : chartType === "latency"
                ? "API响应时间随时间变化趋势"
                : chartType === "errors"
                  ? "API错误率随时间变化趋势"
                  : "API活跃用户数随时间变化趋势"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "requests" || chartType === "users" ? (
                <BarChart
                  data={timeSeriesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => formatDate(new Date(timestamp))}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), chartType === "requests" ? "请求数" : "用户数"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Bar
                    dataKey={chartType === "requests" ? "requests" : "uniqueUsers"}
                    name={chartType === "requests" ? "请求数" : "活跃用户数"}
                    fill={COLORS.primary}
                  />
                </BarChart>
              ) : (
                <LineChart
                  data={timeSeriesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => formatDate(new Date(timestamp))}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    domain={chartType === "latency" ? [0, "dataMax + 50"] : [0, "dataMax"]}
                    tickFormatter={chartType === "errors" ? (value) => `${(value * 100).toFixed(1)}%` : undefined}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      chartType === "latency" ? `${value.toFixed(0)} ms` : `${(value * 100).toFixed(2)}%`,
                      chartType === "latency" ? "响应时间" : "错误率",
                    ]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={chartType === "latency" ? "avgLatency" : "errorRate"}
                    name={chartType === "latency" ? "平均响应时间" : "错误率"}
                    stroke={chartType === "latency" ? COLORS.warning : COLORS.error}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 端点使用情况和错误分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>端点使用情况</CardTitle>
            <CardDescription>各API端点的使用频率和性能指标</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索端点..."
                  className="flex-1 bg-background rounded-md border border-input px-3 py-2 text-sm"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  筛选
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">端点</th>
                      <th className="text-left py-3 px-4 font-medium">请求数</th>
                      <th className="text-left py-3 px-4 font-medium">响应时间</th>
                      <th className="text-left py-3 px-4 font-medium">错误率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpointUsage.slice(0, 5).map((endpoint, index) => (
                      <tr key={index} className={index !== endpointUsage.length - 1 ? "border-b" : ""}>
                        <td className="py-3 px-4 font-mono text-sm">{endpoint.endpoint}</td>
                        <td className="py-3 px-4">{formatNumber(endpoint.requests)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="font-medium">{endpoint.avgLatency.toFixed(0)} ms</span>
                            <Badge
                              variant="outline"
                              className={`ml-2 ${
                                endpoint.avgLatency < 100
                                  ? "text-green-600"
                                  : endpoint.avgLatency < 200
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {endpoint.avgLatency < 100 ? "快" : endpoint.avgLatency < 200 ? "中" : "慢"}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="font-medium">{(endpoint.errorRate * 100).toFixed(2)}%</span>
                            <Badge
                              variant="outline"
                              className={`ml-2 ${
                                endpoint.errorRate < 0.01
                                  ? "text-green-600"
                                  : endpoint.errorRate < 0.05
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {endpoint.errorRate < 0.01 ? "低" : endpoint.errorRate < 0.05 ? "中" : "高"}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button variant="outline" className="w-full">
                查看全部端点
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>错误分布</CardTitle>
            <CardDescription>API错误类型分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="errorCode"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {errorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value,
                      errorDistribution.find((e) => e.errorCode === name)?.errorMessage || name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>主要错误类型</AlertTitle>
                <AlertDescription>
                  401 (未授权访问) 和 403 (权限不足) 错误占比较高，建议检查认证机制和权限设置。
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户使用情况和地理分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>用户使用情况</CardTitle>
            <CardDescription>API用户活跃度和使用模式</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">用户</th>
                      <th className="text-left py-3 px-4 font-medium">组织</th>
                      <th className="text-left py-3 px-4 font-medium">请求数</th>
                      <th className="text-left py-3 px-4 font-medium">最近活动</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userUsage.map((user, index) => (
                      <tr key={index} className={index !== userUsage.length - 1 ? "border-b" : ""}>
                        <td className="py-3 px-4">{user.username}</td>
                        <td className="py-3 px-4">{user.organization}</td>
                        <td className="py-3 px-4">{formatNumber(user.requests)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                              {user.lastActive.toLocaleDateString("zh-CN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>地理分布</CardTitle>
            <CardDescription>API请求的地理来源分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geoDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="requests"
                    nameKey="country"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {geoDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatNumber(value), "请求数"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertTitle>地区洞察</AlertTitle>
                <AlertDescription>
                  中国和美国是主要的API使用区域，建议优化这些地区的API访问速度和稳定性。
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 洞察和建议 */}
      <Card>
        <CardHeader>
          <CardTitle>API使用洞察</CardTitle>
          <CardDescription>基于使用数据的分析和优化建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">性能洞察</h3>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <span className="bg-yellow-100 text-yellow-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                      !
                    </span>
                    <span>
                      <strong>{topEndpoint?.endpoint}</strong> 是请求量最高的端点，平均响应时间为{" "}
                      <strong>{topEndpoint?.avgLatency.toFixed(0)} ms</strong>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-red-100 text-red-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                      !
                    </span>
                    <span>
                      <strong>{highestErrorEndpoint?.endpoint}</strong> 的错误率最高，达到{" "}
                      <strong>{(highestErrorEndpoint?.errorRate || 0 * 100).toFixed(2)}%</strong>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                      i
                    </span>
                    <span>
                      工作日的API请求量比周末高出约 <strong>140%</strong>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">优化建议</h3>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                      ✓
                    </span>
                    <span>
                      为 <strong>{topEndpoint?.endpoint}</strong> 添加更多缓存策略，提高响应速度
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                      ✓
                    </span>
                    <span>
                      调查 <strong>{highestErrorEndpoint?.endpoint}</strong> 的错误原因，优先修复
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                      ✓
                    </span>
                    <span>在工作日高峰期增加服务器资源，优化性能</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                分享报告
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                导出完整报告
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
