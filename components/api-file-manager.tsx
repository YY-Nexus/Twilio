"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilePreview } from "@/components/file-preview"
import { BatchFileOperations } from "./batch-file-operations"
import { BatchTaskManager } from "./batch-task-manager"
import { AIFileAssistant } from "./ai-file-assistant"
import { toast } from "@/hooks/use-toast"
import {
  UploadCloud,
  File,
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  Download,
  Trash2,
  Search,
  Grid,
  List,
  Share2,
  FolderPlus,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Check,
  Eye,
  Folder,
  Settings,
  RefreshCw,
  History,
  BrainIcon,
} from "lucide-react"

// 文件类型
type FileType = "image" | "document" | "code" | "archive" | "other"

// 文件状态
type FileStatus = "active" | "archived" | "deleted"

// 文件接口
interface FileItem {
  id: string
  name: string
  type: FileType
  size: number
  uploadedAt: Date
  uploadedBy: string
  status: FileStatus
  description?: string
  tags: string[]
  url: string
  thumbnailUrl?: string
  category?: string
  content?: string
}

// 生成唯一ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11)
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// 获取文件类型图标
const getFileTypeIcon = (type: FileType) => {
  switch (type) {
    case "image":
      return <FileImage className="h-6 w-6 text-blue-500" />
    case "document":
      return <FileText className="h-6 w-6 text-green-500" />
    case "code":
      return <FileCode className="h-6 w-6 text-purple-500" />
    case "archive":
      return <FileArchive className="h-6 w-6 text-yellow-500" />
    default:
      return <File className="h-6 w-6 text-gray-500" />
  }
}

// 获取文件类型
const getFileType = (fileName: string): FileType => {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"].includes(extension)) {
    return "image"
  } else if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"].includes(extension)) {
    return "document"
  } else if (["js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "yaml", "yml", "md"].includes(extension)) {
    return "code"
  } else if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "archive"
  } else {
    return "other"
  }
}

// 生成模拟文件数据
const generateMockFiles = (): FileItem[] => {
  return [
    {
      id: "file_1",
      name: "api-documentation.pdf",
      type: "document",
      size: 2456789,
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      uploadedBy: "admin@example.com",
      status: "active",
      description: "API完整文档，包含所有端点和参数说明",
      tags: ["文档", "API", "参考"],
      url: "/placeholder.svg?key=lps16",
      category: "文档",
    },
    {
      id: "file_2",
      name: "api-schema.json",
      type: "code",
      size: 45678,
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      uploadedBy: "developer@example.com",
      status: "active",
      description: "API的JSON Schema定义",
      tags: ["Schema", "JSON", "定义"],
      url: "#",
      category: "技术",
      content: `{
  "openapi": "3.0.0",
  "info": {
    "title": "示例API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "获取用户列表"
      }
    }
  }
}`,
    },
    {
      id: "file_3",
      name: "api-flow-diagram.png",
      type: "image",
      size: 1234567,
      uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      uploadedBy: "designer@example.com",
      status: "active",
      description: "API调用流程图",
      tags: ["图表", "流程", "设计"],
      url: "/placeholder.svg?key=eezne",
      thumbnailUrl: "/placeholder.svg?key=5vg58",
      category: "设计",
    },
    {
      id: "file_4",
      name: "example-requests.zip",
      type: "archive",
      size: 3456789,
      uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      uploadedBy: "developer@example.com",
      status: "active",
      description: "API请求示例集合",
      tags: ["示例", "请求", "测试"],
      url: "#",
      category: "示例",
    },
    {
      id: "file_5",
      name: "api-client-library.zip",
      type: "archive",
      size: 5678901,
      uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      uploadedBy: "developer@example.com",
      status: "active",
      description: "API客户端库",
      tags: ["库", "客户端", "SDK"],
      url: "#",
      category: "SDK",
    },
    {
      id: "file_6",
      name: "api-demo-video.mp4",
      type: "other",
      size: 15678901,
      uploadedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      uploadedBy: "trainer@example.com",
      status: "active",
      description: "API使用演示视频",
      tags: ["视频", "演示", "教程"],
      url: "/placeholder.svg?key=dns7b",
      category: "教程",
    },
  ]
}

