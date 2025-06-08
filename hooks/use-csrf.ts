"use client"

import { useState, useEffect, useCallback } from "react"
import { useNotifications } from "@/providers/app-provider"

interface CSRFHookOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  onTokenExpired?: () => void
}

export function useCSRF(options: CSRFHookOptions = {}) {
  const [csrfToken, setCSRFToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useNotifications()

  const {
    autoRefresh = true,
    refreshInterval = 23 * 60 * 60 * 1000, // 23小时自动刷新
    onTokenExpired,
  } = options

  // 获取CSRF令牌
  const fetchCSRFToken = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include", // 确保包含Cookie
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setCSRFToken(data.data.csrfToken)
        console.log("✅ CSRF令牌获取成功")
      } else {
        throw new Error(data.message || "获取CSRF令牌失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取CSRF令牌失败"
      setError(errorMessage)
      console.error("❌ CSRF令牌获取失败:", errorMessage)

      addNotification({
        type: "error",
        title: "安全令牌获取失败",
        message: "请刷新页面重试",
      })
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  // 刷新CSRF令牌
  const refreshCSRFToken = useCallback(async () => {
    try {
      const response = await fetch("/api/csrf-token", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setCSRFToken(data.data.csrfToken)
        console.log("🔄 CSRF令牌刷新成功")

        addNotification({
          type: "info",
          title: "安全令牌已更新",
          message: "为了您的安全，令牌已自动更新",
        })
      } else {
        throw new Error(data.message || "刷新CSRF令牌失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "刷新CSRF令牌失败"
      setError(errorMessage)
      console.error("❌ CSRF令牌刷新失败:", errorMessage)
    }
  }, [addNotification])

  // 创建带CSRF保护的fetch函数
  const securedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!csrfToken) {
        throw new Error("CSRF令牌未准备就绪，请稍后重试")
      }

      // 只对需要CSRF保护的方法添加令牌
      const method = options.method?.toUpperCase() || "GET"
      const needsCSRF = ["POST", "PUT", "DELETE", "PATCH"].includes(method)

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      }

      if (needsCSRF) {
        headers["X-CSRF-Token"] = csrfToken
      }

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          credentials: "include", // 确保包含Cookie
        })

        // 检查是否是CSRF错误
        if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}))
          if (errorData.error === "CSRF_TOKEN_INVALID") {
            console.warn("🔄 CSRF令牌无效，尝试刷新...")
            await refreshCSRFToken()
            onTokenExpired?.()
            throw new Error("CSRF令牌已过期，请重试操作")
          }
        }

        return response
      } catch (error) {
        console.error("🚫 安全请求失败:", error)
        throw error
      }
    },
    [csrfToken, refreshCSRFToken, onTokenExpired],
  )

  // 初始化和自动刷新
  useEffect(() => {
    fetchCSRFToken()

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshCSRFToken, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchCSRFToken, refreshCSRFToken, autoRefresh, refreshInterval])

  // 页面可见性变化时刷新令牌
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && csrfToken) {
        // 页面重新可见时检查令牌是否需要刷新
        const shouldRefresh = Math.random() < 0.1 // 10%的概率刷新
        if (shouldRefresh) {
          refreshCSRFToken()
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [csrfToken, refreshCSRFToken])

  return {
    csrfToken,
    loading,
    error,
    securedFetch,
    refreshToken: refreshCSRFToken,
    fetchToken: fetchCSRFToken,
  }
}

// 便捷的安全表单提交Hook
export function useSecureForm() {
  const { securedFetch, csrfToken, loading } = useCSRF()

  const submitForm = useCallback(
    async (url: string, formData: Record<string, any>, options: RequestInit = {}) => {
      return securedFetch(url, {
        method: "POST",
        body: JSON.stringify(formData),
        ...options,
      })
    },
    [securedFetch],
  )

  return {
    submitForm,
    securedFetch,
    csrfToken,
    loading,
  }
}
