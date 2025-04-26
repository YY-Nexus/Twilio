"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState, useEffect } from "react"
import { PageTransition } from "@/components/page-transition"
import { useRoutePrefetch } from "@/hooks/use-route-prefetch"
import { usePathname } from "next/navigation"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const pathname = usePathname()

  // 使用路由预加载钩子
  useRoutePrefetch()

  // 防止水合不匹配
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 页面切换时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center" prefetch={true}>
              <div className="h-8 flex items-center mr-2">
                <Image
                  src="/images/logo-header.png"
                  alt="言语智能Logo"
                  width={100}
                  height={24}
                  className="h-auto max-h-full object-contain"
                  priority // 优先加载logo
                />
              </div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                言语「逸品」数字引擎
              </h2>
            </Link>
          </div>
          {isMobile ? (
            <MobileNav />
          ) : (
            <div className="flex items-center gap-4">
              <MainNav />
              <div className="ml-auto flex items-center space-x-4">
                <UserNav />
              </div>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
