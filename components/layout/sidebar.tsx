"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  MessageCircle,
  Settings,
  Shield,
  Bell,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavigationItem {
  title: string
  href: string
  icon: any
  badge?: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    title: "控制台",
    href: "/",
    icon: Home,
  },
  {
    title: "用户管理",
    href: "/users",
    icon: Users,
    badge: "1,234",
    children: [
      { title: "用户列表", href: "/users", icon: Users },
      { title: "角色管理", href: "/users/roles", icon: Shield },
      { title: "权限设置", href: "/users/permissions", icon: Shield },
    ],
  },
  {
    title: "商品管理",
    href: "/products",
    icon: Package,
    badge: "856",
    children: [
      { title: "商品列表", href: "/products", icon: Package },
      { title: "分类管理", href: "/products/categories", icon: Package },
      { title: "库存管理", href: "/products/inventory", icon: Package },
    ],
  },
  {
    title: "订单处理",
    href: "/orders",
    icon: ShoppingCart,
    badge: "42",
    children: [
      { title: "订单列表", href: "/orders", icon: ShoppingCart },
      { title: "订单处理", href: "/orders/processing", icon: ShoppingCart },
      { title: "订单报表", href: "/orders/reports", icon: BarChart3 },
    ],
  },
  {
    title: "数据分析",
    href: "/analytics",
    icon: BarChart3,
    children: [
      { title: "销售分析", href: "/analytics/sales", icon: BarChart3 },
      { title: "用户分析", href: "/analytics/users", icon: Users },
      { title: "财务报表", href: "/analytics/financial", icon: BarChart3 },
    ],
  },
  {
    title: "客服系统",
    href: "/support",
    icon: MessageCircle,
    badge: "5",
    children: [
      { title: "工单管理", href: "/support/tickets", icon: MessageCircle },
      { title: "在线客服", href: "/support/chat", icon: MessageCircle },
      { title: "知识库", href: "/support/knowledge", icon: MessageCircle },
    ],
  },
  {
    title: "系统设置",
    href: "/settings",
    icon: Settings,
    children: [
      { title: "基本设置", href: "/settings", icon: Settings },
      { title: "集成配置", href: "/settings/integrations", icon: Settings },
      { title: "安全设置", href: "/settings/security", icon: Shield },
    ],
  },
]

function NavigationItemComponent({ item, level = 0 }: { item: NavigationItem; level?: number }) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const isActive = pathname === item.href
  const hasChildren = item.children && item.children.length > 0

  const Icon = item.icon

  return (
    <div>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-auto p-2 font-normal",
          level > 0 && "ml-4 w-[calc(100%-1rem)]",
          isActive && "bg-secondary text-secondary-foreground",
        )}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded)
          }
        }}
        asChild={!hasChildren}
      >
        {hasChildren ? (
          <div className="flex items-center w-full">
            <Icon className="mr-2 h-4 w-4" />
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto mr-2 text-xs">
                {item.badge}
              </Badge>
            )}
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        ) : (
          <Link href={item.href} className="flex items-center w-full">
            <Icon className="mr-2 h-4 w-4" />
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        )}
      </Button>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavigationItemComponent key={child.href} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* 移动端遮罩 */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      {/* 侧边栏 */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">整合平台</h2>
              <p className="text-xs text-muted-foreground">企业管理系统</p>
            </div>
          </div>

          {/* 移动端关闭按钮 */}
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 导航菜单 */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <NavigationItemComponent key={item.href} item={item} />
            ))}
          </div>

          <Separator className="my-4" />

          {/* 系统状态 */}
          <div className="space-y-2">
            <div className="px-2 py-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">系统状态</h3>
            </div>

            <div className="space-y-1 px-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">服务状态</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 text-xs">正常</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">在线用户</span>
                <span className="text-xs font-medium">1,234</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">系统负载</span>
                <span className="text-xs font-medium">68%</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* 侧边栏底部 */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">管理员</p>
              <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
