"use client"

import { useState, useRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileChartContainerProps {
  children: ReactNode
  title?: string
  className?: string
}

export function MobileChartContainer({ children, title, className }: MobileChartContainerProps) {
  const { isMobile, isTablet } = useMobileDetection()
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 如果不是移动设备，直接返回内容
  if (!isMobile && !isTablet) {
    return <div className={className}>{children}</div>
  }

  // 处理缩放
  const handleZoomIn = () => {
    if (scale < 2) {
      setScale((prev) => prev + 0.2)
    }
  }

  const handleZoomOut = () => {
    if (scale > 0.5) {
      setScale((prev) => prev - 0.2)
    }
  }

  // 重置缩放和位置
  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // 处理拖动
  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg border", className)}>
      {title && (
        <div className="p-3 border-b bg-muted/30">
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative overflow-hidden touch-none"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          height: isMobile ? "300px" : "400px",
        }}
      >
        <motion.div
          drag={scale > 1}
          dragConstraints={containerRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{
            scale,
            x: position.x,
            y: position.y,
          }}
          className="origin-center h-full"
        >
          {children}
        </motion.div>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
          <span className="sr-only">缩小</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">重置</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleZoomIn}
          disabled={scale >= 2}
        >
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">放大</span>
        </Button>
      </div>

      {scale > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center items-center gap-2 pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-muted-foreground shadow-md">
            拖动可查看更多区域
          </div>
        </div>
      )}
    </div>
  )
}
