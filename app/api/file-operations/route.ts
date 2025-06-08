import { type NextRequest, NextResponse } from "next/server"

// 文件操作类型
type OperationType = "rename" | "convert" | "tags" | "category" | "process-image"

// 操作状态
type TaskStatus = "pending" | "processing" | "completed" | "failed"

// 任务接口
interface Task {
  id: string
  type: OperationType
  status: TaskStatus
  progress: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  params: Record<string, any>
  result?: {
    success: boolean
    message: string
    affectedFiles: number
    failedFiles: number
    details?: string
  }
  fileIds: string[]
}

// 模拟任务存储
const tasks: Task[] = []

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// 创建新任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, params, fileIds } = body

    if (!type || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: "Invalid request. Type and fileIds are required." }, { status: 400 })
    }

    // 创建新任务
    const task: Task = {
      id: generateId(),
      type,
      status: "pending",
      progress: 0,
      createdAt: new Date(),
      params,
      fileIds,
    }

    // 添加到任务列表
    tasks.push(task)

    // 模拟异步处理任务
    processTask(task)

    return NextResponse.json({ taskId: task.id })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

// 获取任务状态
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const taskId = url.searchParams.get("taskId")
  const all = url.searchParams.get("all")

  if (all === "true") {
    // 返回所有任务
    return NextResponse.json({ tasks })
  }

  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
  }

  // 查找任务
  const task = tasks.find((t) => t.id === taskId)
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json({ task })
}

// 模拟处理任务
async function processTask(task: Task) {
  // 更新任务状态
  task.status = "processing"
  task.startedAt = new Date()

  // 模拟进度更新
  const interval = setInterval(() => {
    task.progress += Math.floor(Math.random() * 10) + 1
    if (task.progress >= 100) {
      task.progress = 100
      clearInterval(interval)
      completeTask(task)
    }
  }, 500)
}

// 完成任务
function completeTask(task: Task) {
  task.status = "completed"
  task.completedAt = new Date()

  // 模拟任务结果
  task.result = {
    success: Math.random() > 0.1, // 90% 成功率
    message: `已成功处理 ${task.fileIds.length} 个文件`,
    affectedFiles: task.fileIds.length,
    failedFiles: 0,
  }

  // 如果失败，更新消息
  if (!task.result.success) {
    task.status = "failed"
    task.result.message = "处理文件时出错"
    task.result.failedFiles = Math.floor(Math.random() * task.fileIds.length)
    task.result.affectedFiles = task.fileIds.length - task.result.failedFiles
    task.result.details = "服务器处理错误，请稍后重试"
  }
}
