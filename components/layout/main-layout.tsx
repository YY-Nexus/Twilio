"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useApp } from "@/providers/app-provider"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
}

function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`} />
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { state } = useApp()

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div>
            <h2 className="text-lg font-semibold">正在加载应用...</h2>
            <p className="text-muted-foreground">请稍候，系统正在初始化</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* 侧边栏 */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 主内容区域 */}
        <main className="flex-1 lg:ml-0">
          <div className="container mx-auto p-6">
            {/* 错误提示 */}
            {state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <p className="text-red-800 font-medium">系统错误</p>
                </div>
                <p className="text-red-700 mt-1">{state.error}</p>
              </div>
            )}

            {/* 页面内容 */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
