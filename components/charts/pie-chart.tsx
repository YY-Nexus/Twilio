"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { LoadingAnimation } from "@/components/loading-animation"

interface PieChartDemoProps {
  animationDuration: number
  showLabels: boolean
  showLegend: boolean
  data?: {
    categories: string[]
    values: number[]
  }
  isLoading?: boolean
}

interface PieSlice {
  value: number
  percentage: number
  color: string
  startAngle: number
  endAngle: number
  label: string
}

export function PieChartDemo({
  animationDuration,
  showLabels,
  showLegend,
  data,
  isLoading = false,
}: PieChartDemoProps) {
  const [slices, setSlices] = useState<PieSlice[]>([])
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const colors = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f97316", // orange-500
    "#10b981", // emerald-500
  ]

  // 当数据变化时更新饼图切片
  useEffect(() => {
    if (data?.values && data.values.length > 0) {
      // 计算总和
      const total = data.values.reduce((sum, value) => sum + value, 0)

      // 计算每个切片的角度和百分比
      let startAngle = 0
      const newSlices = data.values.map((value, index) => {
        const percentage = (value / total) * 100
        const angle = (percentage / 100) * 360
        const slice = {
          value,
          percentage,
          color: colors[index % colors.length],
          startAngle,
          endAngle: startAngle + angle,
          label: data.categories[index] || `类别${index + 1}`,
        }
        startAngle += angle
        return slice
      })

      setSlices(newSlices)
    }
  }, [data, colors])

  // 计算SVG路径
  const calculatePath = (slice: PieSlice, exploded = false) => {
    const radius = 50
    const innerRadius = 20 // 环形图的内半径

    // 如果是被选中的切片，将其向外移动一点
    const explosionOffset = exploded ? 5 : 0

    // 转换角度为弧度
    const startAngleRad = (slice.startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (slice.endAngle - 90) * (Math.PI / 180)

    // 计算外圆弧的起点和终点
    const startX = 50 + (radius + explosionOffset) * Math.cos(startAngleRad)
    const startY = 50 + (radius + explosionOffset) * Math.sin(startAngleRad)
    const endX = 50 + (radius + explosionOffset) * Math.cos(endAngleRad)
    const endY = 50 + (radius + explosionOffset) * Math.sin(endAngleRad)

    // 计算内圆弧的起点和终点
    const innerStartX = 50 + (innerRadius + explosionOffset) * Math.cos(endAngleRad)
    const innerStartY = 50 + (innerRadius + explosionOffset) * Math.sin(endAngleRad)
    const innerEndX = 50 + (innerRadius + explosionOffset) * Math.cos(startAngleRad)
    const innerEndY = 50 + (innerRadius + explosionOffset) * Math.sin(startAngleRad)

    // 计算是否需要使用大弧（large-arc-flag）
    const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0

    // 构建SVG路径
    return `
      M ${startX} ${startY}
      A ${radius + explosionOffset} ${radius + explosionOffset} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${innerStartX} ${innerStartY}
      A ${innerRadius + explosionOffset} ${innerRadius + explosionOffset} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY}
      Z
    `
  }

  // 计算标签位置
  const calculateLabelPosition = (slice: PieSlice, exploded = false) => {
    const radius = 35 // 标签位置的半径
    const explosionOffset = exploded ? 5 : 0

    // 计算切片的中间角度
    const midAngle = (slice.startAngle + slice.endAngle) / 2
    const midAngleRad = (midAngle - 90) * (Math.PI / 180)

    // 计算标签位置
    const x = 50 + (radius + explosionOffset) * Math.cos(midAngleRad)
    const y = 50 + (radius + explosionOffset) * Math.sin(midAngleRad)

    return { x, y }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingAnimation size="lg" text="正在加载图表数据..." />
      </div>
    )
  }

  if (!data || !data.values || data.values.length === 0 || slices.length === 0) {
    return <div className="text-center py-10 text-gray-500">暂无数据</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">情感分析分布</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {slices.map((slice, index) => {
              const isSelected = selectedSlice === index

              return (
                <motion.path
                  key={index}
                  d={calculatePath(slice, isSelected)}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    d: calculatePath(slice, isSelected),
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : animationDuration / 1000,
                    delay: prefersReducedMotion ? 0 : index * (animationDuration / 5000),
                    ease: "easeOut",
                  }}
                  onMouseEnter={() => setSelectedSlice(index)}
                  onMouseLeave={() => setSelectedSlice(null)}
                  style={{ cursor: "pointer" }}
                />
              )
            })}

            {showLabels &&
              slices.map((slice, index) => {
                const isSelected = selectedSlice === index
                const position = calculateLabelPosition(slice, isSelected)

                return (
                  <motion.g
                    key={`label-${index}`}
                    initial={{
                      opacity: 0,
                      x: position.x,
                      y: position.y,
                    }}
                    animate={{
                      opacity: 1,
                      x: position.x,
                      y: position.y,
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : animationDuration / 1000,
                      delay: prefersReducedMotion ? 0 : index * (animationDuration / 5000) + animationDuration / 2000,
                      ease: "easeOut",
                    }}
                  >
                    <text
                      x={position.x}
                      y={position.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="3"
                      fontWeight="bold"
                    >
                      {slice.percentage.toFixed(1)}%
                    </text>
                  </motion.g>
                )
              })}
          </svg>

          {/* 中心圆 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-inner">
            <span className="text-xs font-medium text-gray-700">情感</span>
          </div>
        </div>

        {showLegend && (
          <div className="grid grid-cols-1 gap-2">
            {slices.map((slice, index) => (
              <div
                key={index}
                className="flex items-center gap-2 cursor-pointer"
                onMouseEnter={() => setSelectedSlice(index)}
                onMouseLeave={() => setSelectedSlice(null)}
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: slice.color }} />
                <span className="text-sm">{slice.label}</span>
                <span className="text-sm text-gray-500">
                  {slice.value} ({slice.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
