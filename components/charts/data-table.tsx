"use client"

import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { LoadingAnimation } from "@/components/loading-animation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataItem {
  id: number
  category: string
  positive: number
  negative: number
  neutral: number
  accuracy: number
}

interface DataTableProps {
  data?: DataItem[]
  isLoading?: boolean
}

export function DataTable({ data, isLoading = false }: DataTableProps) {
  const prefersReducedMotion = useReducedMotion()

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingAnimation size="lg" text="正在加载表格数据..." />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500">暂无数据</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">文本分析数据表</h3>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文本类别</TableHead>
              <TableHead className="text-right">积极评价</TableHead>
              <TableHead className="text-right">消极评价</TableHead>
              <TableHead className="text-right">中性评价</TableHead>
              <TableHead className="text-right">准确率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.3,
                  delay: prefersReducedMotion ? 0 : index * 0.05,
                  ease: "easeOut",
                }}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-medium">{item.category}</TableCell>
                <TableCell className="text-right">{item.positive}</TableCell>
                <TableCell className="text-right">{item.negative}</TableCell>
                <TableCell className="text-right">{item.neutral}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.accuracy}%` }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.5,
                          delay: prefersReducedMotion ? 0 : 0.3 + index * 0.05,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                    <span>{item.accuracy}%</span>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
