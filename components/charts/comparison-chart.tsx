"use client"

import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { LoadingAnimation } from "@/components/loading-animation"
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ComparisonType } from "@/lib/chart-data-service"

interface ComparisonChartProps {
  data?: {
    current: {
      label: string
      value: number
    }[]
    previous?: {
      label: string
      value: number
    }[]
    change?: {
      label: string
      value: number
      percentage: number
    }[]
  }
  comparisonType: ComparisonType
  animationDuration: number
  isLoading?: boolean
}

export function ComparisonChart({ data, comparisonType, animationDuration, isLoading = false }: ComparisonChartProps) {
  const prefersReducedMotion = useReducedMotion()

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingAnimation size="lg" text="正在加载对比数据..." />
      </div>
    )
  }

  if (!data || comparisonType === "none") {
    return null
  }

  const comparisonTitle = comparisonType === "previous_period" ? "环比分析" : "同比分析"
  const comparisonDescription = comparisonType === "previous_period" ? "与上一周期相比" : "与去年同期相比"

  return (
    <Card className="card-on-bg">
      <CardHeader>
        <CardTitle>{comparisonTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">{comparisonDescription}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">图表</TabsTrigger>
            <TabsTrigger value="table">表格</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <div className="h-[300px] relative">
              {data.current && data.previous && (
                <div className="flex h-full">
                  <div className="w-12 flex flex-col justify-between text-xs text-muted-foreground">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  <div className="flex-1 flex items-end">
                    {data.current.map((item, index) => {
                      const previousValue = data.previous?.[index]?.value || 0
                      const change = data.change?.[index]
                      const maxValue = Math.max(
                        ...data.current.map((d) => d.value),
                        ...(data.previous?.map((d) => d.value) || []),
                      )
                      const currentHeight = (item.value / maxValue) * 100
                      const previousHeight = (previousValue / maxValue) * 100

                      return (
                        <div key={item.label} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className="relative w-full flex flex-col items-center justify-end h-[calc(100%-30px)]">
                            {/* 当前值柱子 */}
                            <motion.div
                              className="w-6 bg-blue-500 rounded-t-sm z-10"
                              initial={{ height: 0 }}
                              animate={{ height: `${currentHeight}%` }}
                              transition={{
                                duration: prefersReducedMotion ? 0 : animationDuration / 1000,
                                ease: "easeOut",
                              }}
                            />

                            {/* 上一周期值柱子 */}
                            <motion.div
                              className="w-6 bg-gray-300 rounded-t-sm absolute bottom-0 left-[calc(50%-12px)]"
                              initial={{ height: 0 }}
                              animate={{ height: `${previousHeight}%` }}
                              transition={{
                                duration: prefersReducedMotion ? 0 : animationDuration / 1000,
                                delay: prefersReducedMotion ? 0 : 0.2,
                                ease: "easeOut",
                              }}
                            />

                            {/* 变化指示器 */}
                            {change && (
                              <div
                                className={`absolute -top-6 left-1/2 transform -translate-x-1/2 flex items-center ${
                                  change.value > 0
                                    ? "text-green-500"
                                    : change.value < 0
                                      ? "text-red-500"
                                      : "text-gray-500"
                                }`}
                              >
                                {change.value > 0 ? (
                                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                                ) : change.value < 0 ? (
                                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                                ) : (
                                  <MinusIcon className="h-3 w-3 mr-1" />
                                )}
                                <span className="text-xs">{Math.abs(change.percentage).toFixed(1)}%</span>
                              </div>
                            )}
                          </div>

                          {/* X轴标签 */}
                          <div className="mt-2 text-xs text-center w-full truncate" title={item.label}>
                            {item.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm">当前周期</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                <span className="text-sm">{comparisonType === "previous_period" ? "上一周期" : "去年同期"}</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="table">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-2 px-4 text-left font-medium">时间</th>
                    <th className="py-2 px-4 text-right font-medium">当前值</th>
                    <th className="py-2 px-4 text-right font-medium">
                      {comparisonType === "previous_period" ? "上一周期" : "去年同期"}
                    </th>
                    <th className="py-2 px-4 text-right font-medium">变化</th>
                  </tr>
                </thead>
                <tbody>
                  {data.current.map((item, index) => {
                    const previousValue = data.previous?.[index]?.value || 0
                    const change = data.change?.[index]

                    return (
                      <tr key={item.label} className="border-b">
                        <td className="py-2 px-4">{item.label}</td>
                        <td className="py-2 px-4 text-right">{item.value}</td>
                        <td className="py-2 px-4 text-right">{previousValue}</td>
                        <td
                          className={`py-2 px-4 text-right ${
                            change?.value && change.value > 0
                              ? "text-green-500"
                              : change?.value && change.value < 0
                                ? "text-red-500"
                                : ""
                          }`}
                        >
                          {change && (
                            <div className="flex items-center justify-end">
                              {change.value > 0 ? (
                                <ArrowUpIcon className="h-3 w-3 mr-1" />
                              ) : change.value < 0 ? (
                                <ArrowDownIcon className="h-3 w-3 mr-1" />
                              ) : (
                                <MinusIcon className="h-3 w-3 mr-1" />
                              )}
                              <span>
                                {change.value > 0 ? "+" : ""}
                                {change.value} ({Math.abs(change.percentage).toFixed(1)}%)
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
