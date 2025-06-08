"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  PlayIcon,
  MonitorStopIcon as StopIcon,
  Trash2Icon,
  Eye,
} from "lucide-react"

// 任务状态类型
type TaskStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"

// 任务类型
type TaskType = "rename" | "convert" | "process-image" | "tags" | "category"

// 任务接口
interface Task {
  id: string
  type: TaskType
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
  progress: number
  fileCount: number
  params: Record<string, any>
  result?: {
    success: boolean
    message: string
    affectedFiles: number
    failedFiles: number
    details?: string
  }
}

// 生成模拟任务数据
const generateMockTasks = (): Task[] => {
  return [
    {
      id: "task_1",
      type: "rename",
      status: "completed",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1.9 * 60 * 60 * 1000),
      progress: 100,
      fileCount: 5,
      params: {
        renameType: "prefix",
        prefixText: "API-",
      },
      result: {
        success: true,
        message: "重命名操作成功完成",
        affectedFiles: 5,
        failedFiles: 0,
      },
    },
    {
      id: "task_2",
      type: "convert",
      status: "processing",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      updatedAt: new Date(Date.now() - 25 * 60 * 1000),
      progress: 60,
      fileCount: 3,
      params: {
        conversionType: "image",
        targetFormat: "webp",
      },
    },
    {
      id: "task_3",
      type: "tags",
      status: "failed",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4.9 * 60 * 60 * 1000),
      progress: 100,
      fileCount: 10,
      params: {
        tagOperation: "add",
        tagsToAdd: "API,文档,重要",
      },
      result: {
        success: false,
        message: "部分文件标签更新失败",
        affectedFiles: 7,
        failedFiles: 3,
        details: "3个文件无法访问或已被删除",
      },
    },
    {
      id: "task_4",
      type: "process-image",
      status: "pending",
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
      progress: 0,
      fileCount: 8,
      params: {
        imageProcessType: "resize",
        resizeWidth: 800,
        resizeHeight: 600,
      },
    },
    {
      id: "task_5",
      type: "category",
      status: "cancelled",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7.8 * 60 * 60 * 1000),
      progress: 30,
      fileCount: 15,
      params: {
        newCategory: "API文档",
      },
    },
  ]
}

// 获取任务类型显示名称
const getTaskTypeName = (type: TaskType): string => {
  switch (type) {
    case "rename":
      return "批量重命名"
    case "convert":
      return "格式转换"
    case "process-image":
      return "图片处理"
    case "tags":
      return "标签管理"
    case "category":
      return "分类管理"
    default:
      return "未知任务"
  }
}

// 获取任务状态显示名称和颜色
const getTaskStatusInfo = (status: TaskStatus): { name: string; color: string; icon: React.ReactNode } => {
  switch (status) {
    case "pending":
      return {
        name: "等待中",
        color: "bg-yellow-100 text-yellow-800",
        icon: <ClockIcon className="h-4 w-4 text-yellow-500" />,
      }
    case "processing":
      return {
        name: "处理中",
        color: "bg-blue-100 text-blue-800",
        icon: <RefreshCwIcon className="h-4 w-4 text-blue-500 animate-spin" />,
      }
    case "completed":
      return {
        name: "已完成",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
      }
    case "failed":
      return {
        name: "失败",
        color: "bg-red-100 text-red-800",
        icon: <XCircleIcon className="h-4 w-4 text-red-500" />,
      }
    case "cancelled":
      return {
        name: "已取消",
        color: "bg-gray-100 text-gray-800",
        icon: <StopIcon className="h-4 w-4 text-gray-500" />,
      }
    default:
      return {
        name: "未知",
        color: "bg-gray-100 text-gray-800",
        icon: <ClockIcon className="h-4 w-4 text-gray-500" />,
      }
  }
}

