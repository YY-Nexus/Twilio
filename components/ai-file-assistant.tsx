"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  BrainIcon,
  FileIcon,
  FileTextIcon,
  FileImageIcon,
  FileArchiveIcon,
  FileCodeIcon,
  TagIcon,
  FolderIcon,
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  ZapIcon,
  MessageSquareIcon,
  TextIcon,
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

// AI分析类型
type AnalysisType = "classify" | "tag" | "extract" | "summarize" | "chat"

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

interface AIFileAssistantProps {
  isOpen: boolean
  onClose: () => void
  selectedFiles: FileItem[]
  onApplyChanges: (updatedFiles: FileItem[]) => void
}

export function AIFileAssistant({ isOpen, onClose, selectedFiles, onApplyChanges }: AIFileAssistantProps) {
  const [activeTab, setActiveTab] = useState<AnalysisType>("classify")
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any | null>(null)
  const [updatedFiles, setUpdatedFiles] = useState<FileItem[]>([])
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [extractionOptions, setExtractionOptions] = useState({
    extractText: true,
    extractMetadata: true,
    extractEntities: true,
    extractKeywords: true,
  })
  const [customPrompt, setCustomPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setProcessing(false)
      setProgress(0)
      setResult(null)
      setUpdatedFiles([...selectedFiles])
      setChatMessage("")
      setChatHistory([])
      setCustomPrompt("")
      setUseCustomPrompt(false)
    }
  }, [isOpen, selectedFiles])

  // 执行AI分析
  const executeAnalysis = () => {
    setProcessing(true)
    setProgress(0)
    setResult(null)

    // 模拟处理进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // 模拟分析完成
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)

      let analysisResult
      let newUpdatedFiles = [...selectedFiles]

      switch (activeTab) {
        case "classify":
          // 模拟分类结果
          analysisResult = {
            success: true,
            message: "文件分类完成",
            details: "AI已根据文件内容进行智能分类",
          }

          // 更新文件分类
          newUpdatedFiles = selectedFiles.map((file) => {
            let category
            if (file.type === "image") {
              category = "图像资源"
            } else if (file.type === "document") {
              category = "API文档"
            } else if (file.type === "code") {
              category = "代码示例"
            } else if (file.type === "archive") {
              category = "资源包"
            } else {
              category = "其他资源"
            }
            return { ...file, category }
          })
          break

        case "tag":
          // 模拟标签结果
          analysisResult = {
            success: true,
            message: "标签生成完成",
            details: "AI已根据文件内容生成相关标签",
          }

          // 更新文件标签
          newUpdatedFiles = selectedFiles.map((file) => {
            let newTags = [...file.tags]
            if (file.type === "image") {
              newTags = [...newTags, "图像", "资源", "视觉内容"]
            } else if (file.type === "document") {
              newTags = [...newTags, "文档", "API", "参考资料"]
            } else if (file.type === "code") {
              newTags = [...newTags, "代码", "示例", "开发资源"]
            } else if (file.type === "archive") {
              newTags = [...newTags, "压缩包", "资源集", "批量文件"]
            } else {
              newTags = [...newTags, "资源", "其他", "未分类"]
            }
            // 去重
            newTags = Array.from(new Set(newTags))
            return { ...file, tags: newTags }
          })
          break

        case "extract":
          // 模拟内容提取结果
          analysisResult = {
            success: true,
            message: "内容提取完成",
            details: "AI已从文件中提取关键信息",
            extractedContent: selectedFiles.map((file) => ({
              fileId: file.id,
              fileName: file.name,
              extractedText: file.type === "document" || file.type === "code" ? "提取的文本内容示例..." : null,
              metadata: {
                createdDate: file.uploadedAt.toISOString(),
                fileType: file.type,
                fileSize: file.size,
              },
              entities: file.type === "document" ? ["API", "端点", "参数", "响应"] : [],
              keywords: ["API", "文档", "开发", "参考"],
            })),
          }
          break

        case "summarize":
          // 模拟摘要结果
          analysisResult = {
            success: true,
            message: "摘要生成完成",
            details: "AI已生成文件内容摘要",
            summaries: selectedFiles.map((file) => ({
              fileId: file.id,
              fileName: file.name,
              summary:
                file.type === "document"
                  ? "这是一份API文档，详细描述了API的端点、参数和响应格式。包含了认证方法、错误处理和示例代码。"
                  : file.type === "code"
                    ? "这是一个API客户端示例代码，展示了如何连接和使用API，包含了认证、请求和响应处理的实现。"
                    : file.type === "image"
                      ? "这是一张图像文件，可能包含API流程图、界面截图或其他视觉资料。"
                      : "这是一个文件，包含与API相关的内容。",
            })),
          }

          // 更新文件描述
          newUpdatedFiles = selectedFiles.map((file) => {
            let description
            if (file.type === "document") {
              description = "API文档，详细描述了API的端点、参数和响应格式。"
            } else if (file.type === "code") {
              description = "API客户端示例代码，展示了如何连接和使用API。"
            } else if (file.type === "image") {
              description = "API相关图像，可能是流程图或界面截图。"
            } else {
              description = "API相关资源文件。"
            }
            return { ...file, description }
          })
          break

        case "chat":
          // 模拟聊天响应
          const aiResponse =
            "这些文件看起来是API文档和相关资源。我可以帮你分析它们的内容，提取关键信息，或者回答你关于这些文件的问题。"
          setChatHistory((prev) => [
            ...prev,
            { role: "user", content: chatMessage },
            { role: "assistant", content: aiResponse },
          ])
          setChatMessage("")
          analysisResult = {
            success: true,
            message: "AI已响应您的问题",
          }
          break
      }

      setResult(analysisResult)
      setUpdatedFiles(newUpdatedFiles)
      setProcessing(false)
    }, 2000)
  }

  // 应用更改
  const applyChanges = () => {
    onApplyChanges(updatedFiles)
    onClose()
  }

  // 发送聊天消息
  const sendChatMessage = () => {
    if (!chatMessage.trim()) return
    executeAnalysis()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI文件助手</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 分析类型选择 */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalysisType)}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="classify">
                <FolderIcon className="h-4 w-4 mr-2" />
                智能分类
              </TabsTrigger>
              <TabsTrigger value="tag">
                <TagIcon className="h-4 w-4 mr-2" />
                自动标签
              </TabsTrigger>
              <TabsTrigger value="extract">
                <SearchIcon className="h-4 w-4 mr-2" />
                内容提取
              </TabsTrigger>
              <TabsTrigger value="summarize">
                <TextIcon className="h-4 w-4 mr-2" />
                生成摘要
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                AI问答
              </TabsTrigger>
            </TabsList>

            {/* 智能分类选项 */}
            <TabsContent value="classify" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>分类选项</Label>
                    <p className="text-sm text-muted-foreground">
                      AI将分析文件内容并自动将文件分配到适当的分类中。这有助于更好地组织您的API文档和资源。
                    </p>

                    <div className="flex items-center space-x-2 pt-4">
                      <Switch
                        id="use-custom-prompt-classify"
                        checked={useCustomPrompt}
                        onCheckedChange={setUseCustomPrompt}
                      />
                      <Label htmlFor="use-custom-prompt-classify">使用自定义提示词</Label>
                    </div>

                    {useCustomPrompt && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="custom-prompt-classify">自定义提示词</Label>
                        <Textarea
                          id="custom-prompt-classify"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="请分析这些文件并将它们分类为：API文档、代码示例、图表、资源包等"
                          className="min-h-[100px]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>选中的文件（{selectedFiles.length} 个）</Label>
                    <div className="border rounded-md p-2 h-[300px] overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 py-1 border-b last:border-0">
                          {getFileTypeIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 自动标签选项 */}
            <TabsContent value="tag" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>标签选项</Label>
                    <p className="text-sm text-muted-foreground">
                      AI将分析文件内容并自动生成相关标签。这有助于更好地搜索和过滤您的API文档和资源。
                    </p>

                    <div className="flex items-center space-x-2 pt-4">
                      <Switch
                        id="use-custom-prompt-tag"
                        checked={useCustomPrompt}
                        onCheckedChange={setUseCustomPrompt}
                      />
                      <Label htmlFor="use-custom-prompt-tag">使用自定义提示词</Label>
                    </div>

                    {useCustomPrompt && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="custom-prompt-tag">自定义提示词</Label>
                        <Textarea
                          id="custom-prompt-tag"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="请分析这些文件并生成相关标签，重点关注API功能、版本、用途等方面"
                          className="min-h-[100px]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>选中的文件（{selectedFiles.length} 个）</Label>
                    <div className="border rounded-md p-2 h-[300px] overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 py-1 border-b last:border-0">
                          {getFileTypeIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {file.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {file.tags.length === 0 && <span className="text-xs text-muted-foreground">无标签</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 内容提取选项 */}
            <TabsContent value="extract" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>提取选项</Label>
                    <p className="text-sm text-muted-foreground">
                      AI将从文件中提取关键信息，包括文本内容、元数据、实体和关键词。
                    </p>

                    <div className="space-y-2 pt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="extract-text"
                          checked={extractionOptions.extractText}
                          onCheckedChange={(checked) =>
                            setExtractionOptions((prev) => ({ ...prev, extractText: !!checked }))
                          }
                        />
                        <Label htmlFor="extract-text">提取文本内容</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="extract-metadata"
                          checked={extractionOptions.extractMetadata}
                          onCheckedChange={(checked) =>
                            setExtractionOptions((prev) => ({ ...prev, extractMetadata: !!checked }))
                          }
                        />
                        <Label htmlFor="extract-metadata">提取元数据</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="extract-entities"
                          checked={extractionOptions.extractEntities}
                          onCheckedChange={(checked) =>
                            setExtractionOptions((prev) => ({ ...prev, extractEntities: !!checked }))
                          }
                        />
                        <Label htmlFor="extract-entities">提取实体</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="extract-keywords"
                          checked={extractionOptions.extractKeywords}
                          onCheckedChange={(checked) =>
                            setExtractionOptions((prev) => ({ ...prev, extractKeywords: !!checked }))
                          }
                        />
                        <Label htmlFor="extract-keywords">提取关键词</Label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <Switch
                        id="use-custom-prompt-extract"
                        checked={useCustomPrompt}
                        onCheckedChange={setUseCustomPrompt}
                      />
                      <Label htmlFor="use-custom-prompt-extract">使用自定义提示词</Label>
                    </div>

                    {useCustomPrompt && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="custom-prompt-extract">自定义提示词</Label>
                        <Textarea
                          id="custom-prompt-extract"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="请从这些文件中提取API端点、参数、响应格式等关键信息"
                          className="min-h-[100px]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>选中的文件（{selectedFiles.length} 个）</Label>
                    <div className="border rounded-md p-2 h-[300px] overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 py-1 border-b last:border-0">
                          {getFileTypeIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 生成摘要选项 */}
            <TabsContent value="summarize" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>摘要选项</Label>
                    <p className="text-sm text-muted-foreground">
                      AI将分析文件内容并生成简洁的摘要，帮助您快速了解文件内容而无需阅读全文。
                    </p>

                    <div className="flex items-center space-x-2 pt-4">
                      <Switch
                        id="use-custom-prompt-summarize"
                        checked={useCustomPrompt}
                        onCheckedChange={setUseCustomPrompt}
                      />
                      <Label htmlFor="use-custom-prompt-summarize">使用自定义提示词</Label>
                    </div>

                    {useCustomPrompt && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="custom-prompt-summarize">自定义提示词</Label>
                        <Textarea
                          id="custom-prompt-summarize"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="请为这些文件生成简洁的摘要，重点关注API的主要功能和用途"
                          className="min-h-[100px]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>选中的文件（{selectedFiles.length} 个）</Label>
                    <div className="border rounded-md p-2 h-[300px] overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 py-1 border-b last:border-0">
                          {getFileTypeIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                            </div>
                            {file.description && (
                              <div className="text-xs text-muted-foreground mt-1">{file.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI问答选项 */}
            <TabsContent value="chat" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>与AI助手对话</Label>
                  <p className="text-sm text-muted-foreground">
                    您可以向AI助手询问有关选中文件的问题，AI将基于文件内容回答您的问题。
                  </p>
                </div>

                <div className="border rounded-md p-4 h-[300px] overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <BrainIcon className="h-12 w-12 mb-2 opacity-20" />
                      <p>向AI助手提问关于这些文件的问题</p>
                      <p className="text-sm">例如："这些文件的主要内容是什么？"</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="输入您的问题..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendChatMessage()
                      }
                    }}
                  />
                  <Button onClick={sendChatMessage} disabled={!chatMessage.trim() || processing}>
                    {processing ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : <ZapIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* 处理进度 */}
          {processing && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI正在处理文件...</span>
                    <span className="text-sm">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 分析结果 */}
          {result && activeTab !== "chat" && (
            <Card className={result.success ? "bg-green-50" : "bg-red-50"}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  {result.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{result.message}</p>
                    {result.details && <p className="text-sm text-muted-foreground mt-1">{result.details}</p>}
                  </div>
                </div>

                {activeTab === "extract" && result.extractedContent && (
                  <div className="mt-4 space-y-4">
                    <Label>提取的内容</Label>
                    <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(result.extractedContent, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === "summarize" && result.summaries && (
                  <div className="mt-4 space-y-4">
                    <Label>生成的摘要</Label>
                    <div className="space-y-2">
                      {result.summaries.map((summary: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              {getFileTypeIcon(selectedFiles.find((f) => f.id === summary.fileId)?.type || "other")}
                              <span className="font-medium">{summary.fileName}</span>
                            </div>
                            <p className="text-sm">{summary.summary}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          {activeTab !== "chat" && (
            <Button onClick={executeAnalysis} disabled={processing}>
              {processing ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <BrainIcon className="h-4 w-4 mr-2" />
                  开始分析
                </>
              )}
            </Button>
          )}
          {result && activeTab !== "chat" && (
            <Button onClick={applyChanges} disabled={processing}>
              应用更改
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
