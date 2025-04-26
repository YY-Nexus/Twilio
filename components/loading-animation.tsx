"use client"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

interface LoadingAnimationProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingAnimation({ size = "md", className, text }: LoadingAnimationProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  if (prefersReducedMotion) {
    // 为减少动画偏好的用户提供静态加载指示器
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
        <div className={cn("text-blue-600 font-bold", sizeClasses[size])}>加载中</div>
        {text && <p className="text-sm text-gray-500">{text}</p>}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <svg
        className={cn("animate-spin text-blue-600", sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  )
}
