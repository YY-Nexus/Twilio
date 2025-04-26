"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getGranularityOptions, type TimeGranularity } from "@/lib/chart-data-service"

interface GranularitySelectorProps {
  granularity: TimeGranularity
  onGranularityChange: (value: TimeGranularity) => void
  className?: string
}

export function GranularitySelector({ granularity, onGranularityChange, className }: GranularitySelectorProps) {
  const options = getGranularityOptions()

  return (
    <div className={className}>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="granularity">时间粒度</Label>
        <Select value={granularity} onValueChange={(value) => onGranularityChange(value as TimeGranularity)}>
          <SelectTrigger id="granularity">
            <SelectValue placeholder="选择时间粒度" />
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
