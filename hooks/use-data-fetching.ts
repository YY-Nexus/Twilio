"use client"

import { useState, useEffect, useCallback } from "react"
import { useNotifications } from "@/providers/app-provider"

interface UseDataFetchingOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  autoFetch?: boolean
}

interface UseDataFetchingReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  setData: (data: T) => void
}

export function useDataFetching<T>(
  fetchFunction: () => Promise<{ data: T }>,
  options: UseDataFetchingOptions<T> = {},
): UseDataFetchingReturn<T> {
  const [data, setData] = useState<T | null>(options.initialData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { addNotification } = useNotifications()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchFunction()
      setData(response.data)
      options.onSuccess?.(response.data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("获取数据失败")
      setError(error)
      options.onError?.(error)

      addNotification({
        type: "error",
        title: "数据加载失败",
        message: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, options, addNotification])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData()
    }
  }, [fetchData, options.autoFetch])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  }
}

// 分页数据Hook
interface UsePaginatedDataOptions<T> {
  initialPage?: number
  initialLimit?: number
  filters?: Record<string, any>
  onSuccess?: (data: T[]) => void
  onError?: (error: Error) => void
}

interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function usePaginatedData<T>(
  fetchFunction: (page: number, limit: number, filters?: any) => Promise<{ data: PaginatedData<T> }>,
  options: UsePaginatedDataOptions<T> = {},
) {
  const [data, setData] = useState<T[]>([])
  const [pagination, setPagination] = useState({
    page: options.initialPage || 1,
    limit: options.initialLimit || 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState(options.filters || {})
  const { addNotification } = useNotifications()

  const fetchData = useCallback(
    async (page?: number, newFilters?: any) => {
      setLoading(true)
      setError(null)

      const currentPage = page || pagination.page
      const currentFilters = newFilters !== undefined ? newFilters : filters

      try {
        const response = await fetchFunction(currentPage, pagination.limit, currentFilters)
        setData(response.data.items)
        setPagination({
          ...pagination,
          page: currentPage,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        })
        options.onSuccess?.(response.data.items)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("获取数据失败")
        setError(error)
        options.onError?.(error)

        addNotification({
          type: "error",
          title: "数据加载失败",
          message: error.message,
        })
      } finally {
        setLoading(false)
      }
    },
    [fetchFunction, pagination, filters, options, addNotification],
  )

  // 切换页面
  const goToPage = useCallback(
    (page: number) => {
      fetchData(page)
    },
    [fetchData],
  )

  // 更新过滤条件
  const updateFilters = useCallback(
    (newFilters: any) => {
      setFilters(newFilters)
      fetchData(1, newFilters) // 重置到第一页
    },
    [fetchData],
  )

  // 刷新当前页
  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, []) // 只在组件挂载时执行

  return {
    data,
    pagination,
    loading,
    error,
    filters,
    goToPage,
    updateFilters,
    refresh,
    setData,
  }
}

// 表单提交Hook
interface UseFormSubmissionOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useFormSubmission<T, P>(
  submitFunction: (data: P) => Promise<{ data: T }>,
  options: UseFormSubmissionOptions<T> = {},
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { addNotification } = useNotifications()

  const submit = useCallback(
    async (formData: P) => {
      setLoading(true)
      setError(null)

      try {
        const response = await submitFunction(formData)
        options.onSuccess?.(response.data)

        if (options.successMessage) {
          addNotification({
            type: "success",
            title: "操作成功",
            message: options.successMessage,
          })
        }

        return response.data
      } catch (err) {
        const error = err instanceof Error ? err : new Error("提交失败")
        setError(error)
        options.onError?.(error)

        addNotification({
          type: "error",
          title: "操作失败",
          message: options.errorMessage || error.message,
        })

        throw error
      } finally {
        setLoading(false)
      }
    },
    [submitFunction, options, addNotification],
  )

  return {
    submit,
    loading,
    error,
  }
}

// 实时数据Hook（WebSocket）
export function useRealTimeData<T>(endpoint: string, initialData?: T) {
  const [data, setData] = useState<T | null>(initialData || null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/ws${endpoint}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setConnected(true)
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data)
        setData(newData)
      } catch (err) {
        console.error("解析WebSocket数据失败:", err)
        setError(new Error("数据格式错误"))
      }
    }

    ws.onclose = () => {
      setConnected(false)
    }

    ws.onerror = (event) => {
      setError(new Error("WebSocket连接错误"))
      setConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [endpoint])

  const sendMessage = useCallback((message: any) => {
    // 这里可以添加发送消息的逻辑
  }, [])

  return {
    data,
    connected,
    error,
    sendMessage,
  }
}

// 使用示例
console.log("数据管理Hook已创建：")
console.log("- useDataFetching: 通用数据获取")
console.log("- usePaginatedData: 分页数据管理")
console.log("- useFormSubmission: 表单提交处理")
console.log("- useRealTimeData: 实时数据连接")
