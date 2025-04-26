// 报表类型定义
export type ReportType = "daily" | "monthly" | "overtime"

// 报表数据接口
export interface ReportData {
  reportType: ReportType
  period: string
  department: string
  employee: string
  data: {
    headers: string[]
    rows: (string | number)[][]
    summary: (string | number)[]
  }
}

// 这里可以添加更多与考勤报表相关的服务函数
