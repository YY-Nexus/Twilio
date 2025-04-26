"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CreditCard, FileText, Users, Settings, Calendar, BarChart4 } from "lucide-react"
import { useEffect, useState } from "react"

const navItems = [
  {
    title: "仪表盘",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "文本分析",
    href: "/analysis",
    icon: CreditCard,
  },
  {
    title: "报表生成",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "语料管理",
    href: "/corpus",
    icon: Users,
  },
  {
    title: "模型训练",
    href: "/training",
    icon: Calendar,
  },
  {
    title: "数据可视化",
    href: "/visualization",
    icon: BarChart4,
  },
  {
    title: "系统设置",
    href: "/settings",
    icon: Settings,
  },
]

export function MainNav() {
  const pathname = usePathname()
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  // 预加载当前页面相关的链接
  useEffect(() => {
    // 找出与当前页面相关的导航项
    const currentIndex = navItems.findIndex((item) => item.href === pathname)
    if (currentIndex !== -1) {
      // 预加载前后的导航项
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : navItems.length - 1
      const nextIndex = currentIndex < navItems.length - 1 ? currentIndex + 1 : 0

      // 创建link预加载标签
      const createPrefetchLink = (href: string) => {
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.href = href
        link.as = "document"
        document.head.appendChild(link)
        return link
      }

      // 预加载前后的页面
      const prevLink = createPrefetchLink(navItems[prevIndex].href)
      const nextLink = createPrefetchLink(navItems[nextIndex].href)

      return () => {
        // 清理预加载标签
        document.head.removeChild(prevLink)
        document.head.removeChild(nextLink)
      }
    }
  }, [pathname])

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-blue-600 relative",
              isActive ? "text-blue-600" : "text-gray-700",
            )}
            prefetch={true}
            onMouseEnter={() => setHoveredLink(item.href)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.title}
            {hoveredLink === item.href && !isActive && (
              <span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform origin-left transition-transform duration-300"
                style={{ transform: "scaleX(1)" }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
