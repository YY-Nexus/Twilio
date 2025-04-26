"use client"

import type React from "react"

import { lazy, Suspense, type ComponentType } from "react"

// 懒加载组件的加载状态
interface LoadingProps {
  className?: string
}

// 默认加载状态组件
const DefaultLoading = ({ className }: LoadingProps) => (
  <div className={`flex items-center justify-center p-4 ${className || ""}`}>
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
  </div>
)

/**
 * 懒加载组件包装器
 * @param importFn 导入组件的函数
 * @param LoadingComponent 加载状态组件
 * @returns 懒加载的组件
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent: ComponentType<LoadingProps> = DefaultLoading,
) {
  const LazyComponent = lazy(importFn)

  return (props: React.ComponentProps<T> & { loadingProps?: LoadingProps }) => {
    const { loadingProps, ...componentProps } = props

    return (
      <Suspense fallback={<LoadingComponent {...loadingProps} />}>
        <LazyComponent {...(componentProps as any)} />
      </Suspense>
    )
  }
}
