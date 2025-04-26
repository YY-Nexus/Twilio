"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CreditCard, FileText, Users, Settings, Calendar, BarChart4 } from "lucide-react"

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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [touchedLinks, setTouchedLinks] = useState<Set<string>>(new Set())

  // 预加载常用页面
  useEffect(() => {
    const prefetchLinks = ["/dashboard", "/analysis", "/reports", "/visualization"]

    // 创建link预加载标签
    prefetchLinks.forEach((href) => {
      if (href !== pathname) {
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.href = href
        link.as = "document"
        document.head.appendChild(link)
      }
    })
  }, [pathname])

  // 记录用户触摸过的链接，用于预测用户可能访问的页面
  const handleLinkTouch = (href: string) => {
    setTouchedLinks((prev) => {
      const newSet = new Set(prev)
      newSet.add(href)
      return newSet
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">打开菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)} prefetch={true}>
            <div className="h-6 flex items-center mr-2">
              <Image
                src="/images/logo-header.png"
                alt="言语智能Logo"
                width={80}
                height={20}
                className="h-auto max-h-full object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              言语「逸品」数字引擎
            </span>
          </Link>
        </div>
        <div className="flex flex-col gap-4 mt-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                onTouchStart={() => handleLinkTouch(item.href)}
                prefetch={touchedLinks.has(item.href) || ["/dashboard", "/analysis", "/reports"].includes(item.href)}
                className={cn(
                  "flex items-center gap-2 px-7 py-2 text-base font-medium transition-colors hover:text-blue-600",
                  isActive ? "bg-blue-50 text-blue-600" : "text-gray-700",
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
