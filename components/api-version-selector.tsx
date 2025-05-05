"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ApiVersionSelector({
  versions,
  currentVersion,
  onVersionChange,
}: {
  versions: Array<{ version: string; releaseDate: string }>
  currentVersion: string
  onVersionChange: (version: string) => void
}) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">API版本:</span>
      <Select value={currentVersion} onValueChange={onVersionChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择版本" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v.version} value={v.version}>
              {v.version} ({v.releaseDate})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
