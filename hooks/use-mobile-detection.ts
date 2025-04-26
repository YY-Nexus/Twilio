"use client"

import { useState, useEffect } from "react"

export function useMobileDetection() {
  // 默认为false，避免服务器渲染与客户端不匹配
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    // 检测是否为移动设备
    const checkMobile = () => {
      const mobileQuery = window.matchMedia("(max-width: 640px)")
      const tabletQuery = window.matchMedia("(min-width: 641px) and (max-width: 1024px)")
      const landscapeQuery = window.matchMedia("(orientation: landscape)")

      setIsMobile(mobileQuery.matches)
      setIsTablet(tabletQuery.matches)
      setIsLandscape(landscapeQuery.matches)
    }

    // 初始检查
    checkMobile()

    // 监听窗口大小变化
    window.addEventListener("resize", checkMobile)

    // 监听设备方向变化
    window.addEventListener("orientationchange", checkMobile)

    // 清理函数
    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [])

  return { isMobile, isTablet, isLandscape }
}
