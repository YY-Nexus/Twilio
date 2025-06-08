"use client"

import { useState, useEffect } from "react"
import { ApiSearch } from "@/components/api-search"
import { ApiVersionSelector } from "@/components/api-version-selector"
import { ApiTester } from "@/components/api-tester"
import { TokenGenerator } from "@/components/token-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  Code,
  FileDown,
  FileText,
  History,
  Info,
  Settings,
  Terminal,
  Activity,
  BookOpen,
  FolderOpen,
} from "lucide-react"
import { CodeExamples } from "@/components/code-examples"
import { Changelog } from "@/components/changelog"
import { ApiExporter } from "@/components/api-exporter"
import { ApiSandbox } from "@/components/api-sandbox"
import { ApiStatusMonitor } from "@/components/api-status-monitor"
import { ApiTutorials } from "@/components/api-tutorials"
import { ApiUsageStats } from "@/components/api-usage-stats"
import { ApiAutomatedTests } from "@/components/api-automated-tests"
import { ApiFileManager } from "@/components/api-file-manager"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

// API版本数据
const API_VERSIONS = [
  { version: "v2.0", releaseDate: "2023-05-01" },
  { version: "v1.5", releaseDate: "2022-12-15" },
  { version: "v1.0", releaseDate: "2022-06-30" },
]

// API分类和端点数据
const API_ENDPOINTS = [
  {
    category: "认证",
    endpoints: [
      {
        name: "登录获取令牌",
        method: "POST",
        path: "/api/auth/login",
        description: "通过用户名和密码获取访问令牌",
        params: [
          { name: "email", type: "string", required: true, description: "用户邮箱" },
          { name: "password", type: "string", required: true, description: "用户密码" },
        ],
      },
      {
        name: "刷新令牌",
        method: "POST",
        path: "/api/auth/refresh",
        description: "使用刷新令牌获取新的访问令牌",
        params: [{ name: "refreshToken", type: "string", required: true, description: "刷新令牌" }],
      },
    ],
  },
  {
    category: "批量导出",
    endpoints: [
      {
        name: "创建导出批次",
        method: "POST",
        path: "/api/export/batch",
        description: "创建新的数据导出批次",
        params: [
          { name: "name", type: "string", required: true, description: "批次名称" },
          { name: "description", type: "string", required: false, description: "批次描述" },
          { name: "filters", type: "object", required: false, description: "数据过滤条件" },
          { name: "format", type: "string", required: false, description: "导出格式 (csv, xlsx, json)" },
        ],
      },
      {
        name: "获取导出批次状态",
        method: "GET",
        path: "/api/export/batch/{batchId}",
        description: "获取指定批次的状态和进度",
        params: [{ name: "batchId", type: "string", required: true, description: "批次ID" }],
      },
      {
        name: "获取所有导出批次",
        method: "GET",
        path: "/api/export/batches",
        description: "获取所有导出批次的列表",
        params: [
          { name: "page", type: "number", required: false, description: "页码" },
          { name: "limit", type: "number", required: false, description: "每页数量" },
          { name: "status", type: "string", required: false, description: "状态过滤" },
        ],
      },
    ],
  },
  {
    category: "用户管理",
    endpoints: [
      {
        name: "获取用户列表",
        method: "GET",
        path: "/api/users",
        description: "获取系统用户列表",
        params: [
          { name: "page", type: "number", required: false, description: "页码" },
          { name: "limit", type: "number", required: false, description: "每页数量" },
          { name: "role", type: "string", required: false, description: "角色过滤" },
          { name: "search", type: "string", required: false, description: "搜索关键词" },
        ],
      },
      {
        name: "创建新用户",
        method: "POST",
        path: "/api/users",
        description: "创建新的系统用户",
        params: [
          { name: "name", type: "string", required: true, description: "用户名" },
          { name: "email", type: "string", required: true, description: "用户邮箱" },
          { name: "password", type: "string", required: true, description: "用户密码" },
          { name: "role", type: "string", required: true, description: "用户角色" },
        ],
      },
    ],
  },
  {
    category: "数据统计",
    endpoints: [
      {
        name: "获取系统概览数据",
        method: "GET",
        path: "/api/stats/overview",
        description: "获取系统概览统计数据",
        params: [{ name: "period", type: "string", required: false, description: "时间段 (today, week, month, year)" }],
      },
      {
        name: "获取详细使用统计",
        method: "GET",
        path: "/api/stats/usage",
        description: "获取系统详细使用统计数据",
        params: [
          { name: "startDate", type: "string", required: true, description: "开始日期 (ISO格式)" },
          { name: "endDate", type: "string", required: true, description: "结束日期 (ISO格式)" },
          { name: "interval", type: "string", required: false, description: "统计间隔 (hour, day, week, month)" },
        ],
      },
    ],
  },
]

