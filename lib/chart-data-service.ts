import type { DateRange } from "react-day-picker"
import { getCachedChartData, setCachedChartData } from "./cache-service"
import {
  format,
  subDays,
  subMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachYearOfInterval,
} from "date-fns"
import { zhCN } from "date-fns/locale"

// 图表数据类型
export interface ChartData {
  barChartData: {
    categories: string[]
    values: number[]
  }
  lineChartData: {
    months: string[]
    values: number[]
  }
  pieChartData: {
    categories: string[]
    values: number[]
  }
  areaChartData: {
    days: string[]
    series: {
      name: string
      color: string
      values: number[]
    }[]
  }
  tableData: {
    id: number
    category: string
    positive: number
    negative: number
    neutral: number
    accuracy: number
  }[]
  comparisonData?: {
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
}

// 时间粒度类型
export type TimeGranularity = "hour" | "day" | "week" | "month" | "quarter" | "year"

// 比较类型
export type ComparisonType = "none" | "previous_period" | "year_over_year"

// 图表数据请求参数
export interface ChartDataParams {
  dateRange?: DateRange
  granularity: TimeGranularity
  comparison?: ComparisonType
  filters?: Record<string, any>
}

// 生成随机数据的辅助函数
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 数据加载状态
let isPreloading = false
const preloadQueue: ChartDataParams[] = []

// 根据日期范围和粒度生成数据的函数
export async function fetchChartData(params: ChartDataParams): Promise<ChartData> {
  const { dateRange, granularity, comparison, filters } = params

  // 检查缓存
  const cachedData = getCachedChartData(dateRange, granularity, { comparison, filters })
  if (cachedData) {
    console.log("使用缓存数据")

    // 在返回缓存数据的同时，预加载相关数据
    preloadRelatedData(params)

    return cachedData
  }

  // 模拟API请求延迟
  await new Promise((resolve) => setTimeout(resolve, 800))

  // 根据日期范围调整数据生成的随机性
  // 这里我们使用日期范围的起始日期的时间戳作为随机种子
  const seed = dateRange?.from ? dateRange.from.getTime() : Date.now()
  const randomFactor = ((seed % 100) / 100) * 0.4 + 0.8 // 0.8-1.2之间的随机因子

  // 根据粒度调整数据点数量和标签
  const { labels, dataPoints } = generateTimeLabels(dateRange, granularity)

  // 柱状图数据
  const categories = ["情感分析", "主题分类", "关键词提取", "实体识别", "语义相似度", "文本摘要", "意图识别"]
  const barChartData = {
    categories,
    values: categories.map(() => Math.floor(getRandomInt(60, 95) * randomFactor)),
  }

  // 折线图数据
  const lineChartData = {
    months: labels,
    values: dataPoints.map(() => Math.floor(getRandomInt(70, 95) * randomFactor)),
  }

  // 饼图数据
  const pieCategories = ["积极情感", "中性情感", "消极情感", "混合情感", "未确定"]
  const pieChartData = {
    categories: pieCategories,
    values: pieCategories.map(() => Math.floor(getRandomInt(10, 100) * randomFactor)),
  }

  // 面积图数据
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  const areaChartData = {
    days,
    series: [
      {
        name: "正面评价",
        color: "#3b82f6", // blue-500
        values: days.map(() => Math.floor(getRandomInt(30, 80) * randomFactor)),
      },
      {
        name: "负面评价",
        color: "#ef4444", // red-500
        values: days.map(() => Math.floor(getRandomInt(10, 40) * randomFactor)),
      },
    ],
  }

  // 表格数据
  const tableCategories = ["新闻文章", "社交媒体", "产品评论", "客户反馈", "电子邮件", "聊天记录", "学术论文"]
  const tableData = tableCategories.map((category, id) => {
    const positive = Math.floor(getRandomInt(100, 500) * randomFactor)
    const negative = Math.floor(getRandomInt(50, 300) * randomFactor)
    const neutral = Math.floor(getRandomInt(50, 200) * randomFactor)
    const accuracy = Math.floor(getRandomInt(80, 98) * randomFactor)

    return {
      id,
      category,
      positive,
      negative,
      neutral,
      accuracy,
    }
  })

  // 生成比较数据（如果需要）
  let comparisonData = undefined
  if (comparison !== "none" && comparison) {
    comparisonData = generateComparisonData(labels, comparison, randomFactor)
  }

  const data: ChartData = {
    barChartData,
    lineChartData,
    pieChartData,
    areaChartData,
    tableData,
    comparisonData,
  }

  // 缓存数据
  setCachedChartData(data, dateRange, granularity, { comparison, filters })

  // 预加载相关数据
  preloadRelatedData(params)

  return data
}

// 预加载相关数据
function preloadRelatedData(currentParams: ChartDataParams) {
  // 如果已经在预加载中，将请求添加到队列
  if (isPreloading) {
    preloadQueue.push(currentParams)
    return
  }

  // 标记为正在预加载
  isPreloading = true

  // 延迟执行，避免阻塞主线程
  setTimeout(async () => {
    try {
      const { dateRange, granularity, comparison } = currentParams

      // 预加载不同时间粒度的数据
      const granularityToPreload: TimeGranularity[] = []

      if (granularity === "day") {
        granularityToPreload.push("week", "month")
      } else if (granularity === "week") {
        granularityToPreload.push("day", "month")
      } else if (granularity === "month") {
        granularityToPreload.push("week", "quarter")
      } else if (granularity === "quarter") {
        granularityToPreload.push("month", "year")
      } else if (granularity === "year") {
        granularityToPreload.push("quarter")
      }

      // 预加载不同比较类型的数据
      const comparisonToPreload: ComparisonType[] = []
      if (comparison === "none") {
        comparisonToPreload.push("previous_period")
      } else if (comparison === "previous_period") {
        comparisonToPreload.push("year_over_year")
      } else if (comparison === "year_over_year") {
        comparisonToPreload.push("previous_period")
      }

      // 创建预加载任务
      const preloadTasks = []

      // 添加不同粒度的预加载任务
      for (const g of granularityToPreload) {
        preloadTasks.push({
          dateRange,
          granularity: g,
          comparison,
          filters: currentParams.filters,
        })
      }

      // 添加不同比较类型的预加载任务
      for (const c of comparisonToPreload) {
        preloadTasks.push({
          dateRange,
          granularity,
          comparison: c,
          filters: currentParams.filters,
        })
      }

      // 执行预加载任务，但不等待结果
      for (const task of preloadTasks) {
        // 检查是否已经缓存
        const isCached = getCachedChartData(task.dateRange, task.granularity, {
          comparison: task.comparison,
          filters: task.filters,
        })

        if (!isCached) {
          // 使用低优先级加载
          setTimeout(() => {
            fetchChartData(task).catch(console.error)
          }, 2000) // 延迟2秒，避免与主要请求竞争资源
        }
      }
    } finally {
      // 处理队列中的下一个请求
      const nextParams = preloadQueue.shift()
      if (nextParams) {
        preloadRelatedData(nextParams)
      } else {
        isPreloading = false
      }
    }
  }, 500)
}

// 生成比较数据
function generateComparisonData(labels: string[], comparisonType: ComparisonType, randomFactor: number) {
  const currentValues = labels.map(() => Math.floor(getRandomInt(70, 95) * randomFactor))
  const previousValues = labels.map(() => Math.floor(getRandomInt(65, 90) * randomFactor))

  const current = labels.map((label, index) => ({
    label,
    value: currentValues[index],
  }))

  const previous = labels.map((label, index) => ({
    label,
    value: previousValues[index],
  }))

  const change = labels.map((label, index) => {
    const diff = currentValues[index] - previousValues[index]
    const percentage = previousValues[index] !== 0 ? (diff / previousValues[index]) * 100 : 0

    return {
      label,
      value: diff,
      percentage: Number(percentage.toFixed(2)),
    }
  })

  return {
    current,
    previous,
    change,
  }
}

// 根据时间粒度生成标签和数据点
function generateTimeLabels(dateRange: DateRange | undefined, granularity: TimeGranularity) {
  const now = new Date()
  let start: Date
  let end: Date = now

  // 如果没有指定日期范围，使用默认范围
  if (!dateRange || (!dateRange.from && !dateRange.to)) {
    // 默认范围：根据粒度决定
    switch (granularity) {
      case "hour":
        start = subDays(now, 1) // 过去24小时
        break
      case "day":
        start = subDays(now, 30) // 过去30天
        break
      case "week":
        start = subMonths(now, 3) // 过去3个月的周数据
        break
      case "month":
        start = subMonths(now, 12) // 过去12个月
        break
      case "quarter":
        start = subMonths(now, 24) // 过去8个季度
        break
      case "year":
        start = subMonths(now, 60) // 过去5年
        break
      default:
        start = subDays(now, 30)
    }
  } else {
    start = dateRange.from || subDays(now, 30)
    end = dateRange.to || now
  }

  // 根据粒度生成时间点
  let timePoints: Date[] = []
  switch (granularity) {
    case "hour":
      // 简化：每小时一个数据点，最多24个
      timePoints = Array.from({ length: 24 }, (_, i) => {
        const date = new Date(end)
        date.setHours(date.getHours() - 23 + i)
        return date
      })
      break
    case "day":
      timePoints = eachDayOfInterval({ start, end })
      break
    case "week":
      timePoints = eachWeekOfInterval({ start, end }, { locale: zhCN })
      break
    case "month":
      timePoints = eachMonthOfInterval({ start, end })
      break
    case "quarter":
      timePoints = eachQuarterOfInterval({ start, end })
      break
    case "year":
      timePoints = eachYearOfInterval({ start, end })
      break
  }

  // 限制数据点数量，避免过多
  const MAX_POINTS = 12
  if (timePoints.length > MAX_POINTS) {
    const step = Math.ceil(timePoints.length / MAX_POINTS)
    timePoints = timePoints.filter((_, i) => i % step === 0).slice(0, MAX_POINTS)
  }

  // 格式化标签
  const labels = timePoints.map((date) => formatDateByGranularity(date, granularity))

  return { labels, dataPoints: timePoints }
}

// 根据粒度格式化日期
function formatDateByGranularity(date: Date, granularity: TimeGranularity): string {
  switch (granularity) {
    case "hour":
      return format(date, "HH:00", { locale: zhCN })
    case "day":
      return format(date, "MM-dd", { locale: zhCN })
    case "week":
      return `${format(date, "MM-dd", { locale: zhCN })}周`
    case "month":
      return format(date, "yyyy-MM", { locale: zhCN })
    case "quarter":
      const quarter = Math.floor(date.getMonth() / 3) + 1
      return `${date.getFullYear()}Q${quarter}`
    case "year":
      return format(date, "yyyy年", { locale: zhCN })
    default:
      return format(date, "yyyy-MM-dd", { locale: zhCN })
  }
}

// 获取上一个周期的日期范围
export function getPreviousPeriodRange(dateRange: DateRange | undefined, granularity: TimeGranularity): DateRange {
  if (!dateRange || !dateRange.from) {
    return {}
  }

  const { from, to = new Date() } = dateRange
  const duration = to.getTime() - from.getTime()

  const previousFrom = new Date(from.getTime() - duration)
  const previousTo = new Date(to.getTime() - duration)

  return { from: previousFrom, to: previousTo }
}

// 获取去年同期的日期范围
export function getYearOverYearRange(dateRange: DateRange | undefined): DateRange {
  if (!dateRange || !dateRange.from) {
    return {}
  }

  const { from, to = new Date() } = dateRange

  const previousFrom = new Date(from)
  previousFrom.setFullYear(previousFrom.getFullYear() - 1)

  const previousTo = new Date(to)
  previousTo.setFullYear(previousTo.getFullYear() - 1)

  return { from: previousFrom, to: previousTo }
}

// 格式化日期范围为显示文本
export function formatDateRangeText(dateRange?: DateRange, granularity: TimeGranularity = "day"): string {
  if (!dateRange || (!dateRange.from && !dateRange.to)) {
    return "全部时间"
  }

  if (dateRange.from && dateRange.to) {
    return `${formatDateByGranularity(dateRange.from, "day")} 至 ${formatDateByGranularity(dateRange.to, "day")}`
  }

  if (dateRange.from) {
    return `${formatDateByGranularity(dateRange.from, "day")} 之后`
  }

  if (dateRange.to) {
    return `${formatDateByGranularity(dateRange.to, "day")} 之前`
  }

  return "全部时间"
}

// 获取时间粒度选项
export function getGranularityOptions() {
  return [
    { value: "hour", label: "小时" },
    { value: "day", label: "天" },
    { value: "week", label: "周" },
    { value: "month", label: "月" },
    { value: "quarter", label: "季度" },
    { value: "year", label: "年" },
  ]
}

// 获取比较类型选项
export function getComparisonOptions() {
  return [
    { value: "none", label: "不比较" },
    { value: "previous_period", label: "环比（上一周期）" },
    { value: "year_over_year", label: "同比（去年同期）" },
  ]
}
