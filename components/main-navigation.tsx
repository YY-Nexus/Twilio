"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, BarChart3, FolderOpen, Bell, Settings } from "lucide-react"

const navigationItems = [
  {
    title: "首页",
    href: "/",
    icon: Home,
  },
  {
    title: "用户管理",
    href: "/auth",
    icon: Users,
  },
  {
    title: "数据面板",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "文件管理",
    href: "/files",
    icon: FolderOpen,
  },
  {
    title: "消息通知",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "系统设置",
    href: "/settings",
    icon: Settings,
  },
]

export function MainNavigation() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">整合平台</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button key={item.href} variant={isActive ? "default" : "ghost"} size="sm" asChild>
                <Link href={item.href} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
