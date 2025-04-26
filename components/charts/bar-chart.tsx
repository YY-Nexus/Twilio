"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { LoadingAnimation } from "@/components/loading-animation"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { MobileChartContainer } from "./mobile-chart-container"

interface BarChartDemoProps {
  animationDuration: number
  showLabels: boolean
  showLegend: boolean
  showGrid: boolean
  data?: {
    categories: string[]
    values: number[]
  }
  isLoading?: boolean
}

export function BarChartDemo({
  animationDuration,
  showLabels,
  showLegend,
  showGrid,
  data,
  isLoading = false,
}: BarChartDemoProps) {
  const [maxValue, setMaxValue] = useState(100)
  const chartRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { isMobile } = useMobileDetection()

  // 当数据变化时更新最大值
  useEffect(() => {
    if (data?.values && data.values.length > 0) {
      const newMax = Math.max(...data.values) * 1.2
      setMaxValue(newMax)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingAnimation size="lg" text="正在加载图表数据..." />
      </div>
    )
  }

  if (!data || !data.values || data.values.length === 0) {
    return <div className="text-center py-10 text-gray-500">暂无数据</div>
  }

  // 图表内容
  const chartContent = (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">文本分析准确率统计</h3>
      </div>

      <div className="relative h-80" ref={chartRef}>
        {showGrid && (
          <div className="absolute inset-0 grid grid-cols-1 grid-rows-5 w-full h-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-t border-gray-200 dark:border-gray-800"
                style={{ bottom: `${(i * 100) / 5}%` }}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 flex justify-between h-full">
          {data.values.map((value, index) => {
            const height = (value / maxValue) * 100

            return (
              <div key={index} className="relative flex flex-col items-center justify-end h-full flex-1">
                <motion.div
                  className="w-4/5 bg-blue-500 rounded-t-md relative group"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : animationDuration / 1000,
                    ease: "easeOut",
                  }}
                >
                  {showLabels && (
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      {value}%
                    </div>
                  )}
                </motion.div>
                {data.categories[index] && (
                  <div
                    className={`text-xs mt-2 text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1 ${isMobile ? "text-[10px]" : ""}`}
                  >
                    {isMobile && data.categories[index].length > 6
                      ? `${data.categories[index].substring(0, 6)}...`
                      : data.categories[index]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showLegend && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm">准确率百分比</span>
          </div>
        </div>
      )}
    </div>
  )

  // 在移动设备上使用MobileChartContainer包装图表
  if (isMobile) {
    return <MobileChartContainer title="文本分析准确率统计">{chartContent}</MobileChartContainer>
  }

  // 桌面版本直接返回图表内容
  return chartContent
}
