// 权限定义
export const PERMISSIONS = {
  // 用户管理权限
  USERS: {
    VIEW: "users.view",
    CREATE: "users.create",
    EDIT: "users.edit",
    DELETE: "users.delete",
    MANAGE_ROLES: "users.manage_roles",
    MANAGE_PERMISSIONS: "users.manage_permissions",
  },

  // 商品管理权限
  PRODUCTS: {
    VIEW: "products.view",
    CREATE: "products.create",
    EDIT: "products.edit",
    DELETE: "products.delete",
    MANAGE_CATEGORIES: "products.manage_categories",
    MANAGE_INVENTORY: "products.manage_inventory",
  },

  // 订单管理权限
  ORDERS: {
    VIEW: "orders.view",
    CREATE: "orders.create",
    EDIT: "orders.edit",
    DELETE: "orders.delete",
    PROCESS: "orders.process",
    REPORTS: "orders.reports",
  },

  // 数据分析权限
  ANALYTICS: {
    VIEW: "analytics.view",
    SALES: "analytics.sales",
    USERS: "analytics.users",
    FINANCIAL: "analytics.financial",
    EXPORT: "analytics.export",
  },

  // 系统设置权限
  SETTINGS: {
    VIEW: "settings.view",
    GENERAL: "settings.general",
    INTEGRATIONS: "settings.integrations",
    SECURITY: "settings.security",
    BACKUP: "settings.backup",
  },

  // 客服系统权限
  SUPPORT: {
    VIEW: "support.view",
    TICKETS: "support.tickets",
    CHAT: "support.chat",
    KNOWLEDGE: "support.knowledge",
  },
} as const

// 角色定义
export const ROLES = {
  SUPER_ADMIN: {
    id: "super_admin",
    name: "超级管理员",
    description: "拥有系统所有权限",
    permissions: ["*"], // 通配符表示所有权限
  },

  ADMIN: {
    id: "admin",
    name: "管理员",
    description: "拥有大部分管理权限",
    permissions: [
      ...Object.values(PERMISSIONS.USERS),
      ...Object.values(PERMISSIONS.PRODUCTS),
      ...Object.values(PERMISSIONS.ORDERS),
      PERMISSIONS.ANALYTICS.VIEW,
      PERMISSIONS.ANALYTICS.SALES,
      PERMISSIONS.ANALYTICS.USERS,
      PERMISSIONS.SETTINGS.VIEW,
      PERMISSIONS.SETTINGS.GENERAL,
      ...Object.values(PERMISSIONS.SUPPORT),
    ],
  },

  MANAGER: {
    id: "manager",
    name: "部门经理",
    description: "拥有部门管理权限",
    permissions: [
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.USERS.EDIT,
      ...Object.values(PERMISSIONS.PRODUCTS),
      ...Object.values(PERMISSIONS.ORDERS),
      PERMISSIONS.ANALYTICS.VIEW,
      PERMISSIONS.ANALYTICS.SALES,
      PERMISSIONS.SUPPORT.VIEW,
      PERMISSIONS.SUPPORT.TICKETS,
    ],
  },

  EMPLOYEE: {
    id: "employee",
    name: "普通员工",
    description: "基本操作权限",
    permissions: [
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.PRODUCTS.VIEW,
      PERMISSIONS.PRODUCTS.EDIT,
      PERMISSIONS.ORDERS.VIEW,
      PERMISSIONS.ORDERS.CREATE,
      PERMISSIONS.ORDERS.EDIT,
      PERMISSIONS.SUPPORT.VIEW,
      PERMISSIONS.SUPPORT.TICKETS,
    ],
  },

  CUSTOMER_SERVICE: {
    id: "customer_service",
    name: "客服专员",
    description: "客服相关权限",
    permissions: [
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.PRODUCTS.VIEW,
      PERMISSIONS.ORDERS.VIEW,
      ...Object.values(PERMISSIONS.SUPPORT),
    ],
  },
} as const

// 权限检查函数
export class PermissionManager {
  private userPermissions: string[]

  constructor(userPermissions: string[] = []) {
    this.userPermissions = userPermissions
  }

  // 检查单个权限
  hasPermission(permission: string): boolean {
    // 超级管理员拥有所有权限
    if (this.userPermissions.includes("*")) {
      return true
    }

    return this.userPermissions.includes(permission)
  }

  // 检查多个权限（需要全部拥有）
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission))
  }

  // 检查多个权限（拥有其中任一即可）
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission))
  }

  // 检查模块访问权限
  canAccessModule(modulePermissions: string[]): boolean {
    return this.hasAnyPermission(modulePermissions)
  }

  // 获取用户可访问的功能列表
  getAccessibleFeatures(features: Record<string, string[]>): string[] {
    return Object.entries(features)
      .filter(([_, permissions]) => this.hasAnyPermission(permissions))
      .map(([feature]) => feature)
  }

  // 更新用户权限
  updatePermissions(newPermissions: string[]) {
    this.userPermissions = newPermissions
  }
}

// 权限装饰器Hook
import { useApp } from "@/store/app"

export function usePermissions() {
  const { state } = useApp()
  const userPermissions = state.user?.permissions || []

  const permissionManager = new PermissionManager(userPermissions)

  return {
    hasPermission: permissionManager.hasPermission.bind(permissionManager),
    hasAllPermissions: permissionManager.hasAllPermissions.bind(permissionManager),
    hasAnyPermission: permissionManager.hasAnyPermission.bind(permissionManager),
    canAccessModule: permissionManager.canAccessModule.bind(permissionManager),
    getAccessibleFeatures: permissionManager.getAccessibleFeatures.bind(permissionManager),
    userPermissions,
  }
}

console.log("权限系统已初始化：")
console.log("- 定义了6个角色和完整的权限体系")
console.log("- 提供了PermissionManager类进行权限检查")
console.log("- 包含usePermissions Hook用于组件中的权限控制")