// 格式化日期时间
const formatDateTime = (date: Date): string => {
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

interface BatchTaskManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function BatchTaskManager({ isOpen, onClose }: BatchTaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "failed">("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)

  // 加载任务数据
  useEffect(() => {
    if (isOpen) {
      loadTasks()
    }
  }, [isOpen])

  // 加载任务数据
  const loadTasks = () => {
    setLoading(true)
    // 模拟API调用延迟
    setTimeout(() => {
      const mockTasks = generateMockTasks()
      setTasks(mockTasks)
      setLoading(false)
    }, 800)
  }

  // 过滤任务
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return ["pending", "processing"].includes(task.status)
    if (activeTab === "completed") return task.status === "completed"
    if (activeTab === "failed") return ["failed", "cancelled"].includes(task.status)
    return true
  })

  // 查看任务详情
  const viewTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }

  // 取消任务
  const cancelTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && ["pending", "processing"].includes(task.status)) {
          return {
            ...task,
            status: "cancelled",
            updatedAt: new Date(),
          }
        }
        return task
      }),
    )
  }

  // 重试任务
  const retryTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && ["failed", "cancelled"].includes(task.status)) {
          return {
            ...task,
            status: "pending",
            progress: 0,
            updatedAt: new Date(),
            result: undefined,
          }
        }
        return task
      }),
    )
  }

  // 删除任务
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批处理任务管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList>
                <TabsTrigger value="all">所有任务</TabsTrigger>
                <TabsTrigger value="active">进行中</TabsTrigger>
                <TabsTrigger value="completed">已完成</TabsTrigger>
                <TabsTrigger value="failed">失败/取消</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={loadTasks} disabled={loading}>
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              刷新
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClockIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>没有找到任务</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">任务类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>文件数</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const statusInfo = getTaskStatusInfo(task.status)
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{getTaskTypeName(task.type)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {statusInfo.icon}
                            <Badge variant="outline" className={statusInfo.color}>
                              {statusInfo.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{task.fileCount}</TableCell>
                        <TableCell>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                task.status === "completed"
                                  ? "bg-green-500"
                                  : task.status === "failed" || task.status === "cancelled"
                                    ? "bg-red-500"
                                    : "bg-primary"
                              }`}
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{task.progress}%</span>
                        </TableCell>
                        <TableCell>{formatDateTime(task.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => viewTaskDetails(task)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {["pending", "processing"].includes(task.status) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => cancelTask(task.id)}
                              >
                                <StopIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {["failed", "cancelled"].includes(task.status) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-500"
                                onClick={() => retryTask(task.id)}
                              >
                                <PlayIcon className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* 任务详情对话框 */}
        {selectedTask && (
          <Dialog open={isTaskDetailsOpen} onOpenChange={() => setIsTaskDetailsOpen(false)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>任务详情</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">任务ID</p>
                    <p>{selectedTask.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">任务类型</p>
                    <p>{getTaskTypeName(selectedTask.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">状态</p>
                    <div className="flex items-center space-x-2">
                      {getTaskStatusInfo(selectedTask.status).icon}
                      <span>{getTaskStatusInfo(selectedTask.status).name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">文件数</p>
                    <p>{selectedTask.fileCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">创建时间</p>
                    <p>{formatDateTime(selectedTask.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">更新时间</p>
                    <p>{formatDateTime(selectedTask.updatedAt)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">任务参数</p>
                  <Card>
                    <CardContent className="p-4">
                      <pre className="text-xs overflow-auto max-h-[200px]">
                        {JSON.stringify(selectedTask.params, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                {selectedTask.result && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">任务结果</p>
                    <Card
                      className={
                        selectedTask.result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-2">
                          {selectedTask.result.success ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{selectedTask.result.message}</p>
                            <p className="text-sm">
                              成功: {selectedTask.result.affectedFiles} 个文件, 失败: {selectedTask.result.failedFiles}{" "}
                              个文件
                            </p>
                            {selectedTask.result.details && (
                              <p className="text-sm text-muted-foreground mt-1">{selectedTask.result.details}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {["pending", "processing"].includes(selectedTask.status) && (
                    <Button variant="outline" onClick={() => cancelTask(selectedTask.id)}>
                      <StopIcon className="h-4 w-4 mr-2" />
                      取消任务
                    </Button>
                  )}
                  {["failed", "cancelled"].includes(selectedTask.status) && (
                    <Button variant="outline" onClick={() => retryTask(selectedTask.id)}>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      重试任务
                    </Button>
                  )}
                  <Button variant="destructive" onClick={() => deleteTask(selectedTask.id)}>
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    删除任务
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
