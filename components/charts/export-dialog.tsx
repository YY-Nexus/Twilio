"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { exportChartData, getExportFormatOptions, type ExportFormat } from "@/lib/export-service"
import type { ChartData } from "@/lib/chart-data-service"
import type { DateRange } from "react-day-picker"
import { formatDateRangeText } from "@/lib/chart-data-service"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chartData: ChartData | null
  dateRange?: DateRange
  filters?: Record<string, any>
}

export function ExportDialog({ open, onOpenChange, chartData, dateRange, filters }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf")
  const [fileName, setFileName] = useState("数据可视化报表")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeData, setIncludeData] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { isMobile } = useMobileDetection()

  const formatOptions = getExportFormatOptions()

  // 处理导出
  const handleExport = async () => {
    if (!chartData) {
      toast({
        title: "导出失败",
        description: "没有可导出的数据",
        variant: "destructive",
      })
      return
    }

    try {
      setIsExporting(true)

      // 生成文件名，包含日期范围
      const dateRangeText = formatDateRangeText(dateRange).replace(/\s/g, "_")
      const fullFileName = `${fileName}_${dateRangeText}`

      // 导出数据
      await exportChartData(chartData, {
        format,
        fileName: fullFileName,
        includeCharts,
        includeData,
        dateRange,
        filters,
      })

      toast({
        title: "导出成功",
        description: `数据已成功导出为${format.toUpperCase()}格式`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("导出失败:", error)
      toast({
        title: "导出失败",
        description: error instanceof Error ? error.message : "导出数据时发生错误",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // 导出表单内容
  const renderExportForm = () => (
    <>
      <div className="grid gap-4 py-4">
        <div className={isMobile ? "space-y-2" : "grid grid-cols-4 items-center gap-4"}>
          <Label htmlFor="format" className={isMobile ? "" : "text-right"}>
            导出格式
          </Label>
          <Select
            value={format}
            onValueChange={(value) => setFormat(value as ExportFormat)}
            className={isMobile ? "w-full" : "col-span-3"}
          >
            <SelectTrigger id="format">
              <SelectValue placeholder="选择导出格式" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={isMobile ? "space-y-2" : "grid grid-cols-4 items-center gap-4"}>
          <Label htmlFor="fileName" className={isMobile ? "" : "text-right"}>
            文件名
          </Label>
          <Input
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className={isMobile ? "w-full" : "col-span-3"}
          />
        </div>

        <div className={isMobile ? "space-y-2" : "grid grid-cols-4 items-center gap-4"}>
          <div className={isMobile ? "" : "text-right col-span-1"}>选项</div>
          <div className={isMobile ? "space-y-2" : "col-span-3 space-y-2"}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCharts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                disabled={format === "png"}
              />
              <Label htmlFor="includeCharts">包含图表</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeData"
                checked={includeData}
                onCheckedChange={(checked) => setIncludeData(checked as boolean)}
                disabled={format === "png"}
              />
              <Label htmlFor="includeData">包含原始数据</Label>
            </div>
          </div>
        </div>

        <div className={isMobile ? "space-y-2" : "grid grid-cols-4 items-center gap-4"}>
          <Label className={isMobile ? "" : "text-right"}>数据范围</Label>
          <div className={isMobile ? "text-sm" : "col-span-3 text-sm"}>
            {formatDateRangeText(dateRange)}
            {filters && Object.keys(filters).length > 0 && " (已应用筛选)"}
          </div>
        </div>
      </div>

      <div className={isMobile ? "flex flex-col gap-2" : "flex justify-end gap-2"}>
        <Button variant="outline" onClick={() => onOpenChange(false)} className={isMobile ? "w-full" : ""}>
          取消
        </Button>
        <Button onClick={handleExport} disabled={isExporting} className={isMobile ? "w-full" : ""}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              导出
            </>
          )}
        </Button>
      </div>
    </>
  )

  // 移动端使用Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col">
          <SheetHeader className="mb-4">
            <SheetTitle>导出数据</SheetTitle>
            <SheetDescription>选择导出格式和选项</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto">{renderExportForm()}</div>
        </SheetContent>
      </Sheet>
    )
  }

  // 桌面端使用Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>导出数据</DialogTitle>
          <DialogDescription>选择导出格式和选项</DialogDescription>
        </DialogHeader>
        {renderExportForm()}
      </DialogContent>
    </Dialog>
  )
}