export function ApiFileManager() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 文件预览状态
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number>(-1)

  // 批量操作状态
  const [isBatchOperationOpen, setIsBatchOperationOpen] = useState(false)
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  // 加载文件数据
  useEffect(() => {
    loadFiles()
  }, [])

  // 加载文件数据
  const loadFiles = () => {
    setLoading(true)
    // 模拟API调用延迟
    setTimeout(() => {
      const mockFiles = generateMockFiles()
      setFiles(mockFiles)
      setLoading(false)
    }, 800)
  }

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles || uploadedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // 模拟上传进度
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // 模拟上传完成
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)

      // 创建新文件记录
      const newFiles: FileItem[] = Array.from(uploadedFiles).map((file) => ({
        id: `file_${generateId()}`,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy: "current_user@example.com",
        status: "active",
        tags: [],
        url: URL.createObjectURL(file),
        thumbnailUrl: getFileType(file.name) === "image" ? URL.createObjectURL(file) : undefined,
        category: "未分类",
      }))

      setFiles((prev) => [...newFiles, ...prev])
      setIsUploading(false)
      setUploadProgress(0)

      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }, 3000)
  }

  // 处理拖放上传
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setIsUploading(true)
      setUploadProgress(0)

      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 300)

      // 模拟上传完成
      setTimeout(() => {
        clearInterval(interval)
        setUploadProgress(100)

        // 创建新文件记录
        const newFiles: FileItem[] = Array.from(event.dataTransfer.files).map((file) => ({
          id: `file_${generateId()}`,
          name: file.name,
          type: getFileType(file.name),
          size: file.size,
          uploadedAt: new Date(),
          uploadedBy: "current_user@example.com",
          status: "active",
          tags: [],
          url: URL.createObjectURL(file),
          thumbnailUrl: getFileType(file.name) === "image" ? URL.createObjectURL(file) : undefined,
          category: "未分类",
        }))

        setFiles((prev) => [...newFiles, ...prev])
        setIsUploading(false)
        setUploadProgress(0)
      }, 3000)
    }
  }, [])

  // 处理拖放事件
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  // 过滤和排序文件
  const filteredAndSortedFiles = files
    .filter((file) => {
      // 根据标签页过滤
      if (activeTab === "all") {
        return file.status === "active"
      } else if (activeTab === "archived") {
        return file.status === "archived"
      } else if (activeTab === "deleted") {
        return file.status === "deleted"
      }
      return true
    })
    .filter((file) => {
      // 根据搜索查询过滤
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        file.name.toLowerCase().includes(query) ||
        file.description?.toLowerCase().includes(query) ||
        file.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
    .filter((file) => {
      // 根据分类过滤
      if (!selectedCategory) return true
      return file.category === selectedCategory
    })
    .sort((a, b) => {
      // 排序
      if (sortBy === "name") {
        return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortBy === "date") {
        return sortDirection === "asc"
          ? a.uploadedAt.getTime() - b.uploadedAt.getTime()
          : b.uploadedAt.getTime() - a.uploadedAt.getTime()
      } else if (sortBy === "size") {
        return sortDirection === "asc" ? a.size - b.size : b.size - a.size
      }
      return 0
    })

  // 获取所有分类
  const categories = Array.from(new Set(files.map((file) => file.category).filter(Boolean) as string[]))

  // 切换文件选择
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredAndSortedFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredAndSortedFiles.map((file) => file.id))
    }
  }

  // 删除选中文件
  const deleteSelectedFiles = () => {
    setFiles((prev) => prev.map((file) => (selectedFiles.includes(file.id) ? { ...file, status: "deleted" } : file)))
    setSelectedFiles([])
  }

  // 归档选中文件
  const archiveSelectedFiles = () => {
    setFiles((prev) => prev.map((file) => (selectedFiles.includes(file.id) ? { ...file, status: "archived" } : file)))
    setSelectedFiles([])
  }

  // 恢复选中文件
  const restoreSelectedFiles = () => {
    setFiles((prev) => prev.map((file) => (selectedFiles.includes(file.id) ? { ...file, status: "active" } : file)))
    setSelectedFiles([])
  }

  // 打开文件预览
  const openFilePreview = (file: FileItem) => {
    const index = filteredAndSortedFiles.findIndex((f) => f.id === file.id)
    setCurrentPreviewIndex(index)
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }

  // 关闭文件预览
  const closeFilePreview = () => {
    setIsPreviewOpen(false)
    setPreviewFile(null)
    setCurrentPreviewIndex(-1)
  }

  // 预览下一个文件
  const previewNextFile = () => {
    if (currentPreviewIndex < filteredAndSortedFiles.length - 1) {
      const nextIndex = currentPreviewIndex + 1
      setCurrentPreviewIndex(nextIndex)
      setPreviewFile(filteredAndSortedFiles[nextIndex])
    }
  }

  // 预览上一个文件
  const previewPreviousFile = () => {
    if (currentPreviewIndex > 0) {
      const prevIndex = currentPreviewIndex - 1
      setCurrentPreviewIndex(prevIndex)
      setPreviewFile(filteredAndSortedFiles[prevIndex])
    }
  }

  // 打开批量操作对话框
  const openBatchOperations = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "请先选择文件",
        description: "您需要先选择至少一个文件才能执行批量操作",
        variant: "destructive",
      })
      return
    }
    setIsBatchOperationOpen(true)
  }

  // 打开任务管理器
  const openTaskManager = () => {
    setIsTaskManagerOpen(true)
  }

  // 打开AI助手
  const openAIAssistant = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "请先选择文件",
        description: "您需要先选择至少一个文件才能使用AI助手",
        variant: "destructive",
      })
      return
    }
    setIsAIAssistantOpen(true)
  }

  // 处理批量操作完成
  const handleBatchOperationComplete = (result: any, updatedFiles: FileItem[]) => {
    // 更新文件列表
    setFiles((prev) => {
      const newFiles = [...prev]
      updatedFiles.forEach((updatedFile) => {
        const index = newFiles.findIndex((f) => f.id === updatedFile.id)
        if (index !== -1) {
          newFiles[index] = updatedFile
        }
      })
      return newFiles
    })

    // 显示操作结果通知
    toast({
      title: result.success ? "操作成功" : "操作失败",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })

    // 关闭批量操作对话框
    setIsBatchOperationOpen(false)
  }

  // 处理AI助手更改
  const handleAIAssistantChanges = (updatedFiles: FileItem[]) => {
    // 更新文件列表
    setFiles((prev) => {
      const newFiles = [...prev]
      updatedFiles.forEach((updatedFile) => {
        const index = newFiles.findIndex((f) => f.id === updatedFile.id)
        if (index !== -1) {
          newFiles[index] = updatedFile
        }
      })
      return newFiles
    })
  }

  // 获取选中的文件对象
  const getSelectedFileObjects = (): FileItem[] => {
    return files.filter((file) => selectedFiles.includes(file.id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">文件管理</h2>
          <p className="text-muted-foreground">上传、管理和分享API相关文件</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={openTaskManager}>
            <History className="h-4 w-4 mr-2" />
            任务历史
          </Button>
          <Button variant="outline" size="sm" onClick={openAIAssistant}>
            <BrainIcon className="h-4 w-4 mr-2" />
            AI助手
          </Button>
          <Button variant="outline" size="sm" onClick={loadFiles} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-4 w-4 mr-2" />
            上传文件
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧边栏 */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">分类</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" onClick={() => setSelectedCategory(null)}>
                  <File className="h-4 w-4 mr-2" />
                  所有文件
                  <Badge className="ml-auto">{files.filter((f) => f.status === "active").length}</Badge>
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    className={`w-full justify-start ${selectedCategory === category ? "bg-muted" : ""}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    {category}
                    <Badge className="ml-auto">
                      {files.filter((f) => f.category === category && f.status === "active").length}
                    </Badge>
                  </Button>
                ))}
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  添加新分类
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">筛选</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>文件类型</Label>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-image" />
                      <Label htmlFor="filter-image" className="text-sm">
                        图片
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-document" />
                      <Label htmlFor="filter-document" className="text-sm">
                        文档
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-code" />
                      <Label htmlFor="filter-code" className="text-sm">
                        代码
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-archive" />
                      <Label htmlFor="filter-archive" className="text-sm">
                        压缩包
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>上传日期</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="选择时间范围" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有时间</SelectItem>
                      <SelectItem value="today">今天</SelectItem>
                      <SelectItem value="week">本周</SelectItem>
                      <SelectItem value="month">本月</SelectItem>
                      <SelectItem value="year">今年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  应用筛选
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧内容区 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">所有文件</TabsTrigger>
                    <TabsTrigger value="archived">已归档</TabsTrigger>
                    <TabsTrigger value="deleted">已删除</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索文件..."
                      className="pl-8 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-muted" : ""}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-muted" : ""}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "date" | "size")}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">名称</SelectItem>
                      <SelectItem value="date">日期</SelectItem>
                      <SelectItem value="size">大小</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  >
                    {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 上传进度条 */}
              {isUploading && (
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">正在上传文件...</span>
                    <span className="text-sm">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* 拖放上传区域 */}
              <div
                className="border-2 border-dashed rounded-lg p-8 mb-4 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">拖放文件到此处上传</h3>
                <p className="text-sm text-muted-foreground mb-2">或点击选择文件</p>
                <p className="text-xs text-muted-foreground">支持的文件类型：PDF, DOCX, XLSX, JPG, PNG, ZIP等</p>
              </div>

              {/* 批量操作工具栏 */}
              {selectedFiles.length > 0 && (
                <div className="flex justify-between items-center mb-4 p-2 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedFiles.length === filteredAndSortedFiles.length}
                      onCheckedChange={toggleSelectAll}
                      className="mr-2"
                    />
                    <span className="text-sm">已选择 {selectedFiles.length} 个文件</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
                      <X className="h-4 w-4 mr-1" />
                      取消
                    </Button>
                    <Button variant="outline" size="sm" onClick={openBatchOperations}>
                      <Settings className="h-4 w-4 mr-1" />
                      批量操作
                    </Button>
                    <Button variant="outline" size="sm" onClick={openAIAssistant}>
                      <BrainIcon className="h-4 w-4 mr-1" />
                      AI分析
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.alert("下载功能尚未实现")}>
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                    {activeTab === "all" && (
                      <Button variant="outline" size="sm" onClick={archiveSelectedFiles}>
                        <FileArchive className="h-4 w-4 mr-1" />
                        归档
                      </Button>
                    )}
                    {activeTab === "archived" && (
                      <Button variant="outline" size="sm" onClick={restoreSelectedFiles}>
                        <Check className="h-4 w-4 mr-1" />
                        恢复
                      </Button>
                    )}
                    {activeTab === "deleted" && (
                      <Button variant="outline" size="sm" onClick={restoreSelectedFiles}>
                        <Check className="h-4 w-4 mr-1" />
                        恢复
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={deleteSelectedFiles}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              )}

              {/* 文件列表 */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredAndSortedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <File className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>没有找到文件</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="h-4 w-4 mr-2" />
                    上传文件
                  </Button>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-4 py-2 px-4 text-sm font-medium text-muted-foreground">
                    <div className="col-span-6">文件名</div>
                    <div className="col-span-2">大小</div>
                    <div className="col-span-2">上传日期</div>
                    <div className="col-span-2">操作</div>
                  </div>
                  {filteredAndSortedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="grid grid-cols-12 gap-4 py-2 px-4 rounded-lg hover:bg-muted items-center"
                    >
                      <div className="col-span-6 flex items-center">
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          className="mr-2"
                        />
                        {getFileTypeIcon(file.type)}
                        <div className="ml-2 truncate">
                          <div className="font-medium truncate">{file.name}</div>
                          {file.description && (
                            <div className="text-xs text-muted-foreground truncate">{file.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">{formatFileSize(file.size)}</div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {file.uploadedAt.toLocaleDateString()}
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openFilePreview(file)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAndSortedFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <div className="absolute top-2 left-2">
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={() => toggleFileSelection(file.id)}
                          />
                        </div>
                        {file.type === "image" && file.thumbnailUrl ? (
                          <div
                            className="h-32 bg-muted flex items-center justify-center cursor-pointer"
                            onClick={() => openFilePreview(file)}
                          >
                            <img
                              src={file.thumbnailUrl || "/placeholder.svg"}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="h-32 bg-muted flex items-center justify-center cursor-pointer"
                            onClick={() => openFilePreview(file)}
                          >
                            {getFileTypeIcon(file.type)}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div
                          className="font-medium truncate cursor-pointer hover:text-primary"
                          onClick={() => openFilePreview(file)}
                        >
                          {file.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{file.uploadedAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex space-x-1">
                            {file.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {file.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{file.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 文件预览对话框 */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          isOpen={isPreviewOpen}
          onClose={closeFilePreview}
          onNext={previewNextFile}
          onPrevious={previewPreviousFile}
          hasNext={currentPreviewIndex < filteredAndSortedFiles.length - 1}
          hasPrevious={currentPreviewIndex > 0}
        />
      )}

      {/* 批量文件操作对话框 */}
      <BatchFileOperations
        isOpen={isBatchOperationOpen}
        onClose={() => setIsBatchOperationOpen(false)}
        selectedFiles={getSelectedFileObjects()}
        onOperationComplete={handleBatchOperationComplete}
      />

      {/* 批处理任务管理器 */}
      <BatchTaskManager isOpen={isTaskManagerOpen} onClose={() => setIsTaskManagerOpen(false)} />

      {/* AI文件助手 */}
      <AIFileAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        selectedFiles={getSelectedFileObjects()}
        onApplyChanges={handleAIAssistantChanges}
      />
    </div>
  )
}
