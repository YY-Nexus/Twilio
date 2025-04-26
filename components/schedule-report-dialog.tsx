"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { ExportFormat } from "@/lib/report-export-service"

interface ScheduleReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportData: any
  exportFormat: ExportFormat
  filename: string
}

export function ScheduleReportDialog({
  open,
  onOpenChange,
  reportData,
  exportFormat,
  filename,
}: ScheduleReportDialogProps) {
  const [frequency, setFrequency] = useState("monthly")
  const [dayOfMonth, setDayOfMonth] = useState("1")
  const [dayOfWeek, setDayOfWeek] = useState("1")
  const [time, setTime] = useState("09:00")
  const [recipients, setRecipients] = useState("")
  const [sendToSelf, setSendToSelf] = useState(true)
  const [isScheduling, setIsScheduling] = useState(false)

  const handleSchedule = () => {
    if (!recipients && !sendToSelf) {
      toast({
        title: "无法定时发送",
        description: "请至少添加一个收件人或选择发送给自己",
        variant: "destructive",
      })
      return
    }

    setIsScheduling(true)
    // 模拟定时发送设置过程
    setTimeout(() => {
      setIsScheduling(false)
      onOpenChange(false)
      toast({
        title: "定时发送已设置",
        description: `报表将按照设定的时间自动发送`,
      })
    }, 1500)
  }

  // 生成日期选项（1-31）
  const dayOptions = Array.from({ length: 31 }, (_, i) => (i + 1).toString())

  // 星期选项
  const weekdayOptions = [
    { value: "1", label: "星期一" },
    { value: "2", label: "星期二" },
    { value: "3", label: "星期三" },
    { value: "4", label: "星期四" },
    { value: "5", label: "星期五" },
    { value: "6", label: "星期六" },
    { value: "0", label: "星期日" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>定时发送报表</DialogTitle>
          <DialogDescription>设置报表自动发送的频率和收件人</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">发送频率</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="选择发送频率" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">每天</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
                <SelectItem value="monthly">每月</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">每月几号</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger id="dayOfMonth">
                  <SelectValue placeholder="选择日期" />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}号
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "weekly" && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">每周几</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger id="dayOfWeek">
                  <SelectValue placeholder="选择星期" />
                </SelectTrigger>
                <SelectContent>
                  {weekdayOptions.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="time">发送时间</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">收件人邮箱</Label>
            <Input
              id="recipients"
              placeholder="多个邮箱请用分号(;)分隔"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendToSelf"
              checked={sendToSelf}
              onCheckedChange={(checked) => setSendToSelf(checked as boolean)}
            />
            <Label htmlFor="sendToSelf">同时发送给我自己</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSchedule} disabled={isScheduling}>
            {isScheduling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                设置中...
              </>
            ) : (
              "确认设置"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
