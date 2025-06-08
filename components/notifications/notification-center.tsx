"use client"

import { useState, useEffect } from "react"
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useNotifications } from "@/providers/app-provider"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface NotificationCenterProps {
  maxVisible?: number
}

export function NotificationCenter({ maxVisible = 5 }: NotificationCenterProps) {
  const { notifications, removeNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // 计算未读通知数量
  useEffect(() => {
    setUnreadCount(notifications.length)
  }, [notifications])

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  // 获取通知背景色
  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-orange-50 border-orange-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  // 清除所有通知
  const clearAllNotifications = () => {
    notifications.forEach((notification) => {
      removeNotification(notification.id)
    })
  }

  // 标记所有为已读（这里简化为清除）
  const markAllAsRead = () => {
    clearAllNotifications()
  }

  return (
    <>
      {/* 浮动通知 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.slice(0, maxVisible).map((notification) => (
          <Card
            key={notification.id}
            className={`w-80 shadow-lg animate-in slide-in-from-right-full ${getNotificationBgColor(notification.type)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(notification.timestamp, {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 通知中心按钮 */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">通知中心</CardTitle>
                <div className="flex space-x-2">
                  {notifications.length > 0 && (
                    <>
                      <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                        全部已读
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-xs">
                        清空
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>暂无新通知</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                        index < maxVisible ? "" : "opacity-60"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="flex-shrink-0 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </>
  )
}
