"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  FileIcon,
  FileTextIcon,
  FileImageIcon,
  FileArchiveIcon,
  FileCodeIcon,
  TypeIcon,
  HashIcon,
  CalendarIcon,
  CodeIcon,
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

// 操作类型
type OperationType = "rename" | "convert" | "process-image" | "tags" | "category"

// 重命名操作类型
type RenameOperationType = "prefix" | "suffix" | "replace" | "case" | "extension" | "regex" | "sequence" | "date"

// 格式转换类型
type ConversionType = "image" | "document" | "compress" | "extract" | "audio" | "video" | "code"

// 图片处理类型
type ImageProcessType = "resize" | "crop" | "watermark" | "filter" | "compress"

// 批量操作结果
interface OperationResult {
  success: boolean
  message: string
  affectedFiles: number
  failedFiles: number
  details?: string
  taskId?: string
}

// 获取文件扩展名
const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || ""
}

// 获取文件名（不含扩展名）
const getFileNameWithoutExtension = (fileName: string): string => {
  const extension = getFileExtension(fileName)
  if (!extension) return fileName
  return fileName.slice(0, -(extension.length + 1))
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
      return <FileImageIcon className="h-5 w-5 text-blue-500" />
    case "document":
      return <FileTextIcon className="h-5 w-5 text-green-500" />
    case "code":
      return <FileCodeIcon className="h-5 w-5 text-purple-500" />
    case "archive":
      return <FileArchiveIcon className="h-5 w-5 text-yellow-500" />
    default:
      return <FileIcon className="h-5 w-5 text-gray-500" />
  }
}

// 支持的图片格式
const supportedImageFormats = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "ico", "heic", "avif"]

// 支持的文档格式
const supportedDocumentFormats = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "rtf",
  "md",
  "html",
  "odt",
  "xls",
  "xlsx",
  "csv",
  "ppt",
  "pptx",
]

// 支持的压缩格式
const supportedArchiveFormats = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"]

// 支持的音频格式
const supportedAudioFormats = ["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma"]

// 支持的视频格式
const supportedVideoFormats = ["mp4", "avi", "mov", "wmv", "mkv", "webm", "flv", "m4v"]

// 支持的代码格式
const supportedCodeFormats = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "html",
  "css",
  "json",
  "xml",
  "yaml",
  "yml",
  "md",
  "py",
  "java",
  "c",
  "cpp",
  "cs",
  "go",
  "php",
  "rb",
]

interface BatchFileOperationsProps {
  isOpen: boolean
  onClose: () => void
  selectedFiles: FileItem[]
  onOperationComplete: (result: OperationResult, updatedFiles: FileItem[]) => void
}