// 主内容组件
function ApiDocsContent() {
  const { t } = useLanguage()
  const [currentVersion, setCurrentVersion] = useState(API_VERSIONS[0].version)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [filteredEndpoints, setFilteredEndpoints] = useState(API_ENDPOINTS)
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("endpoints") // 主标签页状态

  // 处理搜索
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEndpoints(API_ENDPOINTS)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = API_ENDPOINTS.map((category) => {
      const matchedEndpoints = category.endpoints.filter(
        (endpoint) =>
          endpoint.name.toLowerCase().includes(query) ||
          endpoint.path.toLowerCase().includes(query) ||
          endpoint.description.toLowerCase().includes(query),
      )

      return {
        ...category,
        endpoints: matchedEndpoints,
      }
    }).filter((category) => category.endpoints.length > 0)

    setFilteredEndpoints(filtered)

    // 如果有搜索结果，自动展开所有分类
    if (filtered.length > 0) {
      setExpandedCategories(filtered.map((c) => c.category))
    }
  }, [searchQuery])

  // 切换分类展开/折叠
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // 选择端点
  const selectEndpoint = (endpoint: any) => {
    setSelectedEndpoint(endpoint)
    setActiveTab("endpoints") // 切换到端点标签页
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("app.title")}</h1>
          <p className="text-muted-foreground">{t("app.description")}</p>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <ApiVersionSelector
            versions={API_VERSIONS}
            currentVersion={currentVersion}
            onVersionChange={setCurrentVersion}
          />
          <Button variant="outline" size="sm" onClick={() => setActiveTab("export")}>
            <FileDown className="h-4 w-4 mr-2" />
            {t("nav.export")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="endpoints">
            <FileText className="h-4 w-4 mr-2" />
            {t("nav.endpoints")}
          </TabsTrigger>
          <TabsTrigger value="sandbox">
            <Terminal className="h-4 w-4 mr-2" />
            {t("nav.sandbox")}
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity className="h-4 w-4 mr-2" />
            {t("nav.status")}
          </TabsTrigger>
          <TabsTrigger value="tutorials">
            <BookOpen className="h-4 w-4 mr-2" />
            {t("nav.tutorials")}
          </TabsTrigger>
          <TabsTrigger value="files">
            <FolderOpen className="h-4 w-4 mr-2" />
            文件管理
          </TabsTrigger>
          <TabsTrigger value="usage">
            <Activity className="h-4 w-4 mr-2" />
            使用统计
          </TabsTrigger>
          <TabsTrigger value="tests">
            <Code className="h-4 w-4 mr-2" />
            自动化测试
          </TabsTrigger>
          <TabsTrigger value="changelog">
            <History className="h-4 w-4 mr-2" />
            {t("nav.changelog")}
          </TabsTrigger>
          <TabsTrigger value="export">
            <FileDown className="h-4 w-4 mr-2" />
            {t("nav.export")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 侧边栏 */}
            <div className="md:col-span-1 space-y-4">
              <ApiSearch onSearch={setSearchQuery} />

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">{t("endpoints.title")}</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="space-y-1">
                    {filteredEndpoints.map((category) => (
                      <div key={category.category}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start font-medium"
                          onClick={() => toggleCategory(category.category)}
                        >
                          {expandedCategories.includes(category.category) ? (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2" />
                          )}
                          {category.category}
                        </Button>

                        {expandedCategories.includes(category.category) && (
                          <div className="ml-6 space-y-1 mb-2">
                            {category.endpoints.map((endpoint) => (
                              <Button
                                key={endpoint.path}
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-sm ${
                                  selectedEndpoint?.path === endpoint.path ? "bg-muted" : ""
                                }`}
                                onClick={() => selectEndpoint(endpoint)}
                              >
                                <Badge
                                  variant="outline"
                                  className={`mr-2 ${
                                    endpoint.method === "GET"
                                      ? "bg-blue-100"
                                      : endpoint.method === "POST"
                                        ? "bg-green-100"
                                        : endpoint.method === "PUT"
                                          ? "bg-yellow-100"
                                          : endpoint.method === "DELETE"
                                            ? "bg-red-100"
                                            : ""
                                  }`}
                                >
                                  {endpoint.method}
                                </Badge>
                                <span className="truncate">{endpoint.name}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {filteredEndpoints.length === 0 && (
                      <div className="py-4 text-center text-muted-foreground">没有找到匹配的API端点</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <TokenGenerator />
            </div>

            {/* 主内容区 */}
            <div className="md:col-span-3">
              {selectedEndpoint ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        selectedEndpoint.method === "GET"
                          ? "default"
                          : selectedEndpoint.method === "POST"
                            ? "destructive"
                            : selectedEndpoint.method === "PUT"
                              ? "warning"
                              : selectedEndpoint.method === "DELETE"
                                ? "outline"
                                : "secondary"
                      }
                    >
                      {selectedEndpoint.method}
                    </Badge>
                    <h2 className="text-2xl font-bold">{selectedEndpoint.name}</h2>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <code className="text-sm font-mono">{selectedEndpoint.path}</code>
                  </div>

                  <p>{selectedEndpoint.description}</p>

                  <Tabs defaultValue="docs">
                    <TabsList className="mb-4">
                      <TabsTrigger value="docs">
                        <FileText className="h-4 w-4 mr-2" />
                        {t("tabs.docs")}
                      </TabsTrigger>
                      <TabsTrigger value="examples">
                        <Code className="h-4 w-4 mr-2" />
                        {t("tabs.examples")}
                      </TabsTrigger>
                      <TabsTrigger value="test">
                        <Settings className="h-4 w-4 mr-2" />
                        {t("tabs.test")}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="docs">
                      <div className="space-y-6">
                        {selectedEndpoint.params.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold mb-2">{t("endpoints.params")}</h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse">
                                <thead>
                                  <tr>
                                    <th className="border px-4 py-2 text-left">{t("params.name")}</th>
                                    <th className="border px-4 py-2 text-left">{t("params.type")}</th>
                                    <th className="border px-4 py-2 text-left">{t("params.required")}</th>
                                    <th className="border px-4 py-2 text-left">{t("params.description")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedEndpoint.params.map((param: any, index: number) => (
                                    <tr key={index}>
                                      <td className="border px-4 py-2">{param.name}</td>
                                      <td className="border px-4 py-2">{param.type}</td>
                                      <td className="border px-4 py-2">
                                        {param.required ? t("params.yes") : t("params.no")}
                                      </td>
                                      <td className="border px-4 py-2">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="text-lg font-bold mb-2">{t("endpoints.response")}</h3>
                          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                            {JSON.stringify(
                              {
                                success: true,
                                data:
                                  selectedEndpoint.method === "GET"
                                    ? [
                                        { id: "item_1", name: "示例数据1" },
                                        { id: "item_2", name: "示例数据2" },
                                      ]
                                    : { id: "item_1", name: "示例数据" },
                                pagination:
                                  selectedEndpoint.method === "GET"
                                    ? {
                                        total: 100,
                                        page: 1,
                                        limit: 20,
                                        pages: 5,
                                      }
                                    : undefined,
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="examples">
                      <CodeExamples endpoint={selectedEndpoint} />
                    </TabsContent>

                    <TabsContent value="test">
                      <ApiTester
                        endpoint={selectedEndpoint.path}
                        method={selectedEndpoint.method}
                        params={selectedEndpoint.params}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-8 text-center">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t("endpoints.select")}</h3>
                  <p className="text-muted-foreground">{t("endpoints.select.description")}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sandbox">
          <ApiSandbox />
        </TabsContent>

        <TabsContent value="status">
          <ApiStatusMonitor />
        </TabsContent>

        <TabsContent value="tutorials">
          <ApiTutorials />
        </TabsContent>

        <TabsContent value="files">
          <ApiFileManager />
        </TabsContent>

        <TabsContent value="usage">
          <ApiUsageStats />
        </TabsContent>

        <TabsContent value="tests">
          <ApiAutomatedTests />
        </TabsContent>

        <TabsContent value="changelog">
          <Changelog />
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ApiExporter apiVersions={API_VERSIONS} />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("export.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>{t("export.description")}</p>
                    <div className="space-y-2">
                      <h3 className="font-medium">{t("export.pdfFormat")}</h3>
                      <p className="text-sm text-muted-foreground">{t("export.pdfDescription")}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">{t("export.markdownFormat")}</h3>
                      <p className="text-sm text-muted-foreground">{t("export.markdownDescription")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("export.batchExport")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{t("export.batchDescription")}</p>
                  <Button variant="outline" className="w-full">
                    {t("export.contactAdmin")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">{t("app.overview")}</h2>
          <p>{t("app.overviewDescription")}</p>

          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-bold mb-2">{t("app.basicInfo")}</h3>
            <ul className="space-y-2">
              <li>
                <strong>{t("info.baseUrl")}</strong> <code>/api</code>
              </li>
              <li>
                <strong>{t("info.auth")}</strong> Bearer Token
              </li>
              <li>
                <strong>{t("info.response")}</strong> JSON
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">{t("app.errorCodes")}</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border px-4 py-2 text-left">{t("errorCodes.status")}</th>
                  <th className="border px-4 py-2 text-left">{t("errorCodes.code")}</th>
                  <th className="border px-4 py-2 text-left">{t("errorCodes.description")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">400</td>
                  <td className="border px-4 py-2">INVALID_REQUEST</td>
                  <td className="border px-4 py-2">{t("errorCodes.invalidRequest")}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">401</td>
                  <td className="border px-4 py-2">UNAUTHORIZED</td>
                  <td className="border px-4 py-2">{t("errorCodes.unauthorized")}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">403</td>
                  <td className="border px-4 py-2">FORBIDDEN</td>
                  <td className="border px-4 py-2">{t("errorCodes.forbidden")}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">404</td>
                  <td className="border px-4 py-2">NOT_FOUND</td>
                  <td className="border px-4 py-2">{t("errorCodes.notFound")}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">429</td>
                  <td className="border px-4 py-2">RATE_LIMIT</td>
                  <td className="border px-4 py-2">{t("errorCodes.rateLimit")}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">500</td>
                  <td className="border px-4 py-2">SERVER_ERROR</td>
                  <td className="border px-4 py-2">{t("errorCodes.serverError")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

// 包装主组件，提供语言上下文
export default function ApiDocsClientPage() {
  return (
    <LanguageProvider>
      <ApiDocsContent />
    </LanguageProvider>
  )
}
