"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { exportReport, convertTableDataToReportData, type ExportFormat } from "@/lib/report-export-service"
import type { ReportType } from "@/lib/attendance-report-service"
import { getCurrentUser, hasPermission, canAccessDepartment, getAccessibleDepartments } from "@/lib/permission-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportPreview } from "@/components/report-preview"
import { ScheduleReportDialog } from "@/components/schedule-report-dialog"
import { FileDown, Clock } from "lucide-react"
import { LoadingAnimation } from "@/components/loading-animation"
import { FormSubmitButton } from "@/components/form-submit-button"

export function ReportGenerator() {
  // 保持原有的状态和函数不变
  const [reportType, setReportType] = useState<ReportType>("daily")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [filename, setFilename] = useState("考勤报表_2023年11月")
  const [year, setYear] = useState("2023")
  const [month, setMonth] = useState("11")
  const [department, setDepartment] = useState("all")
  const [employee, setEmployee] = useState("all")
  const [reportData, setReportData] = useState<any>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [accessibleDepartments, setAccessibleDepartments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 获取当前用户和权限
  const currentUser = getCurrentUser()
  const canCreateReport = hasPermission("report:create", currentUser)
  const canExportReport = hasPermission("report:export", currentUser)
  const canScheduleReport = hasPermission("report:schedule", currentUser)

  // 初始化可访问部门
  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      const departments = getAccessibleDepartments(currentUser)
      setAccessibleDepartments(departments)

      // 如果只有一个可访问部门，则自动选择
      if (departments.length === 1) {
        setDepartment(departments[0])
      }

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleGenerateReport = () => {
    // 检查权限
    if (!canCreateReport) {
      toast({
        title: "权限不足",
        description: "您没有创建报表的权限",
        variant: "destructive",
      })
      return
    }

    // 检查部门访问权限
    if (department !== "all" && !canAccessDepartment(department, currentUser)) {
      toast({
        title: "权限不足",
        description: "您没有访问该部门报表的权限",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    // 模拟报表生成过程
    setTimeout(() => {
      setIsGenerating(false)
      setShowPreview(true)
      // 保存报表数据，用于导出
      setReportData({
        reportType,
        period: `${year}年${month}月`,
        department,
        employee,
      })

      toast({
        title: "报表生成成功",
        description: `${reportType === "daily" ? "日常考勤报表" : reportType === "monthly" ? "月度考勤汇总" : reportType}已生成`,
      })
    }, 1500)
  }

  const handleExportReport = async () => {
    if (!reportData) return

    // 检查导出权限
    if (!canExportReport) {
      toast({
        title: "权限不足",
        description: "您没有导出报表的权限",
        variant: "destructive",
      })
      return
    }

    try {
      setIsExporting(true)

      // 获取报表预览组件中的表格数据
      // 这里假设我们能够从DOM中获取表格数据，或者从状态中获取
      // 在实际应用中，可能需要通过ref或其他方式从ReportPreview组件获取数据
      const tableData = getTableDataFromPreview(reportData.reportType)

      if (!tableData) {
        toast({
          title: "导出失败",
          description: "无法获取报表数据",
          variant: "destructive",
        })
        return
      }

      // 转换为报表数据格式
      const data = convertTableDataToReportData(reportData.reportType, tableData, reportData.period)

      // 导出报表
      await exportReport(data, exportFormat, filename)

      toast({
        title: "导出成功",
        description: `报表已成功导出为${exportFormat.toUpperCase()}格式`,
      })
    } catch (error) {
      console.error("导出报表失败:", error)
      toast({
        title: "导出失败",
        description: error instanceof Error ? error.message : "导出报表时发生错误",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleOpenScheduleDialog = () => {
    // 检查定时发送权限
    if (!canScheduleReport) {
      toast({
        title: "权限不足",
        description: "您没有设置定时发送报表的权限",
        variant: "destructive",
      })
      return
    }

    if (!reportData) {
      toast({
        title: "无法定时发送",
        description: "请先生成报表",
        variant: "destructive",
      })
      return
    }
    setShowScheduleDialog(true)
  }

  // 模拟从预览组件获取表格数据
  const getTableDataFromPreview = (type: ReportType) => {
    // 在实际应用中，这里应该从ReportPreview组件获取真实数据
    // 这里仅作为示例，返回模拟数据
    switch (type) {
      case "daily":
        return {
          headers: ["日期", "星期", "正常", "迟到", "早退", "缺勤", "请假", "加班", "出勤率"],
          rows: [
            ["2023-11-01", "星期三", 145, 5, 2, 0, 3, 8, "98.7%"],
            ["2023-11-02", "星期四", 148, 3, 1, 1, 2, 5, "99.3%"],
            ["2023-11-03", "星期五", 150, 2, 0, 0, 3, 10, "100.0%"],
            ["2023-11-06", "星期一", 147, 4, 2, 1, 1, 12, "99.3%"],
            ["2023-11-07", "星期二", 146, 6, 1, 0, 2, 7, "98.7%"],
            ["2023-11-08", "星期三", 149, 3, 1, 0, 2, 6, "99.3%"],
            ["2023-11-09", "星期四", 148, 4, 0, 1, 2, 9, "99.3%"],
          ],
          summary: ["合计", "", 1033, 27, 7, 3, 15, 57, "99.2%"],
        }
      case "monthly":
        return {
          headers: [
            "部门",
            "员工总数",
            "正常出勤",
            "迟到次数",
            "早退次数",
            "缺勤天数",
            "请假天数",
            "加班小时",
            "月度出勤率",
          ],
          rows: [
            ["技术部", 45, 945, 23, 12, 5, 15, 120, "97.8%"],
            ["市场部", 32, 672, 18, 8, 3, 12, 85, "98.2%"],
            ["销售部", 28, 588, 15, 6, 2, 10, 95, "98.5%"],
            ["人事部", 12, 252, 8, 4, 1, 6, 35, "98.8%"],
            ["财务部", 8, 168, 5, 2, 0, 4, 25, "99.0%"],
          ],
          summary: ["合计", 125, 2625, 69, 32, 11, 47, 360, "98.4%"],
        }
      case "overtime":
        return {
          headers: [
            "部门",
            "员工姓名",
            "加班日期",
            "加班类型",
            "开始时间",
            "结束时间",
            "加班时长",
            "加班原因",
            "审批状态",
          ],
          rows: [
            ["技术部", "张三", "2023-11-01", "工作日加班", "18:00", "21:00", "3小时", "项目紧急", "已审批"],
            ["技术部", "李四", "2023-11-02", "工作日加班", "18:00", "20:30", "2.5小时", "系统维护", "已审批"],
            ["市场部", "王五", "2023-11-04", "周末加班", "09:00", "17:00", "8小时", "活动策划", "已审批"],
            ["销售部", "赵六", "2023-11-05", "周末加班", "10:00", "16:00", "6小时", "客户对接", "已审批"],
            ["技术部", "张三", "2023-11-08", "工作日加班", "18:00", "22:00", "4小时", "系统上线", "已审批"],
          ],
          summary: ["合计", "", "", "", "", "", "23.5小时", "", ""],
        }
      default:
        return null
    }
  }

  // 生成年份选项
  const yearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 5; i <= currentYear; i++) {
      years.push(i.toString())
    }
    return years
  }

  // 生成月份选项
  const monthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))
  }

  // 部门选项
  const departmentOptions = [
    { value: "all", label: "全部部门" },
    { value: "tech", label: "技术部" },
    { value: "marketing", label: "市场部" },
    { value: "sales", label: "销售部" },
    { value: "hr", label: "人事部" },
    { value: "finance", label: "财务部" },
  ].filter((dept) => dept.value === "all" || accessibleDepartments.includes(dept.value))

  // 员工选项
  const employeeOptions = [
    { value: "all", label: "全部员工" },
    { value: "zhang", label: "张三" },
    { value: "li", label: "李四" },
    { value: "wang", label: "王五" },
    { value: "zhao", label: "赵六" },
  ]

  if (isLoading) {
    return (
      <div className="w-full">
        <Card className="card-on-bg w-full">
          <CardContent className="p-6">
            <div className="loading-container">
              <LoadingAnimation size="lg" text="正在加载报表生成器..." />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Card className="card-on-bg w-full">
        <CardHeader>
          <CardTitle className="card-title-hover">分析报表生成器</CardTitle>
          <CardDescription>生成、预览和导出分析报表</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings" className="ripple">
                报表设置
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!showPreview} className="ripple">
                报表预览
              </TabsTrigger>
            </TabsList>
            <TabsContent value="settings">
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 报表类型选择 */}
                  <div className="space-y-2">
                    <Label htmlFor="reportType">报表类型</Label>
                    <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                      <SelectTrigger id="reportType" className="ripple">
                        <SelectValue placeholder="选择报表类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">日常考勤报表</SelectItem>
                        <SelectItem value="monthly">月度考勤汇总</SelectItem>
                        <SelectItem value="overtime">加班统计报表</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 文件名设置 */}
                  <div className="space-y-2">
                    <Label htmlFor="filename">文件名</Label>
                    <Input
                      id="filename"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      className="ripple"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 年份选择 */}
                  <div className="space-y-2">
                    <Label htmlFor="year">年份</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger id="year" className="ripple">
                        <SelectValue placeholder="选择年份" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions().map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 月份选择 */}
                  <div className="space-y-2">
                    <Label htmlFor="month">月份</Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger id="month" className="ripple">
                        <SelectValue placeholder="选择月份" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions().map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 导出格式选择 */}
                  <div className="space-y-2">
                    <Label htmlFor="exportFormat">导出格式</Label>
                    <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                      <SelectTrigger id="exportFormat" className="ripple">
                        <SelectValue placeholder="选择导出格式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF文档</SelectItem>
                        <SelectItem value="excel">Excel表格</SelectItem>
                        <SelectItem value="csv">CSV文件</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 部门选择 */}
                  <div className="space-y-2">
                    <Label htmlFor="department">部门</Label>
                    <Select value={department} onValueChange={setDepartment} disabled={departmentOptions.length <= 1}>
                      <SelectTrigger id="department" className="ripple">
                        <SelectValue placeholder="选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 员工选择 */}
                  <div className="space-y-2">
                    <Label htmlFor="employee">员工</Label>
                    <Select value={employee} onValueChange={setEmployee} disabled={department === "all"}>
                      <SelectTrigger id="employee" className="ripple">
                        <SelectValue placeholder="选择员工" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeOptions.map((emp) => (
                          <SelectItem key={emp.value} value={emp.value}>
                            {emp.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <FormSubmitButton
                    onClick={handleGenerateReport}
                    isSubmitting={isGenerating}
                    loadingText="生成中..."
                    disabled={!canCreateReport}
                  >
                    生成报表
                  </FormSubmitButton>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preview">
              {reportData && (
                <div className="space-y-6 card-content-hover">
                  <ReportPreview
                    reportType={reportData.reportType}
                    period={reportData.period}
                    department={reportData.department}
                    employee={reportData.employee}
                    data={getTableDataFromPreview(reportData.reportType)}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {showPreview && (
              <Button
                variant="outline"
                onClick={handleOpenScheduleDialog}
                disabled={!canScheduleReport || !reportData}
                className="ripple"
              >
                <Clock className="mr-2 h-4 w-4" />
                定时发送
              </Button>
            )}
          </div>
          <div>
            {showPreview && (
              <FormSubmitButton
                onClick={handleExportReport}
                isSubmitting={isExporting}
                loadingText="导出中..."
                disabled={!canExportReport || !reportData}
              >
                <FileDown className="mr-2 h-4 w-4" />
                导出报表
              </FormSubmitButton>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* 定时发送对话框 */}
      <ScheduleReportDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        reportData={reportData}
        exportFormat={exportFormat}
        filename={filename}
      />
    </div>
  )
}
