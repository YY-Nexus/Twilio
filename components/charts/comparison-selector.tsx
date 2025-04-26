"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getComparisonOptions, type ComparisonType } from "@/lib/chart-data-service"

interface ComparisonSelectorProps {
  comparison: ComparisonType
  onComparisonChange: (value: ComparisonType) => void
  className?: string
}

export function ComparisonSelector({ comparison, onComparisonChange, className }: ComparisonSelectorProps) {
  const options = getComparisonOptions()

  return (
    <div className={className}>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="comparison">数据对比</Label>
        <Select value={comparison} onValueChange={(value) => onComparisonChange(value as ComparisonType)}>
          <SelectTrigger id="comparison">
            <SelectValue placeholder="选择对比方式" />
          </SelectTrigger>
          <SelectContent position="popper">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
