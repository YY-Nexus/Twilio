"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSecureForm } from "@/hooks/use-csrf"
import { useNotifications } from "@/providers/app-provider"

interface SecureFormProps {
  action: string
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  children?: React.ReactNode
}

export function SecureForm({ action, onSuccess, onError, children }: SecureFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const { submitForm, loading: csrfLoading } = useSecureForm()
  const { addNotification } = useNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (csrfLoading) {
      addNotification({
        type: "warning",
        title: "请稍候",
        message: "安全验证正在初始化...",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await submitForm(action, formData)
      const result = await response.json()

      if (response.ok && result.success) {
        addNotification({
          type: "success",
          title: "操作成功",
          message: result.message || "操作已成功完成",
        })
        onSuccess?.(result.data)
      } else {
        throw new Error(result.message || "操作失败")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "操作失败"
      addNotification({
        type: "error",
        title: "操作失败",
        message: errorMessage,
      })
      onError?.(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children || (
        <>
          <Input placeholder="示例输入" onChange={(e) => handleInputChange("example", e.target.value)} />
        </>
      )}

      <Button type="submit" disabled={submitting || csrfLoading} className="w-full">
        {submitting ? "提交中..." : csrfLoading ? "安全验证中..." : "提交"}
      </Button>

      {csrfLoading && <p className="text-sm text-muted-foreground text-center">🛡️ 正在初始化安全保护...</p>}
    </form>
  )
}
