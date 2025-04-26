"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// 预加载资源类型
interface ResourceToPreload {
  href: string
  as: "script" | "style" | "image" | "font" | "document"
  type?: string
  crossOrigin?: "anonymous" | "use-credentials"
  media?: string
}

// 关键路径资源映射
const pathResourceMap: Record<string, ResourceToPreload[]> = {
  "/": [
    { href: "/dashboard", as: "document" },
    { href: "/images/logo-large.png", as: "image" },
  ],
  "/dashboard": [
    { href: "/analysis", as: "document" },
    { href: "/reports", as: "document" },
    { href: "/visualization", as: "document" },
  ],
  "/analysis": [
    { href: "/reports", as: "document" },
    { href: "/visualization", as: "document" },
  ],
  "/reports": [
    { href: "/visualization", as: "document" },
    { href: "/analysis", as: "document" },
  ],
  "/visualization": [
    { href: "/reports", as: "document" },
    { href: "/analysis", as: "document" },
  ],
}

// 全局共享资源
const sharedResources: ResourceToPreload[] = [
  { href: "/images/logo-header.png", as: "image" },
  { href: "/images/background.jpeg", as: "image" },
]

export function ResourcePreloader() {
  const pathname = usePathname()

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === "undefined") return

    // 获取当前路径的资源
    const pathResources = pathResourceMap[pathname] || []

    // 合并共享资源
    const resourcesToPreload = [...pathResources, ...sharedResources]

    // 已经存在的预加载链接
    const existingLinks = new Set(
      Array.from(document.head.querySelectorAll('link[rel="preload"]')).map((link) => (link as HTMLLinkElement).href),
    )

    // 创建预加载链接
    const links = resourcesToPreload
      .map((resource) => {
        // 如果已经存在相同的预加载链接，跳过
        if (existingLinks.has(new URL(resource.href, window.location.origin).href)) {
          return null
        }

        const link = document.createElement("link")
        link.rel = "preload"
        link.href = resource.href
        link.as = resource.as

        if (resource.type) link.type = resource.type
        if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin
        if (resource.media) link.media = resource.media

        return link
      })
      .filter(Boolean) as HTMLLinkElement[]

    // 添加到文档头
    links.forEach((link) => document.head.appendChild(link))

    // 清理函数
    return () => {
      links.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      })
    }
  }, [pathname])

  return null
}
