"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Share2,
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  File,
} from "lucide-react"

// 文件类型
type FileType = "image" | "document" | "code" | "archive" | "other"

// 文件接口
interface FileItem {
  id: string
  name: string
  type: FileType
  size: number
  uploadedAt: Date
  uploadedBy: string
  status: "active" | "archived" | "deleted"
  description?: string
  tags: string[]
  url: string
  thumbnailUrl?: string
  category?: string
  content?: string
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

// 获取文件扩展名
const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || ""
}

interface FilePreviewProps {
  file: FileItem
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export function FilePreview({
  file,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "info">("preview")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setActiveTab("preview")
      setZoomLevel(1)
      setRotation(0)
    }
  }, [isOpen, file])

  // 放大
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  // 缩小
  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  // 旋转
  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // 渲染文件预览内容
  const renderPreviewContent = () => {
    const extension = getFileExtension(file.name)

    // 图片预览
    if (file.type === "image") {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative overflow-auto max-h-[60vh] flex items-center justify-center">
            <img
              src={file.url || file.thumbnailUrl || "/placeholder.svg"}
              alt={file.name}
              className="max-w-full transition-transform"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            />
          </div>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button variant="outline" size="sm" onClick={zoomOut} disabled={zoomLevel <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn} disabled={zoomLevel >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={rotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    // PDF预览
    if (extension === "pdf") {
      return (
        <div className="h-[60vh] w-full">
          <iframe src={file.url} className="w-full h-full" title={file.name} />
        </div>
      )
    }

    // 代码预览
    if (file.type === "code" && file.content) {
      return (
        <div className="h-[60vh] w-full overflow-auto">
          <pre className="p-4 bg-muted rounded-md text-sm">{file.content}</pre>
        </div>
      )
    }

    // 视频预览
    if (extension === "mp4" || extension === "webm" || extension === "ogg") {
      return (
        <div className="h-[60vh] w-full flex items-center justify-center">
          <video controls className="max-h-full max-w-full">
            <source src={file.url} type={`video/${extension}`} />
            您的浏览器不支持视频标签。
          </video>
        </div>
      )
    }

    // 音频预览
    if (extension === "mp3" || extension === "wav" || extension === "ogg") {
      return (
        <div className="h-[60vh] w-full flex items-center justify-center">
          <audio controls>
            <source src={file.url} type={`audio/${extension}`} />
            您的浏览器不支持音频标签。
          </audio>
        </div>
      )
    }

    // 默认预览（不支持的文件类型）
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center">
        {getFileTypeIcon(file.type)}
        <p className="mt-4 text-lg font-medium">{file.name}</p>
        <p className="text-muted-foreground">无法预览此文件类型</p>
        <Button variant="outline" className="mt-4">
          <Download className="h-4 w-4 mr-2" />
          下载文件
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {getFileTypeIcon(file.type)}
            <DialogTitle className="truncate max-w-[500px]">{file.name}</DialogTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => window.alert("分享功能尚未实现")}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.alert("下载功能尚未实现")}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "preview" | "info")} className="flex-1">
          <TabsList>
            <TabsTrigger value="preview">预览</TabsTrigger>
            <TabsTrigger value="info">文件信息</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-auto">
            {renderPreviewContent()}
          </TabsContent>

          <TabsContent value="info" className="flex-1 overflow-auto">
            <div className="space-y-4 p-4">
              <div>
                <h3 className="text-lg font-medium">基本信息</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm text-muted-foreground">文件名</div>
                  <div className="text-sm">{file.name}</div>
                  <div className="text-sm text-muted-foreground">文件大小</div>
                  <div className="text-sm">{formatFileSize(file.size)}</div>
                  <div className="text-sm text-muted-foreground">上传日期</div>
                  <div className="text-sm">{file.uploadedAt.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">上传者</div>
                  <div className="text-sm">{file.uploadedBy}</div>
                  <div className="text-sm text-muted-foreground">分类</div>
                  <div className="text-sm">{file.category || "未分类"}</div>
                </div>
              </div>

              {file.description && (
                <div>
                  <h3 className="text-lg font-medium">描述</h3>
                  <p className="text-sm mt-2">{file.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium">标签</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {file.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  {file.tags.length === 0 && <span className="text-sm text-muted-foreground">无标签</span>}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onPrevious} disabled={!hasPrevious}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一个
            </Button>
            <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
              下一个
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {file.type === "image" && "使用鼠标滚轮可以放大/缩小图片"}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
