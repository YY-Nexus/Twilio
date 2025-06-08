import { Users, ShoppingCart, Package, BarChart3, MessageCircle, Settings, Home } from "lucide-react"

export interface ModuleConfig {
  id: string
  name: string
  description: string
  icon: any
  path: string
  enabled: boolean
  permissions: string[]
  subModules?: SubModuleConfig[]
}

export interface SubModuleConfig {
  id: string
  name: string
  path: string
  permissions: string[]
}

export const moduleConfigs: ModuleConfig[] = [
  {
    id: "dashboard",
    name: "控制台",
    description: "系统概览和关键指标",
    icon: Home,
    path: "/",
    enabled: true,
    permissions: ["dashboard.view"],
  },
  {
    id: "users",
    name: "用户管理",
    description: "用户账户和权限管理",
    icon: Users,
    path: "/users",
    enabled: true,
    permissions: ["users.view"],
    subModules: [
      {
        id: "user-list",
        name: "用户列表",
        path: "/users",
        permissions: ["users.view"],
      },
      {
        id: "user-roles",
        name: "角色管理",
        path: "/users/roles",
        permissions: ["users.manage_roles"],
      },
      {
        id: "user-permissions",
        name: "权限设置",
        path: "/users/permissions",
        permissions: ["users.manage_permissions"],
      },
    ],
  },
  {
    id: "products",
    name: "商品管理",
    description: "商品信息和库存管理",
    icon: Package,
    path: "/products",
    enabled: true,
    permissions: ["products.view"],
    subModules: [
      {
        id: "product-list",
        name: "商品列表",
        path: "/products",
        permissions: ["products.view"],
      },
      {
        id: "product-categories",
        name: "分类管理",
        path: "/products/categories",
        permissions: ["products.manage_categories"],
      },
      {
        id: "inventory",
        name: "库存管理",
        path: "/products/inventory",
        permissions: ["products.manage_inventory"],
      },
    ],
  },
  {
    id: "orders",
    name: "订单处理",
    description: "订单管理和处理流程",
    icon: ShoppingCart,
    path: "/orders",
    enabled: true,
    permissions: ["orders.view"],
    subModules: [
      {
        id: "order-list",
        name: "订单列表",
        path: "/orders",
        permissions: ["orders.view"],
      },
      {
        id: "order-processing",
        name: "订单处理",
        path: "/orders/processing",
        permissions: ["orders.process"],
      },
      {
        id: "order-reports",
        name: "订单报表",
        path: "/orders/reports",
        permissions: ["orders.reports"],
      },
    ],
  },
  {
    id: "analytics",
    name: "数据分析",
    description: "业务数据分析和报表",
    icon: BarChart3,
    path: "/analytics",
    enabled: true,
    permissions: ["analytics.view"],
    subModules: [
      {
        id: "sales-analytics",
        name: "销售分析",
        path: "/analytics/sales",
        permissions: ["analytics.sales"],
      },
      {
        id: "user-analytics",
        name: "用户分析",
        path: "/analytics/users",
        permissions: ["analytics.users"],
      },
      {
        id: "financial-reports",
        name: "财务报表",
        path: "/analytics/financial",
        permissions: ["analytics.financial"],
      },
    ],
  },
  {
    id: "support",
    name: "客服系统",
    description: "客户服务和支持管理",
    icon: MessageCircle,
    path: "/support",
    enabled: true,
    permissions: ["support.view"],
    subModules: [
      {
        id: "tickets",
        name: "工单管理",
        path: "/support/tickets",
        permissions: ["support.tickets"],
      },
      {
        id: "chat",
        name: "在线客服",
        path: "/support/chat",
        permissions: ["support.chat"],
      },
      {
        id: "knowledge-base",
        name: "知识库",
        path: "/support/knowledge",
        permissions: ["support.knowledge"],
      },
    ],
  },
  {
    id: "settings",
    name: "系统设置",
    description: "系统配置和管理",
    icon: Settings,
    path: "/settings",
    enabled: true,
    permissions: ["settings.view"],
    subModules: [
      {
        id: "general",
        name: "基本设置",
        path: "/settings",
        permissions: ["settings.general"],
      },
      {
        id: "integrations",
        name: "集成配置",
        path: "/settings/integrations",
        permissions: ["settings.integrations"],
      },
      {
        id: "security",
        name: "安全设置",
        path: "/settings/security",
        permissions: ["settings.security"],
      },
    ],
  },
]

// 权限检查函数
export function hasPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(
    (permission) => userPermissions.includes(permission) || userPermissions.includes("*"),
  )
}

// 获取用户可访问的模块
export function getAccessibleModules(userPermissions: string[]): ModuleConfig[] {
  return moduleConfigs
    .filter((module) => module.enabled && hasPermission(userPermissions, module.permissions))
    .map((module) => ({
      ...module,
      subModules: module.subModules?.filter((subModule) => hasPermission(userPermissions, subModule.permissions)),
    }))
}
