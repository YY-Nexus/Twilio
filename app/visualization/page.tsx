"use client"

import { useState, useEffect, useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { BarChartDemo } from "@/components/charts/bar-chart"
import { LineChartDemo } from "@/components/charts/line-chart"
import { PieChartDemo } from "@/components/charts/pie-chart"
import { AreaChartDemo } from "@/components/charts/area-chart"
import { DataTable } from "@/components/charts/data-table"
import { ChartControls } from "@/components/charts/chart-controls"
import { DateRangePicker } from "@/components/charts/date-range-picker"
import { GranularitySelector } from "@/components/charts/granularity-selector"
import { ComparisonSelector } from "@/components/charts/comparison-selector"
import { AdvancedFilters, type FilterCondition } from "@/components/charts/advanced-filters"
import { ComparisonChart } from "@/components/charts/comparison-chart"
import { ExportDialog } from "@/components/charts/export-dialog"
import type { DateRange } from "react-day-picker"
import {
  fetchChartData,
  formatDateRangeText,
  type ChartData,
  type TimeGranularity,
  type ComparisonType,
} from "@/lib/chart-data-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarClock, RefreshCw, Download, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cacheService } from "@/lib/cache-service"
import { Badge } from "@/components/ui/badge"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function VisualizationPage() {
  // 图表控制状态
  const [animationDuration, setAnimationDuration] = useState(750)
  const [showLabels, setShowLabels] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  // 数据筛选状态
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [granularity, setGranularity] = useState<TimeGranularity>("day")
  const [comparison, setComparison] = useState<ComparisonType>("none")
  const [filters, setFilters] = useState<FilterCondition[]>([])

  // 数据和加载状态
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // 导出对话框状态
  const [showExportDialog, setShowExportDialog] = useState(false)

  // 缓存统计
  const [cacheStats, setCacheStats] = useState({ size: 0, maxSize: 0 })

  // 移动设备检测
  const { isMobile } = useMobileDetection()

  // 移动设备上的折叠状态
  const [isControlsOpen, setIsControlsOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // 将筛选条件转换为参数对象
  const filtersObject = useMemo(() => {
    return filters.reduce(
      (acc, filter) => {
        acc[filter.field] = filter.value
        return acc
      },
      {} as Record<string, any>,
    )
  }, [filters])

  // 加载图表数据
  const loadChartData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchChartData({
        dateRange,
        granularity,
        comparison,
        filters: filtersObject,
      })
      setChartData(data)
      setLastUpdated(new Date())

      // 更新缓存统计
      setCacheStats(cacheService.getStats())
    } catch (error) {
      console.error("加载图表数据失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载和筛选条件变化时重新加载数据
  useEffect(() => {
    loadChartData()
  }, [dateRange, granularity, comparison, filtersObject])

  // 处理日期范围变化
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  // 处理时间粒度变化
  const handleGranularityChange = (value: TimeGranularity) => {
    setGranularity(value)
  }

  // 处理比较类型变化
  const handleComparisonChange = (value: ComparisonType) => {
    setComparison(value)
  }

  // 处理筛选条件变化
  const handleFiltersChange = (newFilters: FilterCondition[]) => {
    setFilters(newFilters)
  }

  // 手动刷新数据
  const handleRefresh = () => {
    // 清除当前参数的缓存
    cacheService.clearType("chartData")
    loadChartData()
  }

  // 清除所有缓存
  const handleClearCache = () => {
    cacheService.clearAll()
    setCacheStats(cacheService.getStats())
    loadChartData()
  }

  // 移动设备上的控制面板
  const renderMobileControls = () => (
    <div className="space-y-4">
      <Collapsible open={isControlsOpen} onOpenChange={setIsControlsOpen} className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">图表控制</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isControlsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-4">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
          <div className="grid grid-cols-2 gap-2">
            <GranularitySelector granularity={granularity} onGranularityChange={handleGranularityChange} />
            <ComparisonSelector comparison={comparison} onComparisonChange={handleComparisonChange} />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex-1 flex items-center justify-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="flex-1 flex items-center justify-center gap-1"
              disabled={!chartData}
            >
              <Download className="h-4 w-4" />
              导出
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">筛选条件</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-4">
          <AdvancedFilters filters={filters} onFiltersChange={handleFiltersChange} />

          <Alert>
            <CalendarClock className="h-4 w-4" />
            <AlertTitle>数据时间范围</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <div>
                <span className="text-sm">当前显示: {formatDateRangeText(dateRange, granularity)}</span>
                {filters.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    已筛选 {filters.length} 项
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">最后更新: {lastUpdated.toLocaleString("zh-CN")}</span>
                <Badge variant="outline" className="text-xs">
                  缓存: {cacheStats.size}/{cacheStats.maxSize}
                </Badge>
              </div>
              {cacheStats.size > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearCache} className="h-6 px-2 text-xs w-full">
                  清除缓存
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )

  // 桌面设备上的控制面板
  const renderDesktopControls = () => (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
        <GranularitySelector granularity={granularity} onGranularityChange={handleGranularityChange} />
        <ComparisonSelector comparison={comparison} onComparisonChange={handleComparisonChange} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            刷新数据
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-1"
            disabled={!chartData}
          >
            <Download className="h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      <AdvancedFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <Alert>
        <CalendarClock className="h-4 w-4" />
        <AlertTitle>数据时间范围</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span>当前显示: {formatDateRangeText(dateRange, granularity)}</span>
            {filters.length > 0 && (
              <Badge variant="outline" className="ml-2">
                已筛选 {filters.length} 项
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">最后更新: {lastUpdated.toLocaleString("zh-CN")}</span>
            <Badge variant="outline" className="text-xs">
              缓存: {cacheStats.size}/{cacheStats.maxSize}
            </Badge>
            {cacheStats.size > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearCache} className="h-6 px-2 text-xs">
                清除缓存
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )

  return (
    <div className="container mx-auto py-6">
      <div className="content-container p-6">
        <PageHeader title="数据可视化" description="文本分析结果的图表展示与数据可视化" className="mb-6" />

        {isMobile ? renderMobileControls() : renderDesktopControls()}

        <ChartControls
          animationDuration={animationDuration}
          setAnimationDuration={setAnimationDuration}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          showLegend={showLegend}
          setShowLegend={setShowLegend}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
        />

        {comparison !== "none" && chartData?.comparisonData && (
          <div className="mt-6">
            <ComparisonChart
              data={chartData.comparisonData}
              comparisonType={comparison}
              animationDuration={animationDuration}
              isLoading={isLoading}
            />
          </div>
        )}

        <Tabs defaultValue="bar" className="mt-6">
          <TabsList className={`grid w-full ${isMobile ? "grid-cols-3" : "grid-cols-5"} mb-6`}>
            <TabsTrigger value="bar" className="ripple">
              柱状图
            </TabsTrigger>
            <TabsTrigger value="line" className="ripple">
              折线图
            </TabsTrigger>
            <TabsTrigger value="pie" className="ripple">
              饼图
            </TabsTrigger>
            {!isMobile && (
              <TabsTrigger value="area" className="ripple">
                面积图
              </TabsTrigger>
            )}
            <TabsTrigger value="table" className="ripple">
              表格
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <Card className="card-on-bg p-6">
              <BarChartDemo
                animationDuration={animationDuration}
                showLabels={showLabels}
                showLegend={showLegend}
                showGrid={showGrid}
                data={chartData?.barChartData}
                isLoading={isLoading}
              />
            </Card>
          </TabsContent>

          <TabsContent value="line">
            <Card className="card-on-bg p-6">
              <LineChartDemo
                animationDuration={animationDuration}
                showLabels={showLabels}
                showLegend={showLegend}
                showGrid={showGrid}
                data={chartData?.lineChartData}
                isLoading={isLoading}
              />
            </Card>
          </TabsContent>

          <TabsContent value="pie">
            <Card className="card-on-bg p-6">
              <PieChartDemo
                animationDuration={animationDuration}
                showLabels={showLabels}
                showLegend={showLegend}
                data={chartData?.pieChartData}
                isLoading={isLoading}
              />
            </Card>
          </TabsContent>

          <TabsContent value="area">
            <Card className="card-on-bg p-6">
              <AreaChartDemo
                animationDuration={animationDuration}
                showLabels={showLabels}
                showLegend={showLegend}
                showGrid={showGrid}
                data={chartData?.areaChartData}
                isLoading={isLoading}
              />
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <Card className="card-on-bg p-6">
              <DataTable data={chartData?.tableData} isLoading={isLoading} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        chartData={chartData}
        dateRange={dateRange}
        filters={filtersObject}
      />
    </div>
  )
}
