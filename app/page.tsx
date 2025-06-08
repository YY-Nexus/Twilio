import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, BarChart3, FolderOpen, Bell, ArrowRight, Shield, Lock, Activity } from "lucide-react"

const modules = [
  {
    title: "用户认证系统",
    description: "管理用户注册、登录和权限控制",
    href: "/auth",
    icon: Users,
    status: "已集成",
    color: "text-green-600",
  },
  {
    title: "数据展示面板",
    description: "实时数据可视化和分析报告",
    href: "/dashboard",
    icon: BarChart3,
    status: "已集成",
    color: "text-green-600",
  },
  {
    title: "文件管理模块",
    description: "文件上传、下载和组织管理",
    href: "/files",
    icon: FolderOpen,
    status: "已集成",
    color: "text-green-600",
  },
  {
    title: "消息通知系统",
    description: "实时消息推送和通知管理",
    href: "/notifications",
    icon: Bell,
    status: "已集成",
    color: "text-green-600",
  },
]

const securityFeatures = [
  {
    title: "双因素认证",
    description: "增强账户安全保护",
    icon: Shield,
    status: "已启用",
  },
  {
    title: "数据加密",
    description: "敏感数据安全存储",
    icon: Lock,
    status: "已启用",
  },
  {
    title: "实时监控",
    description: "安全事件实时追踪",
    icon: Activity,
    status: "已启用",
  },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">欢迎使用整合应用平台</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          将多个独立开发的应用模块整合为统一的管理平台，提供一站式解决方案
        </p>
      </div>

      {/* 安全状态概览 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Shield className="h-5 w-5" />
            <span>安全状态</span>
          </CardTitle>
          <CardDescription className="text-green-700">系统安全功能运行正常</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-green-800">{feature.title}</div>
                    <div className="text-sm text-green-600">{feature.description}</div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">{feature.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 应用模块 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Card key={module.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <span className={`text-sm font-medium ${module.color}`}>{module.status}</span>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-base">{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={module.href} className="flex items-center justify-center space-x-2">
                    <span>进入模块</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 系统状态 */}
      <Card>
        <CardHeader>
          <CardTitle>系统状态概览</CardTitle>
          <CardDescription>当前平台运行状态和关键指标</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-muted-foreground">已集成模块</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-muted-foreground">系统可用性</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">1,234</div>
              <div className="text-sm text-muted-foreground">活跃用户</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-600">99.9%</div>
              <div className="text-sm text-muted-foreground">响应时间</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用功能快速访问</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild>
              <Link href="/users">用户管理</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">商品管理</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/orders">订单处理</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/analytics">数据分析</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
