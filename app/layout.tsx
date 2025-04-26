import type React from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ResourcePreloader } from "@/components/resource-preloader"
import "./globals.css"

export const metadata = {
  title: "言语「逸品」数字引擎",
  description: "专业的言语分析与处理平台",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预加载关键字体 */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {/* 添加资源预加载组件 */}
          <ResourcePreloader />
          {/* 添加背景元素 */}
          <div className="app-background"></div>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
