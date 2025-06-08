"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useNotifications } from "@/providers/app-provider"

interface SessionTimeoutConfig {
  warningTime: number // 警告时间（毫秒）
  checkInterval: number // 检查间隔（毫秒）
  onTimeout?: () => void // 超时回调
  onWarning?: (timeLeft: number) => void // 警告回调
}

export function useSessionTimeout(config: SessionTimeoutConfig) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const { addNotification } = useNotifications()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef(Date.now())

  // 更新活动时间
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    setIsActive(true)
    setShowWarning(false)
  }, [])

  // 检查会话状态
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session/check")
      const data = await response.json()

      if (data.success) {
        const { timeUntilExpiry, shouldWarn } = data.data
        setTimeLeft(timeUntilExpiry)

        if (shouldWarn && !showWarning) {
          setShowWarning(true)
          config.onWarning?.(timeUntilExpiry)

          addNotification({
            type: "warning",
            title: "会话即将过期",
            message: `您的会话将在 ${Math.ceil(timeUntilExpiry / 60000)} 分钟后过期`,
          })
        }

        if (timeUntilExpiry <= 0) {
          config.onTimeout?.()
          setIsActive(false)
        }
      } else {
        // 会话无效
        config.onTimeout?.()
        setIsActive(false)
      }
    } catch (error) {
      console.error("检查会话状态失败:", error)
    }
  }, [showWarning, config, addNotification])

  // 延长会话
  const extendSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session/extend", {
        method: "POST",
      })

      if (response.ok) {
        setShowWarning(false)
        updateActivity()

        addNotification({
          type: "success",
          title: "会话已延长",
          message: "您的会话已成功延长",
        })

        return true
      }
    } catch (error) {
      console.error("延长会话失败:", error)
    }
    return false
  }, [updateActivity, addNotification])

  // 监听用户活动
  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      updateActivity()
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [updateActivity])

  // 定期检查会话状态
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(checkSession, config.checkInterval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, checkSession, config.checkInterval])

  return {
    timeLeft,
    showWarning,
    isActive,
    extendSession,
    updateActivity,
  }
}
