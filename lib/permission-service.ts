// 用户类型
export interface User {
  id: string
  name: string
  role: string
  departments: string[]
}

// 获取当前用户
export function getCurrentUser(): User {
  // 在实际应用中，这里应该从认证上下文或API获取当前用户信息
  // 这里仅作为示例，返回模拟数据
  return {
    id: "user1",
    name: "管理员",
    role: "admin",
    departments: ["tech", "marketing", "sales", "hr", "finance"],
  }
}

// 检查用户是否有特定权限
export function hasPermission(permission: string, user: User): boolean {
  // 在实际应用中，这里应该根据用户角色和权限系统进行检查
  // 这里仅作为示例，基于用户角色进行简单判断

  // 管理员拥有所有权限
  if (user.role === "admin") {
    return true
  }

  // 部门经理拥有部分权限
  if (user.role === "manager") {
    const managerPermissions = ["report:create", "report:export", "report:view"]
    return managerPermissions.includes(permission)
  }

  // 普通员工拥有有限权限
  if (user.role === "employee") {
    const employeePermissions = ["report:view"]
    return employeePermissions.includes(permission)
  }

  return false
}

// 检查用户是否可以访问特定部门
export function canAccessDepartment(departmentId: string, user: User): boolean {
  // 在实际应用中，这里应该根据用户的部门权限进行检查
  // 这里仅作为示例，检查用户的departments数组
  return user.departments.includes(departmentId)
}

// 获取用户可访问的部门列表
export function getAccessibleDepartments(user: User): string[] {
  // 在实际应用中，这里应该根据用户的权限获取可访问的部门
  // 这里仅作为示例，返回用户的departments数组
  return user.departments
}
