"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { isMobile } = useMobileDetection()

  // 预设时间范围选项
  const presetRanges = [
    { label: "过去7天", days: 7 },
    { label: "过去30天", days: 30 },
    { label: "过去90天", days: 90 },
    { label: "今年", value: "year" },
    { label: "全部时间", value: "all" },
  ]

  // 处理预设范围选择
  const handlePresetChange = (value: string) => {
    const today = new Date()
    let from: Date | undefined
    let to: Date | undefined = today

    if (value === "all") {
      // 全部时间 - 使用undefined表示不限制
      from = undefined
      to = undefined
    } else if (value === "year") {
      // 今年 - 从今年1月1日到今天
      from = new Date(today.getFullYear(), 0, 1)
    } else {
      // 过去X天
      const days = Number.parseInt(value, 10)
      from = new Date()
      from.setDate(today.getDate() - days)
    }

    onDateRangeChange({ from, to })

    // 关闭移动端的sheet
    if (isMobile) {
      setIsSheetOpen(false)
    }
  }

  // 格式化日期范围显示文本
  const formatDateRangeText = () => {
    if (!dateRange?.from) {
      return "选择日期范围"
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "yyyy年MM月dd日", { locale: zhCN })} - ${format(dateRange.to, "yyyy年MM月dd日", { locale: zhCN })}`
    }

    return format(dateRange.from, "yyyy年MM月dd日", { locale: zhCN })
  }

  // 移动端使用Sheet，桌面端使用Popover
  if (isMobile) {
    return (
      <div className={cn("grid gap-2", className)}>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="truncate">{formatDateRangeText()}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] flex flex-col">
            <SheetHeader className="mb-4">
              <SheetTitle>选择日期范围</SheetTitle>
            </SheetHeader>

            <div className="mb-4">
              <Select onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="预设时间范围" />
                </SelectTrigger>
                <SelectContent>
                  {presetRanges.map((preset) => (
                    <SelectItem key={preset.value || preset.days} value={preset.value || preset.days.toString()}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-hidden">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  onDateRangeChange(range)
                  if (range?.from && range?.to) {
                    setIsSheetOpen(false)
                  }
                }}
                numberOfMonths={1}
                locale={zhCN}
                className="mx-auto"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsSheetOpen(false)} className="w-full">
                完成
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  // 桌面版本
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button id="date" variant="outline" className="w-full sm:w-[300px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRangeText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                onDateRangeChange(range)
                if (range?.from && range?.to) {
                  setIsPopoverOpen(false)
                }
              }}
              numberOfMonths={2}
              locale={zhCN}
            />
          </PopoverContent>
        </Popover>

        <Select onValueChange={handlePresetChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="预设时间范围" />
          </SelectTrigger>
          <SelectContent>
            {presetRanges.map((preset) => (
              <SelectItem key={preset.value || preset.days} value={preset.value || preset.days.toString()}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
