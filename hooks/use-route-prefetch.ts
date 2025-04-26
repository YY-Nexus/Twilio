"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

// 定义应用中的主要路由
const mainRoutes = ["/dashboard", "/analysis", "/reports", "/corpus", "/training", "/visualization", "/settings"]

/**
 * 路由预加载钩子
 * 预加载主要路由，减少页面跳转延迟
 */
export function useRoutePrefetch() {
  const router = useRouter()
  const currentPath = usePathname()

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === "undefined") return

    // 创建一个IntersectionObserver来检测用户是否已经滚动到页面底部
    // 这表明用户可能即将完成当前页面的浏览，准备跳转到其他页面
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // 用户已滚动到页面底部，预加载所有主要路由
          prefetchRoutes()
        }
      },
      { threshold: 0.1 },
    )

    // 创建一个元素作为页面底部的标记
    const bottomMarker = document.createElement("div")
    bottomMarker.style.height = "1px"
    bottomMarker.style.width = "100%"
    bottomMarker.style.position = "absolute"
    bottomMarker.style.bottom = "300px" // 在页面底部300px处
    bottomMarker.style.left = "0"
    bottomMarker.style.pointerEvents = "none"
    document.body.appendChild(bottomMarker)

    // 观察底部标记
    observer.observe(bottomMarker)

    // 监听鼠标悬停在导航链接上的事件
    const prefetchOnHover = () => {
      const navLinks = document.querySelectorAll('a[href^="/"]')

      navLinks.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          const href = link.getAttribute("href")
          if (href && href !== currentPath) {
            // 预加载用户悬停的链接
            router.prefetch(href)
          }
        })
      })
    }

    // 页面加载后延迟执行预加载
    const timer = setTimeout(() => {
      // 预加载当前路径相关的路由
      prefetchRelatedRoutes()

      // 设置导航链接的悬停预加载
      prefetchOnHover()
    }, 1000)

    // 清理函数
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      if (document.body.contains(bottomMarker)) {
        document.body.removeChild(bottomMarker)
      }
    }
  }, [router, currentPath])

  // 预加载所有主要路由
  const prefetchRoutes = () => {
    mainRoutes.forEach((route) => {
      if (route !== currentPath) {
        router.prefetch(route)
      }
    })
  }

  // 预加载与当前路径相关的路由
  const prefetchRelatedRoutes = () => {
    // 根据当前路径确定相关路由
    let relatedRoutes: string[] = []

    if (currentPath === "/") {
      // 从首页可能会跳转到仪表盘或常用功能
      relatedRoutes = ["/dashboard", "/analysis", "/reports"]
    } else if (currentPath === "/dashboard") {
      // 从仪表盘可能会跳转到各个功能模块
      relatedRoutes = ["/analysis", "/reports", "/visualization"]
    } else if (currentPath === "/reports") {
      // 从报表页面可能会跳转到可视化或分析
      relatedRoutes = ["/visualization", "/analysis"]
    } else if (currentPath === "/analysis") {
      // 从分析页面可能会跳转到报表或可视化
      relatedRoutes = ["/reports", "/visualization"]
    } else {
      // 默认预加载仪表盘
      relatedRoutes = ["/dashboard"]
    }

    // 预加载相关路由
    relatedRoutes.forEach((route) => {
      if (route !== currentPath) {
        router.prefetch(route)
      }
    })
  }
}
