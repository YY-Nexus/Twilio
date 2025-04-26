"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useState, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isFirstRender, setIsFirstRender] = useState(true)
  const prefersReducedMotion = useReducedMotion()
  const prevPathRef = useRef<string | null>(null)
  const [prevChildren, setPrevChildren] = useState<ReactNode | null>(null)
  const [currentChildren, setCurrentChildren] = useState<ReactNode>(children)

  // 检测路径变化
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      // 保存前一个页面内容用于过渡
      setPrevChildren(currentChildren)
      setCurrentChildren(children)
      prevPathRef.current = pathname
    }
  }, [pathname, children, currentChildren])

  // 首次渲染后设置标志，避免首次加载时的动画
  useEffect(() => {
    if (isFirstRender) {
      // 使用requestAnimationFrame确保在下一帧设置，避免闪烁
      const timer = requestAnimationFrame(() => {
        setIsFirstRender(false)
      })
      return () => cancelAnimationFrame(timer)
    }
  }, [isFirstRender])

  // 如果是首次渲染或用户偏好减少动画，则不应用动画
  if (isFirstRender || prefersReducedMotion) {
    return <>{children}</>
  }

  // 页面切换动画变体
  const variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1.0],
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: {
        duration: 0.15,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        onAnimationStart={() => {
          // 动画开始时滚动到顶部
          window.scrollTo({ top: 0, behavior: "auto" })
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