// 确保使用默认导出
export function BatchFileOperations({ isOpen, onClose, selectedFiles, onOperationComplete }: BatchFileOperationsProps) {
  const [activeTab, setActiveTab] = useState<OperationType>("rename")
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<OperationResult | null>(null)
  const [previewFiles, setPreviewFiles] = useState<FileItem[]>([])
  const [taskId, setTaskId] = useState<string | null>(null)
  const taskCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // 重命名选项
  const [renameType, setRenameType] = useState<RenameOperationType>("prefix")
  const [prefixText, setPrefixText] = useState("")
  const [suffixText, setSuffixText] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [replaceWithText, setReplaceWithText] = useState("")
  const [caseOption, setCaseOption] = useState<"upper" | "lower" | "title">("lower")
  const [newExtension, setNewExtension] = useState("")
  const [regexPattern, setRegexPattern] = useState("")
  const [regexReplacement, setRegexReplacement] = useState("")
  const [sequenceStart, setSequenceStart] = useState(1)
  const [sequencePadding, setSequencePadding] = useState(3)
  const [sequencePrefix, setSequencePrefix] = useState("")
  const [dateFormat, setDateFormat] = useState("yyyy-MM-dd")
  const [useFileDate, setUseFileDate] = useState(true)

  // 格式转换选项
  const [conversionType, setConversionType] = useState<ConversionType>("image")
  const [targetFormat, setTargetFormat] = useState("")
  const [compressionLevel, setCompressionLevel] = useState<"low" | "medium" | "high">("medium")
  const [maintainStructure, setMaintainStructure] = useState(true)
  const [convertOptions, setConvertOptions] = useState<Record<string, any>>({})

  // 图片处理选项
  const [imageProcessType, setImageProcessType] = useState<ImageProcessType>("resize")
  const [resizeWidth, setResizeWidth] = useState(800)
  const [resizeHeight, setResizeHeight] = useState(600)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropWidth, setCropWidth] = useState(400)
  const [cropHeight, setCropHeight] = useState(300)
  const [watermarkText, setWatermarkText] = useState("")
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null)
  const [watermarkOpacity, setWatermarkOpacity] = useState(50)
  const [watermarkPosition, setWatermarkPosition] = useState<
    "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  >("bottom-right")
  const [imageFilter, setImageFilter] = useState<
    "none" | "grayscale" | "sepia" | "blur" | "sharpen" | "brightness" | "contrast"
  >("none")
  const [filterIntensity, setFilterIntensity] = useState(50)
  const [imageQuality, setImageQuality] = useState(80)

  // 标签选项
  const [tagOperation, setTagOperation] = useState<"add" | "remove" | "replace">("add")
  const [tagsToAdd, setTagsToAdd] = useState("")
  const [tagsToRemove, setTagsToRemove] = useState("")
  const [tagsToReplace, setTagsToReplace] = useState("")
  const [useAiTags, setUseAiTags] = useState(false)

  // 分类选项
  const [newCategory, setNewCategory] = useState("")
  const [useAiCategory, setUseAiCategory] = useState(false)

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setProcessing(false)
      setProgress(0)
      setResult(null)
      setTaskId(null)
      updatePreview()
    }

    return () => {
      if (taskCheckInterval.current) {
        clearInterval(taskCheckInterval.current)
      }
    }
  }, [isOpen, activeTab, selectedFiles])

  // 更新预览
  const updatePreview = () => {
    let updatedFiles: FileItem[] = []

    switch (activeTab) {
      case "rename":
        updatedFiles = previewRename()
        break
      case "convert":
        updatedFiles = previewConvert()
        break
      case "tags":
        updatedFiles = previewTags()
        break
      case "category":
        updatedFiles = previewCategory()
        break
      case "process-image":
        updatedFiles = previewImageProcess()
        break
    }

    setPreviewFiles(updatedFiles)
  }

  // 预览重命名结果
  const previewRename = (): FileItem[] => {
    return selectedFiles.map((file) => {
      const fileName = getFileNameWithoutExtension(file.name)
      const extension = getFileExtension(file.name)
      let newName = fileName

      switch (renameType) {
        case "prefix":
          newName = `${prefixText}${fileName}`
          break
        case "suffix":
          newName = `${fileName}${suffixText}`
          break
        case "replace":
          newName = fileName.replace(new RegExp(replaceText, "g"), replaceWithText)
          break
        case "case":
          if (caseOption === "upper") {
            newName = fileName.toUpperCase()
          } else if (caseOption === "lower") {
            newName = fileName.toLowerCase()
          } else if (caseOption === "title") {
            newName = fileName
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(" ")
          }
          break
        case "extension":
          return {
            ...file,
            name: `${fileName}.${newExtension || extension}`,
          }
        case "regex":
          try {
            const regex = new RegExp(regexPattern, "g")
            newName = fileName.replace(regex, regexReplacement)
          } catch (error) {
            // 如果正则表达式无效，保持原名
            console.error("Invalid regex:", error)
          }
          break
        case "sequence":
          const index = selectedFiles.indexOf(file)
          const sequence = (sequenceStart + index).toString().padStart(sequencePadding, "0")
          newName = `${sequencePrefix}${sequence}`
          break
        case "date":
          let dateStr = ""
          if (useFileDate) {
            // 使用文件日期
            dateStr = formatDate(file.uploadedAt, dateFormat)
          } else {
            // 使用当前日期
            dateStr = formatDate(new Date(), dateFormat)
          }
          newName = `${fileName}_${dateStr}`
          break
      }

      return {
        ...file,
        name: `${newName}.${extension}`,
      }
    })
  }

  // 格式化日期
  const formatDate = (date: Date, format: string): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")

    return format
      .replace("yyyy", year.toString())
      .replace("MM", month)
      .replace("dd", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds)
  }

  // 预览格式转换结果
  const previewConvert = (): FileItem[] => {
    return selectedFiles.map((file) => {
      const fileName = getFileNameWithoutExtension(file.name)

      // 只有当选择了目标格式并且文件类型匹配时才进行转换
      if (!targetFormat) return file

      // 检查文件类型是否匹配转换类型
      const extension = getFileExtension(file.name)
      let canConvert = false

      switch (conversionType) {
        case "image":
          canConvert = supportedImageFormats.includes(extension)
          break
        case "document":
          canConvert = supportedDocumentFormats.includes(extension)
          break
        case "audio":
          canConvert = supportedAudioFormats.includes(extension)
          break
        case "video":
          canConvert = supportedVideoFormats.includes(extension)
          break
        case "code":
          canConvert = supportedCodeFormats.includes(extension)
          break
        case "compress":
          // 任何文件都可以压缩
          canConvert = true
          break
        case "extract":
          canConvert = supportedArchiveFormats.includes(extension)
          break
      }

      if (!canConvert) return file

      // 对于解压缩，我们不改变文件名
      if (conversionType === "extract") return file

      return {
        ...file,
        name: `${fileName}.${targetFormat}`,
      }
    })
  }

  // 预览图片处理结果
  const previewImageProcess = (): FileItem[] => {
    // 只处理图片文件
    return selectedFiles.map((file) => {
      const extension = getFileExtension(file.name)
      if (!supportedImageFormats.includes(extension)) return file

      // 图片处理不会改变文件名，但会在预览中显示处理效果
      return file
    })
  }

  // 预览标签更改结果
  const previewTags = (): FileItem[] => {
    return selectedFiles.map((file) => {
      let newTags = [...file.tags]

      switch (tagOperation) {
        case "add":
          {
            const tagsArray = tagsToAdd
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
            // 添加不存在的标签
            tagsArray.forEach((tag) => {
              if (!newTags.includes(tag)) {
                newTags.push(tag)
              }
            })
          }
          break
        case "remove":
          {
            const tagsArray = tagsToRemove
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
            // 移除指定的标签
            newTags = newTags.filter((tag) => !tagsArray.includes(tag))
          }
          break
        case "replace":
          {
            const tagsArray = tagsToReplace
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
            // 替换所有标签
            newTags = tagsArray
          }
          break
      }

      return {
        ...file,
        tags: newTags,
      }
    })
  }

  // 预览分类更改结果
  const previewCategory = (): FileItem[] => {
    return selectedFiles.map((file) => {
      let category = newCategory

      // 如果启用了AI分类，根据文件类型生成分类
      if (useAiCategory) {
        // 这里只是模拟，实际应用中应该调用AI服务
        if (file.type === "image") {
          category = "AI分类:图像"
        } else if (file.type === "document") {
          category = "AI分类:文档"
        } else if (file.type === "code") {
          category = "AI分类:代码"
        } else if (file.type === "archive") {
          category = "AI分类:压缩文件"
        } else {
          category = "AI分类:其他"
        }
      }

      return {
        ...file,
        category,
      }
    })
  }

  // 执行批量操作
  const executeOperation = async () => {
    setProcessing(true)
    setProgress(0)

    // 准备操作参数
    const operationParams: Record<string, any> = {}

    switch (activeTab) {
      case "rename":
        operationParams.renameType = renameType
        operationParams.prefixText = prefixText
        operationParams.suffixText = suffixText
        operationParams.replaceText = replaceText
        operationParams.replaceWithText = replaceWithText
        operationParams.caseOption = caseOption
        operationParams.newExtension = newExtension
        operationParams.regexPattern = regexPattern
        operationParams.regexReplacement = regexReplacement
        operationParams.sequenceStart = sequenceStart
        operationParams.sequencePadding = sequencePadding
        operationParams.sequencePrefix = sequencePrefix
        operationParams.dateFormat = dateFormat
        operationParams.useFileDate = useFileDate
        break
      case "convert":
        operationParams.conversionType = conversionType
        operationParams.targetFormat = targetFormat
        operationParams.compressionLevel = compressionLevel
        operationParams.maintainStructure = maintainStructure
        operationParams.convertOptions = convertOptions
        break
      case "process-image":
        operationParams.imageProcessType = imageProcessType
        operationParams.resizeWidth = resizeWidth
        operationParams.resizeHeight = resizeHeight
        operationParams.maintainAspectRatio = maintainAspectRatio
        operationParams.cropX = cropX
        operationParams.cropY = cropY
        operationParams.cropWidth = cropWidth
        operationParams.cropHeight = cropHeight
        operationParams.watermarkText = watermarkText
        operationParams.watermarkPosition = watermarkPosition
        operationParams.watermarkOpacity = watermarkOpacity
        operationParams.imageFilter = imageFilter
        operationParams.filterIntensity = filterIntensity
        operationParams.imageQuality = imageQuality
        break
      case "tags":
        operationParams.tagOperation = tagOperation
        operationParams.tagsToAdd = tagsToAdd
        operationParams.tagsToRemove = tagsToRemove
        operationParams.tagsToReplace = tagsToReplace
        operationParams.useAiTags = useAiTags
        break
      case "category":
        operationParams.newCategory = newCategory
        operationParams.useAiCategory = useAiCategory
        break
    }

    try {
      // 调用API创建任务
      const response = await fetch("/api/file-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: activeTab,
          params: operationParams,
          fileIds: selectedFiles.map((file) => file.id),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      const data = await response.json()
      setTaskId(data.taskId)

      // 开始轮询任务状态
      // if (taskCheckInterval.current) {
      //   clearInterval(taskCheckInterval.current)
      // }

      // taskCheckInterval.current = setInterval(async () => {
      //   await checkTaskStatus(data.taskId)
      // }, 1000)

      setProcessing(false)
      setResult({
        success: true,
        message: "模拟操作成功",
        affectedFiles: selectedFiles.length,
        failedFiles: 0,
      })
      onOperationComplete(
        {
          success: true,
          message: "模拟操作成功",
          affectedFiles: selectedFiles.length,
          failedFiles: 0,
        },
        previewFiles,
      )
    } catch (error) {
      console.error("Error creating task:", error)
      setProcessing(false)
      setResult({
        success: false,
        message: "创建任务失败",
        affectedFiles: 0,
        failedFiles: selectedFiles.length,
        details: "服务器错误，请稍后重试",
      })
    }
  }

  // 检查任务状态
  const checkTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/file-operations?taskId=${taskId}`)
      if (!response.ok) {
        throw new Error("Failed to check task status")
      }

      const data = await response.json()
      const task = data.task

      // 更新进度
      setProgress(task.progress)

      // 如果任务完成或失败
      if (task.status === "completed" || task.status === "failed") {
        if (taskCheckInterval.current) {
          clearInterval(taskCheckInterval.current)
        }

        setProcessing(false)
        setResult({
          success: task.result.success,
          message: task.result.message,
          affectedFiles: task.result.affectedFiles,
          failedFiles: task.result.failedFiles,
          details: task.result.details,
          taskId: task.id,
        })

        // 通知父组件操作完成
        onOperationComplete(
          {
            success: task.result.success,
            message: task.result.message,
            affectedFiles: task.result.affectedFiles,
            failedFiles: task.result.failedFiles,
            details: task.result.details,
            taskId: task.id,
          },
          previewFiles,
        )
      }
    } catch (error) {
      console.error("Error checking task status:", error)
      if (taskCheckInterval.current) {
        clearInterval(taskCheckInterval.current)
      }
      setProcessing(false)
      setResult({
        success: false,
        message: "检查任务状态失败",
        affectedFiles: 0,
        failedFiles: selectedFiles.length,
        details: "服务器错误，请稍后重试",
      })
    }
  }

  // 重置表单
  const resetForm = () => {
    setRenameType("prefix")
    setPrefixText("")
    setSuffixText("")
    setReplaceText("")
    setReplaceWithText("")
    setCaseOption("lower")
    setNewExtension("")
    setRegexPattern("")
    setRegexReplacement("")
    setSequenceStart(1)
    setSequencePadding(3)
    setSequencePrefix("")
    setDateFormat("yyyy-MM-dd")
    setUseFileDate(true)

    setConversionType("image")
    setTargetFormat("")
    setCompressionLevel("medium")
    setMaintainStructure(true)
    setConvertOptions({})

    setImageProcessType("resize")
    setResizeWidth(800)
    setResizeHeight(600)
    setMaintainAspectRatio(true)
    setCropX(0)
    setCropY(0)
    setCropWidth(400)
    setCropHeight(300)
    setWatermarkText("")
    setWatermarkImage(null)
    setWatermarkOpacity(50)
    setWatermarkPosition("bottom-right")
    setImageFilter("none")
    setFilterIntensity(50)
    setImageQuality(80)

    setTagOperation("add")
    setTagsToAdd("")
    setTagsToRemove("")
    setTagsToReplace("")
    setUseAiTags(false)

    setNewCategory("")
    setUseAiCategory(false)

    setResult(null)
  }

  // 关闭对话框
  const handleClose = () => {
    if (taskCheckInterval.current) {
      clearInterval(taskCheckInterval.current)
    }
    resetForm()
    onClose()
  }

  // 更新预览
  useEffect(() => {
    updatePreview()
  }, [
    renameType,
    prefixText,
    suffixText,
    replaceText,
    replaceWithText,
    caseOption,
    newExtension,
    regexPattern,
    regexReplacement,
    sequenceStart,
    sequencePadding,
    sequencePrefix,
    dateFormat,
    useFileDate,
    conversionType,
    targetFormat,
    imageProcessType,
    resizeWidth,
    resizeHeight,
    maintainAspectRatio,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    watermarkText,
    watermarkPosition,
    watermarkOpacity,
    imageFilter,
    filterIntensity,
    imageQuality,
    tagOperation,
    tagsToAdd,
    tagsToRemove,
    tagsToReplace,
    useAiTags,
    newCategory,
    useAiCategory,
  ])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量文件操作</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 操作类型选择 */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OperationType)}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="rename">批量重命名</TabsTrigger>
              <TabsTrigger value="convert">格式转换</TabsTrigger>
              <TabsTrigger value="process-image">图片处理</TabsTrigger>
              <TabsTrigger value="tags">标签管理</TabsTrigger>
              <TabsTrigger value="category">分类管理</TabsTrigger>
            </TabsList>

            {/* 批量重命名选项 */}
            <TabsContent value="rename" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>重命名操作</Label>
                    <RadioGroup
                      value={renameType}
                      onValueChange={(value) => setRenameType(value as RenameOperationType)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prefix" id="prefix" />
                        <Label htmlFor="prefix">添加前缀</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="suffix" id="suffix" />
                        <Label htmlFor="suffix">添加后缀</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="replace" id="replace" />
                        <Label htmlFor="replace">替换文本</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="case" id="case" />
                        <Label htmlFor="case">更改大小写</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="extension" id="extension" />
                        <Label htmlFor="extension">更改扩展名</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regex" id="regex" />
                        <Label htmlFor="regex">正则表达式</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sequence" id="sequence" />
                        <Label htmlFor="sequence">序列号</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="date" id="date" />
                        <Label htmlFor="date">添加日期</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {renameType === "prefix" && (
                    <div className="space-y-2">
                      <Label htmlFor="prefix-text">前缀文本</Label>
                      <Input
                        id="prefix-text"
                        value={prefixText}
                        onChange={(e) => setPrefixText(e.target.value)}
                        placeholder="输入要添加的前缀"
                      />
                    </div>
                  )}

                  {renameType === "suffix" && (
                    <div className="space-y-2">
                      <Label htmlFor="suffix-text">后缀文本</Label>
                      <Input
                        id="suffix-text"
                        value={suffixText}
                        onChange={(e) => setSuffixText(e.target.value)}
                        placeholder="输入要添加的后缀"
                      />
                    </div>
                  )}

                  {renameType === "replace" && (
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="replace-text">查找文本</Label>
                        <Input
                          id="replace-text"
                          value={replaceText}
                          onChange={(e) => setReplaceText(e.target.value)}
                          placeholder="输入要替换的文本"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="replace-with-text">替换为</Label>
                        <Input
                          id="replace-with-text"
                          value={replaceWithText}
                          onChange={(e) => setReplaceWithText(e.target.value)}
                          placeholder="输入替换后的文本"
                        />
                      </div>
                    </div>
                  )}

                  {renameType === "case" && (
                    <div className="space-y-2">
                      <Label>大小写选项</Label>
                      <RadioGroup
                        value={caseOption}
                        onValueChange={(value) => setCaseOption(value as "upper" | "lower" | "title")}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upper" id="upper" />
                          <Label htmlFor="upper">全部大写</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lower" id="lower" />
                          <Label htmlFor="lower">全部小写</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="title" id="title" />
                          <Label htmlFor="title">首字母大写</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {renameType === "extension" && (
                    <div className="space-y-2">
                      <Label htmlFor="new-extension">新扩展名</Label>
                      <Input
                        id="new-extension"
                        value={newExtension}
                        onChange={(e) => setNewExtension(e.target.value)}
                        placeholder="输入新的扩展名（不含点号）"
                      />
                    </div>
                  )}

                  {renameType === "regex" && (
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="regex-pattern">正则表达式</Label>
                        <div className="flex items-center">
                          <CodeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            id="regex-pattern"
                            value={regexPattern}
                            onChange={(e) => setRegexPattern(e.target.value)}
                            placeholder="例如: ^(.+)_old$"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">使用JavaScript正则表达式语法</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="regex-replacement">替换为</Label>
                        <Input
                          id="regex-replacement"
                          value={regexReplacement}
                          onChange={(e) => setRegexReplacement(e.target.value)}
                          placeholder="例如: $1_new"
                        />
                        <p className="text-xs text-muted-foreground">可以使用$1, $2等引用捕获组</p>
                      </div>
                    </div>
                  )}

                  {renameType === "sequence" && (
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="sequence-prefix">序列前缀</Label>
                        <div className="flex items-center">
                          <TypeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            id="sequence-prefix"
                            value={sequencePrefix}
                            onChange={(e) => setSequencePrefix(e.target.value)}
                            placeholder="例如: img_"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sequence-start">起始数字</Label>
                        <div className="flex items-center">
                          <HashIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            id="sequence-start"
                            type="number"
                            min={0}
                            value={sequenceStart}
                            onChange={(e) => setSequenceStart(Number.parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sequence-padding">数字位数</Label>
                        <div className="flex items-center">
                          <Input
                            id="sequence-padding"
                            type="number"
                            min={1}
                            max={10}
                            value={sequencePadding}
                            onChange={(e) => setSequencePadding(Number.parseInt(e.target.value) || 3)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">数字将用0填充到指定位数，例如: 001, 002</p>
                      </div>
                    </div>
                  )}

                  {renameType === "date" && (
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="date-format">日期格式</Label>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            id="date-format"
                            value={dateFormat}
                            onChange={(e) => setDateFormat(e.target.value)}
                            placeholder="例如: yyyy-MM-dd"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          格式: yyyy(年), MM(月), dd(日), HH(时), mm(分), ss(秒)
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch id="use-file-date" checked={useFileDate} onCheckedChange={setUseFileDate} />
                        <Label htmlFor="use-file-date">使用文件上传日期</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {useFileDate ? "将使用文件的上传日期" : "将使用当前日期"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>预览（{selectedFiles.length} 个文件）</Label>
                    <div className="border rounded-md p-2 h-[300px] overflow-y-auto">
                      {previewFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 py-1 border-b last:border-0">
                          {getFileTypeIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 格式转换选项 */}
            <TabsContent value="convert" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>转换类型</Label>
                    <RadioGroup
                      value={conversionType}
                      onValueChange={(value) => setConversionType(value as ConversionType)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="image-convert" />
                        <Label htmlFor="image-convert">图片格式转换</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="document" id="document-convert" />
                        <Label htmlFor="document-convert">文档格式转换</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="audio" id="audio-convert" />
                        <Label htmlFor="audio-convert">音频格式转换</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="video-convert" />
                        <Label htmlFor="video-convert">视频格式转换</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="code" id="code-convert" />
                        <Label htmlFor="code-convert">代码格式转换</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compress" id="compress" />
                        <Label htmlFor="compress">压缩文件</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="extract" id="extract" />
                        <Label htmlFor="extract">解压文件</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {conversionType === "image" && (
                    <div className="space-y-2">
                      <Label htmlFor="image-format">目标格式</Label>
                      <Select value={targetFormat} onValueChange={setTargetFormat}>
                        <SelectTrigger id="image-format">
                          <SelectValue placeholder="选择目标格式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jpg">JPG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                          <SelectItem value="gif">GIF</SelectItem>
                          <SelectItem value="svg">SVG</SelectItem>
                          <SelectItem value="tiff">TIFF</SelectItem>
                          <SelectItem value="avif">AVIF</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="space-y-2 mt-4">
                        <Label>压缩质量</Label>
                        <RadioGroup
                          value={compressionLevel}
                          onValueChange={(value) => setCompressionLevel(value as "low" | "medium" | "high")}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="low-quality" />
                            <Label htmlFor="low-quality">低质量（小文件）</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium-quality" />
                            <Label htmlFor="medium-quality">中等质量</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high-quality" />
                            <Label htmlFor="high-quality">高质量（大文件）</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
