"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { LoadingAnimation } from "@/components/loading-animation"

interface AreaChartDemoProps {
  animationDuration: number
  showLabels: boolean
  showLegend: boolean
  showGrid: boolean
  data?: {
    days: string[]
    series: {
      name: string
      color: string
      values: number[]
    }[]
  }
  isLoading?: boolean
}

export function AreaChartDemo({
  animationDuration,
  showLabels,
  showLegend,
  showGrid,
  data,
  isLoading = false,
}: AreaChartDemoProps) {
  const [maxValue, setMaxValue] = useState(100)
  const prefersReducedMotion = useReducedMotion()

  // 当数据变化时更新最大值
  useEffect(() => {
    if (data?.series && data.series.length > 0) {
      const allValues = data.series.flatMap((s) => s.values)
      const newMax = Math.max(...allValues) * 1.2
      setMaxValue(newMax)
    }
  }, [data])

  // 生成SVG路径
  const generatePath = (values: number[], isFilled = false) => {
    if (!values || values.length === 0) return ""

    const width = 100 / (values.length - 1)

    let path = values
      .map((value, index) => {
        const x = index * width
        const y = 100 - (value / maxValue) * 100
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")

    if (isFilled) {
      path += ` L 100 100 L 0 100 Z`
    }

    return path
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingAnimation size="lg" text="正在加载图表数据..." />
      </div>
    )
  }

  if (!data || !data.series || data.series.length === 0) {
    return <div className="text-center py-10 text-gray-500">暂无数据</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">用户评价趋势</h3>
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
          {data.series.map((s, seriesIndex) => (
            <g key={s.name}>
              {/* 面积填充 */}
              <motion.path
                d={generatePath(s.values, true)}
                fill={`${s.color}20`} // 添加透明度
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : animationDuration / 2000,
                  delay: prefersReducedMotion ? 0 : seriesIndex * (animationDuration / 4000),
                  ease: "easeOut",
                }}
              />

              {/* 线条 */}
              <motion.path
                d={generatePath(s.values)}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : animationDuration / 1000,
                  delay: prefersReducedMotion ? 0 : seriesIndex * (animationDuration / 4000),
                  ease: "easeOut",
                }}
              />

              {/* 数据点 */}
              {s.values.map((value, index) => {
                const x = index * (100 / (s.values.length - 1))
                const y = 100 - (value / maxValue) * 100

                return (
                  <motion.g
                    key={`${s.name}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : animationDuration / 2000,
                      delay: prefersReducedMotion
                        ? 0
                        : seriesIndex * (animationDuration / 4000) + index * (animationDuration / 8000),
                      ease: "easeOut",
                    }}
                  >
                    <circle cx={x} cy={y} r="1.5" fill={s.color} stroke="white" strokeWidth="1" />
                    {showLabels && (
                      <text x={x} y={y - 3} textAnchor="middle" fontSize="3" fill={s.color}>
                        {value}
                      </text>
                    )}
                  </motion.g>
                )
              })}
            </g>
          ))}
        </svg>

        {/* X轴标签 */}
        <div className="flex justify-between mt-2">
          {data.days.map((day, index) => (
            <div key={index} className="text-xs text-center">
              {day}
            </div>
          ))}
        </div>
      </div>

      {showLegend && (
        <div className="flex justify-center mt-4 gap-6">
          {data.series.map((s) => (
            <div key={s.name} className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: s.color }}></div>
              <span className="text-sm">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
