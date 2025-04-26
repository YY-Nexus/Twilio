import type { DateRange } from "react-day-picker"
import type { ChartData } from "./chart-data-service"

// 缓存项接口
interface CacheItem<T> {
  data: T
  timestamp: number
  params: string // 序列化的参数
  expiresAt: number
}

// 缓存配置
interface CacheConfig {
  ttl: number // 缓存生存时间（毫秒）
  maxSize: number // 最大缓存项数量
}

// 默认缓存配置
const defaultConfig: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 20, // 最多缓存20个不同的请求
}

// 缓存服务类
class CacheService {
  private cache: Map<string, CacheItem<any>>
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.cache = new Map()
  }

  // 生成缓存键
  private generateKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`
  }

  // 获取缓存数据
  get<T>(type: string, params: any): T | null {
    const key = this.generateKey(type, params)
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // 设置缓存数据
  set<T>(type: string, params: any, data: T): void {
    const key = this.generateKey(type, params)

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.findOldestKey()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      params: JSON.stringify(params),
      expiresAt: Date.now() + this.config.ttl,
    })
  }

  // 查找最旧的缓存项
  private findOldestKey(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  // 清除特定类型的缓存
  clearType(type: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}:`)) {
        this.cache.delete(key)
      }
    }
  }

  // 清除所有缓存
  clearAll(): void {
    this.cache.clear()
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
    }
  }
}

// 创建单例实例
export const cacheService = new CacheService()

// 特定于图表数据的缓存辅助函数
export function getCachedChartData(
  dateRange: DateRange | undefined,
  granularity: string,
  additionalParams: Record<string, any> = {},
): ChartData | null {
  return cacheService.get<ChartData>("chartData", { dateRange, granularity, ...additionalParams })
}

export function setCachedChartData(
  data: ChartData,
  dateRange: DateRange | undefined,
  granularity: string,
  additionalParams: Record<string, any> = {},
): void {
  cacheService.set<ChartData>("chartData", { dateRange, granularity, ...additionalParams }, data)
}

// 增量更新辅助函数
export function updateCachedChartData(
  newData: Partial<ChartData>,
  dateRange: DateRange | undefined,
  granularity: string,
  additionalParams: Record<string, any> = {},
): ChartData | null {
  const cachedData = getCachedChartData(dateRange, granularity, additionalParams)

  if (!cachedData) {
    return null
  }

  const updatedData: ChartData = {
    ...cachedData,
    ...newData,
  }

  setCachedChartData(updatedData, dateRange, granularity, additionalParams)
  return updatedData
}
