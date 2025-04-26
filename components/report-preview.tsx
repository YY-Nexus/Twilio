"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ReportType } from "@/lib/attendance-report-service"

interface ReportPreviewProps {
  reportType: ReportType
  period: string
  department: string
  employee: string
  data: {
    headers: string[]
    rows: (string | number)[][]
    summary: (string | number)[]
  } | null
}

export function ReportPreview({ reportType, period, department, employee, data }: ReportPreviewProps) {
  if (!data) {
    return <div>无数据可预览</div>
  }

  // 获取部门名称
  const getDepartmentName = (deptId: string) => {
    const deptMap: Record<string, string> = {
      all: "全部部门",
      tech: "技术部",
      marketing: "市场部",
      sales: "销售部",
      hr: "人事部",
      finance: "财务部",
    }
    return deptMap[deptId] || deptId
  }

  // 获取员工名称
  const getEmployeeName = (empId: string) => {
    const empMap: Record<string, string> = {
      all: "全部员工",
      zhang: "张三",
      li: "李四",
      wang: "王五",
      zhao: "赵六",
    }
    return empMap[empId] || empId
  }

  // 获取报表标题
  const getReportTitle = () => {
    const typeMap: Record<string, string> = {
      daily: "日常考勤报表",
      monthly: "月度考勤汇总",
      overtime: "加班统计报表",
    }
    return `${typeMap[reportType] || reportType} - ${period}`
  }

  // 获取报表子标题
  const getReportSubtitle = () => {
    const deptName = getDepartmentName(department)
    const empName = employee !== "all" ? getEmployeeName(employee) : ""
    return `${deptName}${empName ? ` - ${empName}` : ""}`
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{getReportTitle()}</CardTitle>
        <p className="text-muted-foreground">{getReportSubtitle()}</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {data.headers.map((header, index) => (
                <TableHead key={index} className="text-center">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-center">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow className="font-medium bg-muted/50">
              {data.summary.map((cell, index) => (
                <TableCell key={index} className="text-center">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
