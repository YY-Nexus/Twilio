"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle,
  File,
  FileText,
  ImageIcon,
  Loader2,
  UploadCloud,
  X,
  Trash2,
  Download,
  Copy,
  Eye,
} from "lucide-react"

// 文件类型
type FileType = "image" | "document" | "spreadsheet" | "archive" | "code" | "other"

// 上传文件接口
interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  fileType: FileType
  url: string
  uploadedAt: Date
  status: "uploading" | "success" | "error"
  progress: number
  error?: string
}

// 获取文件类型
const getFileType = (mimeType: string): FileType => {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType === "application/pdf" || mimeType.includes("document") || mimeType.includes("text/plain"))
    return "document"
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "spreadsheet"
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar") || mimeType.includes("gzip"))
    return "archive"
  if (
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("json") ||
    mimeType.includes("html") ||
    mimeType.includes("css") ||
    mimeType.includes("xml")
  )
    return "code"
  return "other"
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// 获取文件图标
const getFileIcon = (fileType: FileType) => {
  switch (fileType) {
    case "image":
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    case "document":
      return <FileText className="h-6 w-6 text-green-500" />
    case "spreadsheet":
      return <FileText className="h-6 w-6 text-green-500" />
    case "archive":
      return <File className="h-6 w-6 text-yellow-500" />
    case "code":
      return <File className="h-6 w-6 text-purple-500" />
    default:
      return <File className="h-6 w-6 text-gray-500" />
  }
}

export function FileUploader({
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = "*",
  onFilesUploaded,
}: {
  maxFiles?: number
  maxFileSize?: number
  acceptedFileTypes?: string
  onFilesUploaded?: (files: UploadedFile[]) => void
}) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    processFiles(selectedFiles)
  }

  // 处理拖放
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // 处理拖放释放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = e.dataTransfer.files
    if (!droppedFiles || droppedFiles.length === 0) return

    processFiles(droppedFiles)
  }

  // 处理文件上传
  const processFiles = (fileList: FileList) => {
    // 检查文件数量限制
    if (files.length + fileList.length > maxFiles) {
      setError(`最多只能上传 ${maxFiles} 个文件`)
      return
    }

    // 处理每个文件
    const newFiles: UploadedFile[] = []
    Array.from(fileList).forEach((file) => {
      // 检查文件大小
      if (file.size > maxFileSize) {
        setError(`文件 "${file.name}" 超过最大大小限制 (${formatFileSize(maxFileSize)})`)
        return
      }

      // 创建新的上传文件对象
      const newFile: UploadedFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        fileType: getFileType(file.type),
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        status: "uploading",
        progress: 0,
      }

      newFiles.push(newFile)

      // 模拟上传进度
      simulateFileUpload(newFile)
    })

    // 更新文件列表
    setFiles((prevFiles) => [...prevFiles, ...newFiles])

    // 切换到文件列表标签
    if (newFiles.length > 0) {
      setActiveTab("files")
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 模拟文件上传进度
  const simulateFileUpload = (file: UploadedFile) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        // 更新文件状态为成功
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "success",
                  progress: 100,
                }
              : f,
          ),
        )

        // 触发回调
        if (onFilesUploaded) {
          onFilesUploaded(
            files.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    status: "success",
                    progress: 100,
                  }
                : f,
            ),
          )
        }
      } else {
        // 更新上传进度
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  progress,
                }
              : f,
          ),
        )
      }
    }, 200)
  }

  // 删除文件
  const deleteFile = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))
  }

  // 清除所有文件
  const clearAllFiles = () => {
    setFiles([])
  }

  // 下载文件
  const downloadFile = (file: UploadedFile) => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 复制文件链接
  const copyFileLink = (file: UploadedFile) => {
    navigator.clipboard.writeText(file.url)
  }

  // 预览文件
  const previewFile = (file: UploadedFile) => {
    window.open(file.url, "_blank")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>文件上传</CardTitle>
        <CardDescription>上传文件用于API测试或作为示例文件</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upload">上传</TabsTrigger>
            <TabsTrigger value="files" disabled={files.length === 0}>
              文件列表 {files.length > 0 && `(${files.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>错误</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <UploadCloud className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">拖放文件到此处</h3>
                    <p className="text-sm text-muted-foreground">
                      或点击下方按钮选择文件，最大 {formatFileSize(maxFileSize)}
                    </p>
                  </div>
                  <div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={acceptedFileTypes}
                      className="hidden"
                      onChange={handleFileChange}
                      onClick={() => setError(null)}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2">
                      选择文件
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>支持的文件类型：图片、文档、电子表格、压缩包、代码文件等</p>
                <p>
                  最多可上传 {maxFiles} 个文件，每个文件不超过 {formatFileSize(maxFileSize)}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">已上传文件 ({files.length})</h3>
                <Button variant="outline" size="sm" onClick={clearAllFiles}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  清除全部
                </Button>
              </div>

              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(file.fileType)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>
                            {file.uploadedAt.toLocaleString("zh-CN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {file.status === "uploading" ? (
                        <div className="flex items-center space-x-2 w-40">
                          <Progress value={file.progress} className="h-2" />
                          <span className="text-sm">{file.progress}%</span>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : file.status === "success" ? (
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            已上传
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => previewFile(file)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => downloadFile(file)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => copyFileLink(file)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteFile(file.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            失败
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => deleteFile(file.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTab("upload")
                    setError(null)
                  }}
                >
                  <UploadCloud className="h-4 w-4 mr-2" />
                  上传更多文件
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {files.length > 0
            ? `已上传 ${files.filter((f) => f.status === "success").length}/${files.length} 个文件`
            : "暂无上传文件"}
        </div>
      </CardFooter>
    </Card>
  )
}
