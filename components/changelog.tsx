"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

// 变更类型定义
type ChangeType = "added" | "changed" | "deprecated" | "removed" | "fixed" | "security"

// 变更项定义
interface ChangeItem {
  type: ChangeType
  description: string
  endpoints?: string[]
}

// 版本变更定义
interface VersionChange {
  version: string
  date: string
  changes: ChangeItem[]
}

// 示例变更日志数据
const CHANGELOG_DATA: VersionChange[] = [
  {
    version: "v2.0",
    date: "2023-05-01",
    changes: [
      {
        type: "added",
        description: "新增批量导出API，支持大规模数据导出",
        endpoints: ["/api/export/batch", "/api/export/batch/{batchId}", "/api/export/batches"],
      },
      {
        type: "added",
        description: "新增数据统计API，提供系统使用情况统计",
        endpoints: ["/api/stats/overview", "/api/stats/usage"],
      },
      {
        type: "changed",
        description: "用户管理API现在支持更多的过滤选项",
        endpoints: ["/api/users"],
      },
      {
        type: "security",
        description: "增强了认证机制，支持双因素认证",
        endpoints: ["/api/auth/login"],
      },
    ],
  },
  {
    version: "v1.5",
    date: "2022-12-15",
    changes: [
      {
        type: "added",
        description: "新增用户角色管理API",
        endpoints: ["/api/roles", "/api/users/{userId}/roles"],
      },
      {
        type: "changed",
        description: "改进了认证API的响应格式，提供更多用户信息",
        endpoints: ["/api/auth/login", "/api/auth/refresh"],
      },
      {
        type: "deprecated",
        description: "废弃了旧版数据查询API，将在v2.0中移除",
        endpoints: ["/api/data/query-old"],
      },
      {
        type: "fixed",
        description: "修复了用户创建API的参数验证问题",
        endpoints: ["/api/users"],
      },
    ],
  },
  {
    version: "v1.0",
    date: "2022-06-30",
    changes: [
      {
        type: "added",
        description: "首次发布API，包含基本的认证和用户管理功能",
        endpoints: ["/api/auth/login", "/api/auth/refresh", "/api/users"],
      },
    ],
  },
]

export function Changelog() {
  const [expandedVersions, setExpandedVersions] = useState<string[]>(["v2.0"])

  // 切换版本展开/折叠
  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => (prev.includes(version) ? prev.filter((v) => v !== version) : [...prev, version]))
  }

  // 获取变更类型的颜色和标签
  const getChangeTypeBadge = (type: ChangeType) => {
    switch (type) {
      case "added":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">新增</Badge>
      case "changed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">变更</Badge>
      case "deprecated":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">废弃</Badge>
      case "removed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">移除</Badge>
      case "fixed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">修复</Badge>
      case "security":
        return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">安全</Badge>
      default:
        return <Badge>其他</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API变更日志</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {CHANGELOG_DATA.map((versionData) => (
            <div key={versionData.version} className="border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                className="w-full justify-between p-4 rounded-none border-b"
                onClick={() => toggleVersion(versionData.version)}
              >
                <div className="flex items-center">
                  {expandedVersions.includes(versionData.version) ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-bold">{versionData.version}</span>
                  <span className="text-muted-foreground ml-2">({versionData.date})</span>
                </div>
                <Badge variant="outline">{versionData.changes.length}项变更</Badge>
              </Button>

              {expandedVersions.includes(versionData.version) && (
                <div className="p-4 space-y-4">
                  {versionData.changes.map((change, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center">
                        {getChangeTypeBadge(change.type)}
                        <span className="ml-2 font-medium">{change.description}</span>
                      </div>
                      {change.endpoints && change.endpoints.length > 0 && (
                        <div className="ml-6 text-sm text-muted-foreground">
                          <span>影响的端点: </span>
                          {change.endpoints.map((endpoint, i) => (
                            <code key={i} className="mx-1 px-1 bg-muted rounded">
                              {endpoint}
                            </code>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
