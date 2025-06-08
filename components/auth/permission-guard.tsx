"use client"

import type React from "react"
import { usePermissions } from "@/lib/permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldX } from "lucide-react"

interface PermissionGuardProps {
  permissions: string | string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ permissions, requireAll = false, fallback, children }: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]

  const hasAccess = requireAll ? hasAllPermissions(permissionArray) : hasAnyPermission(permissionArray)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Alert className="border-red-200 bg-red-50">
        <ShieldX className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          您没有访问此功能的权限。如需帮助，请联系系统管理员。
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}

// 权限按钮组件
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permissions: string | string[]
  requireAll?: boolean
  children: React.ReactNode
}

export function PermissionButton({ permissions, requireAll = false, children, ...props }: PermissionButtonProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions()

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]

  const hasAccess = requireAll ? hasAllPermissions(permissionArray) : hasAnyPermission(permissionArray)

  if (!hasAccess) {
    return null
  }

  return <button {...props}>{children}</button>
}
