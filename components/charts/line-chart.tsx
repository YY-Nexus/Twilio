"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { LoadingAnimation } from "@/components/loading-animation"

interface LineChartDemoProps {
  animationDuration: number
  showLabels: boolean
  showLegend: boolean
  showGrid: boolean
  data?: {
    months: string[]
    values: number[]
  }
  isLoading?: boolean
}

export function LineChartDemo({
  animationDuration,
  showLabels,
  showLegend,
  showGrid,
  data,
  isLoading = false,
}: LineChartDemoProps) {
  const [maxValue, setMaxValue] = useState(100)
  const prefersReducedMotion = useReducedMotion()

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

  // 生成SVG路径
  const generatePath = () => {
    const width = 100 / (data.values.length - 1)

    return data.values
      .map((value, index) => {
        const x = index * width
        const y = 100 - (value / maxValue) * 100
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  // 生成点的坐标
  const generatePoints = () => {
    const width = 100 / (data.values.length - 1)

    return data.values.map((value, index) => ({
      x: index * width,
      y: 100 - (value / maxValue) * 100,
      value,
    }))
  }

  const points = generatePoints()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">文本分析月度趋势</h3>
      </div>

      <div className="relative h-80">
        {showGrid && (
          <div className="absolute inset-0 grid grid-cols-1 grid-rows-5 w-full h-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-t border-gray-200 dark:border-gray-800" />
            ))}
          </div>
        )}

        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </linearGradient>
          </defs>

          {/* 面积填充 */}
          <motion.path
            d={`${generatePath()} L 100 100 L 0 100 Z`}
            fill="url(#lineGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : animationDuration / 2000,
              ease: "easeOut",
            }}
          />

          {/* 线条 */}
          <motion.path
            d={generatePath()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : animationDuration / 1000,
              ease: "easeOut",
            }}
          />

          {/* 数据点 */}
          {points.map((point, index) => (
            <motion.g
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: prefersReducedMotion ? 0 : (animationDuration / 1000) * (index / points.length) }}
            >
              <circle cx={point.x} cy={point.y} r="1.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
              {showLabels && (
                <text x={point.x} y={point.y - 5} textAnchor="middle" fontSize="3" fill="#3b82f6">
                  {point.value}%
                </text>
              )}
            </motion.g>
          ))}
        </svg>

        {/* X轴标签 */}
        <div className="flex justify-between mt-2">
          {data.months.map((month, index) => (
            <div key={index} className="text-xs text-center">
              {month}
            </div>
          ))}
        </div>
      </div>

      {showLegend && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm">月度准确率</span>
          </div>
        </div>
      )}
    </div>
  )
}
