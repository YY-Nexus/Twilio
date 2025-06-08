"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileDown, FileText } from "lucide-react"

// 导出选项接口
interface ExportOptions {
  format: "pdf" | "markdown"
  sections: {
    overview: boolean
    authentication: boolean
    endpoints: boolean
    errorCodes: boolean
    changelog: boolean
  }
  includeExamples: boolean
  apiVersion: string
}

export function ApiExporter({ apiVersions }: { apiVersions: Array<{ version: string; releaseDate: string }> }) {
  const [options, setOptions] = useState<ExportOptions>({
    format: "pdf",
    sections: {
      overview: true,
      authentication: true,
      endpoints: true,
      errorCodes: true,
      changelog: false,
    },
    includeExamples: true,
    apiVersion: apiVersions[0].version,
  })

  // 更新导出格式
  const updateFormat = (format: "pdf" | "markdown") => {
    setOptions((prev) => ({ ...prev, format }))
  }

  // 更新选中的章节
  const updateSection = (section: keyof ExportOptions["sections"], checked: boolean) => {
    setOptions((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: checked,
      },
    }))
  }

  // 更新是否包含代码示例
  const updateIncludeExamples = (checked: boolean) => {
    setOptions((prev) => ({ ...prev, includeExamples: checked }))
  }

  // 更新API版本
  const updateApiVersion = (version: string) => {
    setOptions((prev) => ({ ...prev, apiVersion: version }))
  }

  // 导出文档
  const exportDocs = () => {
    // 这里只是模拟导出过程，实际应用中应该调用后端API或使用客户端库生成文档
    console.log("导出选项:", options)

    // 模拟下载延迟
    setTimeout(() => {
      // 创建一个模拟的下载链接
      const link = document.createElement("a")
      link.href = "#"
      link.download = `api-docs-${options.apiVersion}.${options.format === "pdf" ? "pdf" : "md"}`
      link.click()

      // 显示成功消息
      alert(`API文档已导出为${options.format === "pdf" ? "PDF" : "Markdown"}格式！`)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileDown className="mr-2 h-5 w-5" />
          导出API文档
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="format" className="space-y-4">
          <TabsList>
            <TabsTrigger value="format">格式</TabsTrigger>
            <TabsTrigger value="content">内容</TabsTrigger>
            <TabsTrigger value="version">版本</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">选择导出格式</h3>
              <RadioGroup
                value={options.format}
                onValueChange={(value) => updateFormat(value as "pdf" | "markdown")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    PDF文档
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="markdown" id="markdown" />
                  <Label htmlFor="markdown" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Markdown文档
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">选择要包含的内容</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overview"
                    checked={options.sections.overview}
                    onCheckedChange={(checked) => updateSection("overview", checked as boolean)}
                  />
                  <Label htmlFor="overview">概述</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="authentication"
                    checked={options.sections.authentication}
                    onCheckedChange={(checked) => updateSection("authentication", checked as boolean)}
                  />
                  <Label htmlFor="authentication">认证</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="endpoints"
                    checked={options.sections.endpoints}
                    onCheckedChange={(checked) => updateSection("endpoints", checked as boolean)}
                  />
                  <Label htmlFor="endpoints">API端点</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="errorCodes"
                    checked={options.sections.errorCodes}
                    onCheckedChange={(checked) => updateSection("errorCodes", checked as boolean)}
                  />
                  <Label htmlFor="errorCodes">错误代码</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="changelog"
                    checked={options.sections.changelog}
                    onCheckedChange={(checked) => updateSection("changelog", checked as boolean)}
                  />
                  <Label htmlFor="changelog">变更日志</Label>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeExamples"
                    checked={options.includeExamples}
                    onCheckedChange={(checked) => updateIncludeExamples(checked as boolean)}
                  />
                  <Label htmlFor="includeExamples">包含代码示例</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="version" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">选择API版本</h3>
              <RadioGroup
                value={options.apiVersion}
                onValueChange={updateApiVersion}
                className="flex flex-col space-y-2"
              >
                {apiVersions.map((version) => (
                  <div key={version.version} className="flex items-center space-x-2">
                    <RadioGroupItem value={version.version} id={version.version} />
                    <Label htmlFor={version.version}>
                      {version.version} ({version.releaseDate})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={exportDocs} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          导出文档
        </Button>
      </CardFooter>
    </Card>
  )
}
