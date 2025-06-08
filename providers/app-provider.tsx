"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

// 定义全局状态类型
interface AppState {
  user: {
    id: string
    name: string
    email: string
    role: "admin" | "user" | "manager"
    permissions: string[]
  } | null
  currentModule: string
  notifications: Array<{
    id: string
    type: "info" | "success" | "warning" | "error"
    title: string
    message: string
    timestamp: Date
  }>
  loading: boolean
  error: string | null
}

// 定义动作类型
type AppAction =
  | { type: "SET_USER"; payload: AppState["user"] }
  | { type: "SET_CURRENT_MODULE"; payload: string }
  | { type: "ADD_NOTIFICATION"; payload: AppState["notifications"][0] }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }

// 初始状态
const initialState: AppState = {
  user: null,
  currentModule: "dashboard",
  notifications: [],
  loading: false,
  error: null,
}

// 状态管理器
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_CURRENT_MODULE":
      return { ...state, currentModule: action.payload }
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      }
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    default:
      return state
  }
}

// 创建上下文
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// 应用提供者组件
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // 初始化用户信息
  useEffect(() => {
    const initializeApp = async () => {
      dispatch({ type: "SET_LOADING", payload: true })

      try {
        // 模拟从API获取用户信息
        const userResponse = await fetch("/api/auth/me")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          dispatch({ type: "SET_USER", payload: userData })
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "初始化应用失败" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    initializeApp()
  }, [])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

// 自定义Hook
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp必须在AppProvider内部使用")
  }
  return context
}

// 便捷的Hook函数
export function useUser() {
  const { state } = useApp()
  return state.user
}

export function useNotifications() {
  const { state, dispatch } = useApp()

  const addNotification = (notification: Omit<AppState["notifications"][0], "id" | "timestamp">) => {
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      },
    })
  }

  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id })
  }

  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
  }
}
