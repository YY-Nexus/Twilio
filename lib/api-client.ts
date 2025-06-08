interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  // 设置认证令牌
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  // 通用请求方法
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "请求失败")
      }

      return data
    } catch (error) {
      console.error("API请求错误:", error)
      throw error
    }
  }

  // GET请求
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url, { method: "GET" })
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // 分页查询
  async getPaginated<T>(
    endpoint: string,
    page = 1,
    limit = 10,
    filters?: Record<string, any>,
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    }
    return this.get<PaginatedResponse<T>>(endpoint, params)
  }

  // 文件上传
  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })
    }

    return this.request(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        // 移除Content-Type，让浏览器自动设置
        ...Object.fromEntries(Object.entries(this.defaultHeaders).filter(([key]) => key !== "Content-Type")),
      },
    })
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient()

// 模块化的API服务
export const userApi = {
  // 获取用户列表
  getUsers: (page?: number, limit?: number, search?: string) =>
    apiClient.getPaginated("/users", page, limit, search ? { search } : undefined),

  // 获取单个用户
  getUser: (id: string) => apiClient.get(`/users/${id}`),

  // 创建用户
  createUser: (userData: any) => apiClient.post("/users", userData),

  // 更新用户
  updateUser: (id: string, userData: any) => apiClient.put(`/users/${id}`, userData),

  // 删除用户
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),

  // 获取用户角色
  getUserRoles: () => apiClient.get("/users/roles"),
}

export const productApi = {
  // 获取商品列表
  getProducts: (page?: number, limit?: number, filters?: any) =>
    apiClient.getPaginated("/products", page, limit, filters),

  // 获取单个商品
  getProduct: (id: string) => apiClient.get(`/products/${id}`),

  // 创建商品
  createProduct: (productData: any) => apiClient.post("/products", productData),

  // 更新商品
  updateProduct: (id: string, productData: any) => apiClient.put(`/products/${id}`, productData),

  // 删除商品
  deleteProduct: (id: string) => apiClient.delete(`/products/${id}`),

  // 获取商品分类
  getCategories: () => apiClient.get("/products/categories"),

  // 上传商品图片
  uploadProductImage: (file: File, productId?: string) =>
    apiClient.uploadFile("/products/upload-image", file, productId ? { productId } : undefined),
}

export const orderApi = {
  // 获取订单列表
  getOrders: (page?: number, limit?: number, filters?: any) => apiClient.getPaginated("/orders", page, limit, filters),

  // 获取单个订单
  getOrder: (id: string) => apiClient.get(`/orders/${id}`),

  // 创建订单
  createOrder: (orderData: any) => apiClient.post("/orders", orderData),

  // 更新订单状态
  updateOrderStatus: (id: string, status: string) => apiClient.put(`/orders/${id}/status`, { status }),

  // 获取订单统计
  getOrderStats: (dateRange?: { start: string; end: string }) => apiClient.get("/orders/stats", dateRange),
}

export const analyticsApi = {
  // 获取仪表板数据
  getDashboardData: () => apiClient.get("/analytics/dashboard"),

  // 获取销售数据
  getSalesData: (period: string) => apiClient.get("/analytics/sales", { period }),

  // 获取用户分析数据
  getUserAnalytics: (period: string) => apiClient.get("/analytics/users", { period }),

  // 获取商品分析数据
  getProductAnalytics: (period: string) => apiClient.get("/analytics/products", { period }),
}

// 认证相关API
export const authApi = {
  // 登录
  login: (credentials: { email: string; password: string }) => apiClient.post("/auth/login", credentials),

  // 注册
  register: (userData: any) => apiClient.post("/auth/register", userData),

  // 登出
  logout: () => apiClient.post("/auth/logout"),

  // 获取当前用户信息
  getCurrentUser: () => apiClient.get("/auth/me"),

  // 刷新令牌
  refreshToken: () => apiClient.post("/auth/refresh"),

  // 重置密码
  resetPassword: (email: string) => apiClient.post("/auth/reset-password", { email }),
}

// 系统设置API
export const settingsApi = {
  // 获取系统设置
  getSettings: () => apiClient.get("/settings"),

  // 更新系统设置
  updateSettings: (settings: any) => apiClient.put("/settings", settings),

  // 获取集成配置
  getIntegrations: () => apiClient.get("/settings/integrations"),

  // 更新集成配置
  updateIntegration: (id: string, config: any) => apiClient.put(`/settings/integrations/${id}`, config),
}

console.log("API客户端已初始化，支持以下模块：")
console.log("- 用户管理 (userApi)")
console.log("- 商品管理 (productApi)")
console.log("- 订单处理 (orderApi)")
console.log("- 数据分析 (analyticsApi)")
console.log("- 用户认证 (authApi)")
console.log("- 系统设置 (settingsApi)")
