"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useMobileDetection } from "@/hooks/use-mobile-detection"

// 筛选条件类型
export interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string | number | boolean | string[]
}

interface AdvancedFiltersProps {
  filters: FilterCondition[]
  onFiltersChange: (filters: FilterCondition[]) => void
  className?: string
}

export function AdvancedFilters({ filters, onFiltersChange, className }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingFilter, setEditingFilter] = useState<FilterCondition | null>(null)
  const { isMobile } = useMobileDetection()

  // 可用字段选项
  const fieldOptions = [
    { value: "department", label: "部门" },
    { value: "category", label: "文本类别" },
    { value: "sentiment", label: "情感倾向" },
    { value: "accuracy", label: "准确率" },
    { value: "source", label: "数据来源" },
  ]

  // 根据字段获取操作符选项
  const getOperatorOptions = (field: string) => {
    switch (field) {
      case "accuracy":
        return [
          { value: "gt", label: "大于" },
          { value: "lt", label: "小于" },
          { value: "eq", label: "等于" },
          { value: "between", label: "介于" },
        ]
      case "department":
      case "category":
      case "source":
        return [
          { value: "eq", label: "等于" },
          { value: "in", label: "包含于" },
          { value: "not_in", label: "不包含于" },
        ]
      case "sentiment":
        return [
          { value: "eq", label: "等于" },
          { value: "not_eq", label: "不等于" },
        ]
      default:
        return [
          { value: "eq", label: "等于" },
          { value: "not_eq", label: "不等于" },
        ]
    }
  }

  // 根据字段获取值选项
  const getValueOptions = (field: string) => {
    switch (field) {
      case "department":
        return [
          { value: "tech", label: "技术部" },
          { value: "marketing", label: "市场部" },
          { value: "sales", label: "销售部" },
          { value: "hr", label: "人事部" },
          { value: "finance", label: "财务部" },
        ]
      case "category":
        return [
          { value: "news", label: "新闻文章" },
          { value: "social", label: "社交媒体" },
          { value: "review", label: "产品评论" },
          { value: "feedback", label: "客户反馈" },
          { value: "email", label: "电子邮件" },
          { value: "chat", label: "聊天记录" },
          { value: "academic", label: "学术论文" },
        ]
      case "sentiment":
        return [
          { value: "positive", label: "积极" },
          { value: "neutral", label: "中性" },
          { value: "negative", label: "消极" },
          { value: "mixed", label: "混合" },
        ]
      case "source":
        return [
          { value: "web", label: "网站" },
          { value: "app", label: "应用" },
          { value: "api", label: "API" },
          { value: "manual", label: "手动录入" },
        ]
      default:
        return []
    }
  }

  // 添加新筛选条件
  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      field: "department",
      operator: "eq",
      value: "",
    }
    setEditingFilter(newFilter)
  }

  // 保存筛选条件
  const saveFilter = () => {
    if (!editingFilter) return

    const newFilters = editingFilter.id
      ? filters.map((f) => (f.id === editingFilter.id ? editingFilter : f))
      : [...filters, editingFilter]

    onFiltersChange(newFilters)
    setEditingFilter(null)
  }

  // 删除筛选条件
  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter((f) => f.id !== id))
  }

  // 清除所有筛选条件
  const clearAllFilters = () => {
    onFiltersChange([])
    if (isMobile) {
      setIsSheetOpen(false)
    } else {
      setIsOpen(false)
    }
  }

  // 获取筛选条件显示文本
  const getFilterDisplayText = (filter: FilterCondition): string => {
    const field = fieldOptions.find((f) => f.value === filter.field)?.label || filter.field
    const operator = getOperatorOptions(filter.field).find((o) => o.value === filter.operator)?.label || filter.operator

    let valueText = ""
    if (Array.isArray(filter.value)) {
      valueText = filter.value.join(", ")
    } else if (typeof filter.value === "boolean") {
      valueText = filter.value ? "是" : "否"
    } else {
      valueText = String(filter.value)
    }

    return `${field} ${operator} ${valueText}`
  }

  // 筛选条件编辑表单
  const renderFilterForm = () => (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="filter-field">字段</Label>
        <Select
          value={editingFilter?.field}
          onValueChange={(value) =>
            setEditingFilter(editingFilter ? { ...editingFilter, field: value, value: "" } : null)
          }
        >
          <SelectTrigger id="filter-field">
            <SelectValue placeholder="选择字段" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-operator">操作符</Label>
        <Select
          value={editingFilter?.operator}
          onValueChange={(value) => setEditingFilter(editingFilter ? { ...editingFilter, operator: value } : null)}
        >
          <SelectTrigger id="filter-operator">
            <SelectValue placeholder="选择操作符" />
          </SelectTrigger>
          <SelectContent>
            {editingFilter &&
              getOperatorOptions(editingFilter.field).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-value">值</Label>
        {editingFilter && (editingFilter.operator === "in" || editingFilter.operator === "not_in") ? (
          <div className="space-y-2">
            {getValueOptions(editingFilter.field).map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`value-${option.value}`}
                  checked={Array.isArray(editingFilter.value) && editingFilter.value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(editingFilter.value) ? editingFilter.value : []
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v) => v !== option.value)
                    setEditingFilter({ ...editingFilter, value: newValues })
                  }}
                />
                <Label htmlFor={`value-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        ) : editingFilter && editingFilter.field === "accuracy" ? (
          <Input
            id="filter-value"
            type="number"
            value={editingFilter.value as string}
            onChange={(e) => setEditingFilter({ ...editingFilter, value: e.target.value })}
            placeholder="输入数值"
          />
        ) : editingFilter && getValueOptions(editingFilter.field).length > 0 ? (
          <Select
            value={editingFilter.value as string}
            onValueChange={(value) => setEditingFilter({ ...editingFilter, value })}
          >
            <SelectTrigger id="filter-value">
              <SelectValue placeholder="选择值" />
            </SelectTrigger>
            <SelectContent>
              {getValueOptions(editingFilter.field).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="filter-value"
            value={(editingFilter?.value as string) || ""}
            onChange={(e) => setEditingFilter(editingFilter ? { ...editingFilter, value: e.target.value } : null)}
            placeholder="输入值"
          />
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditingFilter(null)}>
          取消
        </Button>
        <Button size="sm" onClick={saveFilter}>
          保存
        </Button>
      </div>
    </div>
  )

  // 筛选条件列表
  const renderFilterList = () => (
    <div className="space-y-2">
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center justify-between rounded-md border p-2">
          <span className="text-sm truncate max-w-[70%]">{getFilterDisplayText(filter)}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingFilter(filter)}>
              <Filter className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => removeFilter(filter.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )

  // 移动端使用Sheet
  if (isMobile) {
    return (
      <div className={className}>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 w-full">
              <Filter className="h-4 w-4" />
              高级筛选
              {filters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex justify-between items-center">
                <span>高级筛选</span>
                {filters.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2">
                    清除全部
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-auto">
              {filters.length > 0 && <ScrollArea className="h-[200px] pr-4 mb-4">{renderFilterList()}</ScrollArea>}

              {editingFilter ? (
                renderFilterForm()
              ) : (
                <Button onClick={addFilter} className="w-full">
                  添加筛选条件
                </Button>
              )}
            </div>

            <div className="mt-4">
              <Button onClick={() => setIsSheetOpen(false)} className="w-full">
                完成
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {filters.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Badge key={filter.id} variant="outline" className="flex items-center gap-1">
                {getFilterDisplayText(filter)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => removeFilter(filter.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 桌面端使用Popover
  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            高级筛选
            {filters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">高级筛选</h4>
              {filters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2">
                  清除全部
                </Button>
              )}
            </div>

            {filters.length > 0 && <ScrollArea className="h-[200px] pr-4">{renderFilterList()}</ScrollArea>}

            {editingFilter ? (
              renderFilterForm()
            ) : (
              <Button onClick={addFilter} className="w-full">
                添加筛选条件
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {filters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge key={filter.id} variant="outline" className="flex items-center gap-1">
              {getFilterDisplayText(filter)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => removeFilter(filter.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
