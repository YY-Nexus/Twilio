"use client"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChartControlsProps {
  animationDuration: number
  setAnimationDuration: (value: number) => void
  showLabels: boolean
  setShowLabels: (value: boolean) => void
  showLegend: boolean
  setShowLegend: (value: boolean) => void
  showGrid: boolean
  setShowGrid: (value: boolean) => void
}

export function ChartControls({
  animationDuration,
  setAnimationDuration,
  showLabels,
  setShowLabels,
  showLegend,
  setShowLegend,
  showGrid,
  setShowGrid,
}: ChartControlsProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <Card className="card-on-bg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="animation-duration" className="text-base font-medium">
                  动画持续时间
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>调整图表动画的持续时间（毫秒）</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm text-muted-foreground">{animationDuration}ms</span>
            </div>
            <Slider
              id="animation-duration"
              min={0}
              max={2000}
              step={50}
              value={[animationDuration]}
              onValueChange={(value) => setAnimationDuration(value[0])}
              disabled={prefersReducedMotion}
              className={prefersReducedMotion ? "opacity-50" : ""}
            />
            {prefersReducedMotion && (
              <p className="text-sm text-muted-foreground">已检测到减少动画偏好设置，动画已禁用</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-labels" className="text-base font-medium">
                  显示标签
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>在图表上显示数据标签</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-legend" className="text-base font-medium">
                  显示图例
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>显示图表图例</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch id="show-legend" checked={showLegend} onCheckedChange={setShowLegend} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-grid" className="text-base font-medium">
                  显示网格
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>显示图表背景网格</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
