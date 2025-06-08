"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Edit,
  FileText,
  Folder,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Search,
} from "lucide-react"

// 测试状态类型
type TestStatus = "passed" | "failed" | "running" | "pending" | "skipped"

// 测试方法类型
type TestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

// 测试环境类型
type TestEnvironment = "development" | "staging" | "production"

// 测试断言类型
type AssertionType =
  | "statusCode"
  | "jsonPath"
  | "responseTime"
  | "header"
  | "contentType"
  | "bodyContains"
  | "jsonSchema"

// 测试断言操作符
type AssertionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "lessThan"
  | "exists"
  | "notExists"

// 测试断言接口
interface TestAssertion {
  id: string
  type: AssertionType
  property?: string
  operator: AssertionOperator
  expected: string
  actual?: string
  passed?: boolean
}

// 测试步骤接口
interface TestStep {
  id: string
  name: string
  method: TestMethod
  url: string
  headers: Record<string, string>
  body?: string
  assertions: TestAssertion[]
  status: TestStatus
  responseTime?: number
  response?: string
  error?: string
}

// 测试用例接口
interface TestCase {
  id: string
  name: string
  description: string
  environment: TestEnvironment
  tags: string[]
  steps: TestStep[]
  status: TestStatus
  lastRun?: Date
  duration?: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// 测试套件接口
interface TestSuite {
  id: string
  name: string
  description: string
  testCases: TestCase[]
  status: TestStatus
  lastRun?: Date
  duration?: number
}

// 生成唯一ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11)
}

// 生成模拟测试套件
const generateMockTestSuites = (): TestSuite[] => {
  // 认证测试套件
  const authTestSuite: TestSuite = {
    id: "suite_auth",
    name: "认证测试套件",
    description: "测试API认证和授权功能",
    status: "passed",
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: 3.2,
    testCases: [
      {
        id: "case_auth_login",
        name: "用户登录测试",
        description: "测试用户登录API的功能",
        environment: "development",
        tags: ["认证", "登录", "核心功能"],
        status: "passed",
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: 1.5,
        createdBy: "admin@example.com",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        steps: [
          {
            id: "step_auth_login_1",
            name: "登录请求",
            method: "POST",
            url: "/api/auth/login",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              {
                email: "test@example.com",
                password: "password123",
              },
              null,
              2,
            ),
            status: "passed",
            responseTime: 120,
            response: JSON.stringify(
              {
                success: true,
                data: {
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  expiresIn: 3600,
                  user: {
                    id: "user_123",
                    name: "测试用户",
                    email: "test@example.com",
                    role: "editor",
                  },
                },
              },
              null,
              2,
            ),
            assertions: [
              {
                id: "assert_auth_login_1",
                type: "statusCode",
                operator: "equals",
                expected: "200",
                actual: "200",
                passed: true,
              },
              {
                id: "assert_auth_login_2",
                type: "jsonPath",
                property: "success",
                operator: "equals",
                expected: "true",
                actual: "true",
                passed: true,
              },
              {
                id: "assert_auth_login_3",
                type: "jsonPath",
                property: "data.token",
                operator: "exists",
                expected: "true",
                actual: "true",
                passed: true,
              },
              {
                id: "assert_auth_login_4",
                type: "responseTime",
                operator: "lessThan",
                expected: "500",
                actual: "120",
                passed: true,
              },
            ],
          },
        ],
      },
      {
        id: "case_auth_refresh",
        name: "令牌刷新测试",
        description: "测试刷新令牌API的功能",
        environment: "development",
        tags: ["认证", "令牌", "核心功能"],
        status: "passed",
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: 1.7,
        createdBy: "admin@example.com",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        steps: [
          {
            id: "step_auth_refresh_1",
            name: "刷新令牌请求",
            method: "POST",
            url: "/api/auth/refresh",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              {
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
              null,
              2,
            ),
            status: "passed",
            responseTime: 95,
            response: JSON.stringify(
              {
                success: true,
                data: {
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  expiresIn: 3600,
                },
              },
              null,
              2,
            ),
            assertions: [
              {
                id: "assert_auth_refresh_1",
                type: "statusCode",
                operator: "equals",
                expected: "200",
                actual: "200",
                passed: true,
              },
              {
                id: "assert_auth_refresh_2",
                type: "jsonPath",
                property: "data.token",
                operator: "exists",
                expected: "true",
                actual: "true",
                passed: true,
              },
            ],
          },
        ],
      },
    ],
  }

  // 用户管理测试套件
  const userTestSuite: TestSuite = {
    id: "suite_user",
    name: "用户管理测试套件",
    description: "测试用户管理相关API",
    status: "failed",
    lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
    duration: 5.7,
    testCases: [
      {
        id: "case_user_list",
        name: "获取用户列表测试",
        description: "测试获取用户列表API的功能",
        environment: "development",
        tags: ["用户", "列表", "分页"],
        status: "passed",
        lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
        duration: 2.1,
        createdBy: "admin@example.com",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        steps: [
          {
            id: "step_user_list_1",
            name: "获取用户列表请求",
            method: "GET",
            url: "/api/users?page=1&limit=10",
            headers: {
              Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            status: "passed",
            responseTime: 180,
            response: JSON.stringify(
              {
                success: true,
                data: [
                  { id: "user_1", name: "用户1", email: "user1@example.com", role: "admin" },
                  { id: "user_2", name: "用户2", email: "user2@example.com", role: "editor" },
                ],
                pagination: {
                  total: 25,
                  page: 1,
                  limit: 10,
                  pages: 3,
                },
              },
              null,
              2,
            ),
            assertions: [
              {
                id: "assert_user_list_1",
                type: "statusCode",
                operator: "equals",
                expected: "200",
                actual: "200",
                passed: true,
              },
              {
                id: "assert_user_list_2",
                type: "jsonPath",
                property: "data",
                operator: "exists",
                expected: "true",
                actual: "true",
                passed: true,
              },
              {
                id: "assert_user_list_3",
                type: "jsonPath",
                property: "pagination.total",
                operator: "greaterThan",
                expected: "0",
                actual: "25",
                passed: true,
              },
            ],
          },
        ],
      },
      {
        id: "case_user_create",
        name: "创建用户测试",
        description: "测试创建新用户API的功能",
        environment: "development",
        tags: ["用户", "创建", "验证"],
        status: "failed",
        lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
        duration: 3.6,
        createdBy: "admin@example.com",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        steps: [
          {
            id: "step_user_create_1",
            name: "创建用户请求",
            method: "POST",
            url: "/api/users",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            body: JSON.stringify(
              {
                name: "新用户",
                email: "newuser@example.com",
                password: "password123",
                role: "editor",
              },
              null,
              2,
            ),
            status: "failed",
            responseTime: 210,
            response: JSON.stringify(
              {
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "邮箱已被使用",
                },
              },
              null,
              2,
            ),
            assertions: [
              {
                id: "assert_user_create_1",
                type: "statusCode",
                operator: "equals",
                expected: "201",
                actual: "400",
                passed: false,
              },
              {
                id: "assert_user_create_2",
                type: "jsonPath",
                property: "success",
                operator: "equals",
                expected: "true",
                actual: "false",
                passed: false,
              },
            ],
          },
        ],
      },
    ],
  }

  // 数据导出测试套件
  const exportTestSuite: TestSuite = {
    id: "suite_export",
    name: "数据导出测试套件",
    description: "测试数据导出相关API",
    status: "pending",
    testCases: [
      {
        id: "case_export_batch",
        name: "批量导出测试",
        description: "测试批量导出API的功能",
        environment: "development",
        tags: ["导出", "批量", "异步"],
        status: "pending",
        createdBy: "admin@example.com",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        steps: [
          {
            id: "step_export_batch_1",
            name: "创建导出批次请求",
            method: "POST",
            url: "/api/export/batch",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            body: JSON.stringify(
              {
                name: "用户数据导出",
                description: "导出所有用户数据",
                format: "csv",
              },
              null,
              2,
            ),
            status: "pending",
            assertions: [
              {
                id: "assert_export_batch_1",
                type: "statusCode",
                operator: "equals",
                expected: "200",
                expected: "200",
              },
              {
                id: "assert_export_batch_2",
                type: "jsonPath",
                property: "data.batchId",
                operator: "exists",
                expected: "true",
              },
            ],
          },
        ],
      },
    ],
  }

  return [authTestSuite, userTestSuite, exportTestSuite]
}

// 获取测试状态徽章
const getStatusBadge = (status: TestStatus) => {
  switch (status) {
    case "passed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <Check className="h-3 w-3 mr-1" />
          通过
        </Badge>
      )
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <X className="h-3 w-3 mr-1" />
          失败
        </Badge>
      )
    case "running":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          运行中
        </Badge>
      )
    case "pending":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          <Clock className="h-3 w-3 mr-1" />
          待运行
        </Badge>
      )
    case "skipped":
      return <Badge variant="outline">跳过</Badge>
    default:
      return <Badge>未知</Badge>
  }
}

// 获取HTTP方法徽章
const getMethodBadge = (method: TestMethod) => {
  switch (method) {
    case "GET":
      return <Badge className="bg-blue-100 text-blue-800">{method}</Badge>
    case "POST":
      return <Badge className="bg-green-100 text-green-800">{method}</Badge>
    case "PUT":
      return <Badge className="bg-yellow-100 text-yellow-800">{method}</Badge>
    case "DELETE":
      return <Badge className="bg-red-100 text-red-800">{method}</Badge>
    case "PATCH":
      return <Badge className="bg-purple-100 text-purple-800">{method}</Badge>
    default:
      return <Badge>{method}</Badge>
  }
}

// 获取断言类型名称
const getAssertionTypeName = (type: AssertionType): string => {
  switch (type) {
    case "statusCode":
      return "状态码"
    case "jsonPath":
      return "JSON路径"
    case "responseTime":
      return "响应时间"
    case "header":
      return "响应头"
    case "contentType":
      return "内容类型"
    case "bodyContains":
      return "响应体包含"
    case "jsonSchema":
      return "JSON模式"
    default:
      return type
  }
}

// 获取断言操作符名称
const getAssertionOperatorName = (operator: AssertionOperator): string => {
  switch (operator) {
    case "equals":
      return "等于"
    case "notEquals":
      return "不等于"
    case "contains":
      return "包含"
    case "notContains":
      return "不包含"
    case "greaterThan":
      return "大于"
    case "lessThan":
      return "小于"
    case "exists":
      return "存在"
    case "notExists":
      return "不存在"
    default:
      return operator
  }
}

// 修复导出问题 - 确保正确导出组件
export function ApiAutomatedTests() {
  const { t } = useLanguage()
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [selectedStep, setSelectedStep] = useState<TestStep | null>(null)
  const [activeTab, setActiveTab] = useState("test-suites")
  const [loading, setLoading] = useState(false)
  const [expandedSuites, setExpandedSuites] = useState<string[]>([])
  const [expandedCases, setExpandedCases] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // 加载测试套件数据
  useEffect(() => {
    loadTestSuites()
  }, [])

  // 加载测试套件数据
  const loadTestSuites = () => {
    setLoading(true)
    // 模拟API调用延迟
    setTimeout(() => {
      const mockTestSuites = generateMockTestSuites()
      setTestSuites(mockTestSuites)
      if (mockTestSuites.length > 0) {
        setExpandedSuites([mockTestSuites[0].id])
      }
      setLoading(false)
    }, 800)
  }

  // 切换测试套件展开/折叠
  const toggleSuiteExpanded = (suiteId: string) => {
    setExpandedSuites((prev) => (prev.includes(suiteId) ? prev.filter((id) => id !== suiteId) : [...prev, suiteId]))
  }

  // 切换测试用例展开/折叠
  const toggleCaseExpanded = (caseId: string) => {
    setExpandedCases((prev) => (prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]))
  }

  // 选择测试套件
  const selectTestSuite = (suite: TestSuite) => {
    setSelectedSuite(suite)
    setSelectedTestCase(null)
    setSelectedStep(null)
    setActiveTab("test-suites")
  }

  // 选择测试用例
  const selectTestCase = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setSelectedStep(null)
    setActiveTab("test-cases")
  }

  // 选择测试步骤
  const selectTestStep = (step: TestStep) => {
    setSelectedStep(step)
    setActiveTab("test-steps")
  }

  // 运行测试套件
  const runTestSuite = (suite: TestSuite) => {
    // 更新测试套件状态为运行中
    const updatedSuites = testSuites.map((s) => {
      if (s.id === suite.id) {
        return { ...s, status: "running" as TestStatus }
      }
      return s
    })
    setTestSuites(updatedSuites)

    // 模拟测试运行
    setTimeout(() => {
      // 随机生成测试结果
      const testResult = Math.random() > 0.3 ? "passed" : "failed"

      // 更新测试套件状态
      const updatedSuitesWithResults = testSuites.map((s) => {
        if (s.id === suite.id) {
          return {
            ...s,
            status: testResult as TestStatus,
            lastRun: new Date(),
            duration: Math.random() * 5 + 1,
            testCases: s.testCases.map((tc) => {
              // 随机生成测试用例结果
              const caseResult = Math.random() > 0.2 ? testResult : testResult === "passed" ? "failed" : "passed"
              return {
                ...tc,
                status: caseResult as TestStatus,
                lastRun: new Date(),
                duration: Math.random() * 3 + 0.5,
                steps: tc.steps.map((step) => {
                  // 随机生成测试步骤结果
                  const stepResult = Math.random() > 0.1 ? caseResult : caseResult === "passed" ? "failed" : "passed"
                  return {
                    ...step,
                    status: stepResult as TestStatus,
                    responseTime: Math.floor(Math.random() * 200) + 50,
                    response: step.response || JSON.stringify({ success: stepResult === "passed" }, null, 2),
                    assertions: step.assertions.map((assertion) => {
                      const assertionPassed = stepResult === "passed" ? true : Math.random() > 0.5
                      return {
                        ...assertion,
                        passed: assertionPassed,
                        actual: assertion.actual || (assertionPassed ? assertion.expected : "错误值"),
                      }
                    }),
                  }
                }),
              }
            }),
          }
        }
        return s
      })

      setTestSuites(updatedSuitesWithResults)

      // 如果当前选中的是正在运行的测试套件，更新选中的测试套件
      if (selectedSuite?.id === suite.id) {
        const updatedSuite = updatedSuitesWithResults.find((s) => s.id === suite.id)
        if (updatedSuite) {
          setSelectedSuite(updatedSuite)
        }
      }
    }, 2000)
  }

  // 运行测试用例
  const runTestCase = (testCase: TestCase) => {
    // 更新测试用例状态为运行中
    const updatedSuites = testSuites.map((suite) => {
      if (suite.testCases.some((tc) => tc.id === testCase.id)) {
        return {
          ...suite,
          testCases: suite.testCases.map((tc) => {
            if (tc.id === testCase.id) {
              return { ...tc, status: "running" as TestStatus }
            }
            return tc
          }),
        }
      }
      return suite
    })
    setTestSuites(updatedSuites)

    // 模拟测试运行
    setTimeout(() => {
      // 随机生成测试结果
      const testResult = Math.random() > 0.3 ? "passed" : "failed"

      // 更新测试用例状态
      const updatedSuitesWithResults = testSuites.map((suite) => {
        if (suite.testCases.some((tc) => tc.id === testCase.id)) {
          const updatedTestCases = suite.testCases.map((tc) => {
            if (tc.id === testCase.id) {
              return {
                ...tc,
                status: testResult as TestStatus,
                lastRun: new Date(),
                duration: Math.random() * 3 + 0.5,
                steps: tc.steps.map((step) => {
                  // 随机生成测试步骤结果
                  const stepResult = Math.random() > 0.1 ? testResult : testResult === "passed" ? "failed" : "passed"
                  return {
                    ...step,
                    status: stepResult as TestStatus,
                    responseTime: Math.floor(Math.random() * 200) + 50,
                    response: step.response || JSON.stringify({ success: stepResult === "passed" }, null, 2),
                    assertions: step.assertions.map((assertion) => {
                      const assertionPassed = stepResult === "passed" ? true : Math.random() > 0.5
                      return {
                        ...assertion,
                        passed: assertionPassed,
                        actual: assertion.actual || (assertionPassed ? assertion.expected : "错误值"),
                      }
                    }),
                  }
                }),
              }
            }
            return tc
          })

          // 更新测试套件状态
          const allPassed = updatedTestCases.every((tc) => tc.status === "passed")
          const anyFailed = updatedTestCases.some((tc) => tc.status === "failed")
          const anyRunning = updatedTestCases.some((tc) => tc.status === "running")

          let suiteStatus: TestStatus = "pending"
          if (anyRunning) {
            suiteStatus = "running"
          } else if (anyFailed) {
            suiteStatus = "failed"
          } else if (allPassed) {
            suiteStatus = "passed"
          }

          return {
            ...suite,
            status: suiteStatus,
            testCases: updatedTestCases,
            lastRun: new Date(),
          }
        }
        return suite
      })

      setTestSuites(updatedSuitesWithResults)

      // 如果当前选中的是正在运行的测试用例，更新选中的测试用例
      if (selectedTestCase?.id === testCase.id) {
        const updatedSuite = updatedSuitesWithResults.find((s) => s.testCases.some((tc) => tc.id === testCase.id))
        if (updatedSuite) {
          const updatedTestCase = updatedSuite.testCases.find((tc) => tc.id === testCase.id)
          if (updatedTestCase) {
            setSelectedTestCase(updatedTestCase)
          }
        }
      }
    }, 1500)
  }

  // 创建新测试套件
  const createNewTestSuite = () => {
    const newSuite: TestSuite = {
      id: `suite_${generateId()}`,
      name: "新测试套件",
      description: "请添加描述",
      status: "pending",
      testCases: [],
    }

    setTestSuites([...testSuites, newSuite])
    setSelectedSuite(newSuite)
    setActiveTab("test-suites")
    setIsEditing(true)
  }

  // 创建新测试用例
  const createNewTestCase = (suiteId: string) => {
    const newTestCase: TestCase = {
      id: `case_${generateId()}`,
      name: "新测试用例",
      description: "请添加描述",
      environment: "development",
      tags: [],
      status: "pending",
      createdBy: "当前用户",
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [],
    }

    const updatedSuites = testSuites.map((suite) => {
      if (suite.id === suiteId) {
        return {
          ...suite,
          testCases: [...suite.testCases, newTestCase],
        }
      }
      return suite
    })

    setTestSuites(updatedSuites)

    // 更新选中的测试套件
    if (selectedSuite?.id === suiteId) {
      const updatedSuite = updatedSuites.find((s) => s.id === suiteId)
      if (updatedSuite) {
        setSelectedSuite(updatedSuite)
      }
    }

    setSelectedTestCase(newTestCase)
    setActiveTab("test-cases")
    setIsEditing(true)
  }

  // 创建新测试步骤
  const createNewTestStep = (testCaseId: string) => {
    const newStep: TestStep = {
      id: `step_${generateId()}`,
      name: "新测试步骤",
      method: "GET",
      url: "/api/endpoint",
      headers: {
        "Content-Type": "application/json",
      },
      status: "pending",
      assertions: [
        {
          id: `assert_${generateId()}`,
          type: "statusCode",
          operator: "equals",
          expected: "200",
        },
      ],
    }

    const updatedSuites = testSuites.map((suite) => {
      if (suite.testCases.some((tc) => tc.id === testCaseId)) {
        return {
          ...suite,
          testCases: suite.testCases.map((tc) => {
            if (tc.id === testCaseId) {
              return {
                ...tc,
                steps: [...tc.steps, newStep],
              }
            }
            return tc
          }),
        }
      }
      return suite
    })

    setTestSuites(updatedSuites)

    // 更新选中的测试用例
    if (selectedTestCase?.id === testCaseId) {
      const updatedSuite = updatedSuites.find((s) => s.testCases.some((tc) => tc.id === testCaseId))
      if (updatedSuite) {
        const updatedTestCase = updatedSuite.testCases.find((tc) => tc.id === testCaseId)
        if (updatedTestCase) {
          setSelectedTestCase(updatedTestCase)
        }
      }
    }

    setSelectedStep(newStep)
    setActiveTab("test-steps")
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API自动化测试</h2>
          <p className="text-muted-foreground">创建、管理和运行API自动化测试用例</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadTestSuites} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button size="sm" onClick={createNewTestSuite}>
            <Plus className="h-4 w-4 mr-2" />
            新建测试套件
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧测试套件列表 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索测试..."
              className="flex-1 bg-background rounded-md border border-input px-3 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">测试套件</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : testSuites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>没有测试套件</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={createNewTestSuite}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建测试套件
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {testSuites.map((suite) => (
                    <div key={suite.id} className="mb-2">
                      <div
                        className={`flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer ${
                          selectedSuite?.id === suite.id ? "bg-muted" : ""
                        }`}
                        onClick={() => toggleSuiteExpanded(suite.id)}
                      >
                        <div className="flex items-center">
                          {expandedSuites.includes(suite.id) ? (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2" />
                          )}
                          <span
                            className="font-medium"
                            onClick={(e) => {
                              e.stopPropagation()
                              selectTestSuite(suite)
                            }}
                          >
                            {suite.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(suite.status)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              runTestSuite(suite)
                            }}
                            disabled={suite.status === "running"}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {expandedSuites.includes(suite.id) && (
                        <div className="ml-6 space-y-1 mt-1">
                          {suite.testCases.map((testCase) => (
                            <div
                              key={testCase.id}
                              className={`flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer ${
                                selectedTestCase?.id === testCase.id ? "bg-muted" : ""
                              }`}
                              onClick={() => selectTestCase(testCase)}
                            >
                              <span className="text-sm truncate">{testCase.name}</span>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(testCase.status)}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    runTestCase(testCase)
                                  }}
                                  disabled={testCase.status === "running"}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-muted-foreground"
                            onClick={() => createNewTestCase(suite.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            添加测试用例
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧详情区域 */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="test-suites">测试套件</TabsTrigger>
              <TabsTrigger value="test-cases">测试用例</TabsTrigger>
              <TabsTrigger value="test-steps">测试步骤</TabsTrigger>
              <TabsTrigger value="test-results">测试结果</TabsTrigger>
            </TabsList>

            <TabsContent value="test-suites">
              {selectedSuite ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedSuite.name}</CardTitle>
                        <CardDescription>{selectedSuite.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(selectedSuite.status)}
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {isEditing ? "完成" : "编辑"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => runTestSuite(selectedSuite)}
                          disabled={selectedSuite.status === "running"}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          运行
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="suite-name">套件名称</Label>
                          <Input
                            id="suite-name"
                            value={selectedSuite.name}
                            onChange={(e) => {
                              const updatedSuite = { ...selectedSuite, name: e.target.value }
                              setSelectedSuite(updatedSuite)
                              setTestSuites(testSuites.map((s) => (s.id === updatedSuite.id ? updatedSuite : s)))
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="suite-description">描述</Label>
                          <Textarea
                            id="suite-description"
                            value={selectedSuite.description}
                            onChange={(e) => {
                              const updatedSuite = { ...selectedSuite, description: e.target.value }
                              setSelectedSuite(updatedSuite)
                              setTestSuites(testSuites.map((s) => (s.id === updatedSuite.id ? updatedSuite : s)))
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium">测试用例数</h3>
                            <p className="text-2xl font-bold">{selectedSuite.testCases.length}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">最后运行</h3>
                            <p className="text-2xl font-bold">
                              {selectedSuite.lastRun
                                ? selectedSuite.lastRun.toLocaleString("zh-CN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "从未运行"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">运行时间</h3>
                            <p className="text-2xl font-bold">
                              {selectedSuite.duration ? `${selectedSuite.duration.toFixed(1)}秒` : "-"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">通过率</h3>
                            <p className="text-2xl font-bold">
                              {selectedSuite.testCases.length > 0
                                ? `${Math.round(
                                    (selectedSuite.testCases.filter((tc) => tc.status === "passed").length /
                                      selectedSuite.testCases.length) *
                                      100,
                                  )}%`
                                : "-"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">测试用例</h3>
                          <div className="space-y-2">
                            {selectedSuite.testCases.length > 0 ? (
                              selectedSuite.testCases.map((testCase) => (
                                <div
                                  key={testCase.id}
                                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer"
                                  onClick={() => selectTestCase(testCase)}
                                >
                                  <div>
                                    <h4 className="font-medium">{testCase.name}</h4>
                                    <p className="text-sm text-muted-foreground">{testCase.description}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getStatusBadge(testCase.status)}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        runTestCase(testCase)
                                      }}
                                      disabled={testCase.status === "running"}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <p>没有测试用例</p>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => createNewTestCase(selectedSuite.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            添加测试用例
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-muted rounded-lg p-8 text-center">
                  <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">选择测试套件</h3>
                  <p className="text-muted-foreground">从左侧列表中选择一个测试套件，或创建一个新的测试套件</p>
                  <Button className="mt-4" onClick={createNewTestSuite}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建测试套件
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test-cases">
              {selectedTestCase ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedTestCase.name}</CardTitle>
                        <CardDescription>{selectedTestCase.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(selectedTestCase.status)}
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {isEditing ? "完成" : "编辑"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => runTestCase(selectedTestCase)}
                          disabled={selectedTestCase.status === "running"}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          运行
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="case-name">用例名称</Label>
                          <Input
                            id="case-name"
                            value={selectedTestCase.name}
                            onChange={(e) => {
                              const updatedCase = { ...selectedTestCase, name: e.target.value }
                              setSelectedTestCase(updatedCase)
                              setTestSuites(
                                testSuites.map((suite) => ({
                                  ...suite,
                                  testCases: suite.testCases.map((tc) => (tc.id === updatedCase.id ? updatedCase : tc)),
                                })),
                              )
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="case-description">描述</Label>
                          <Textarea
                            id="case-description"
                            value={selectedTestCase.description}
                            onChange={(e) => {
                              const updatedCase = { ...selectedTestCase, description: e.target.value }
                              setSelectedTestCase(updatedCase)
                              setTestSuites(
                                testSuites.map((suite) => ({
                                  ...suite,
                                  testCases: suite.testCases.map((tc) => (tc.id === updatedCase.id ? updatedCase : tc)),
                                })),
                              )
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="case-environment">环境</Label>
                          <Select
                            value={selectedTestCase.environment}
                            onValueChange={(value) => {
                              const updatedCase = {
                                ...selectedTestCase,
                                environment: value as TestEnvironment,
                              }
                              setSelectedTestCase(updatedCase)
                              setTestSuites(
                                testSuites.map((suite) => ({
                                  ...suite,
                                  testCases: suite.testCases.map((tc) => (tc.id === updatedCase.id ? updatedCase : tc)),
                                })),
                              )
                            }}
                          >
                            <SelectTrigger id="case-environment">
                              <SelectValue placeholder="选择环境" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="development">开发环境</SelectItem>
                              <SelectItem value="staging">测试环境</SelectItem>
                              <SelectItem value="production">生产环境</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="case-tags">标签</Label>
                          <Input
                            id="case-tags"
                            placeholder="输入标签，用逗号分隔"
                            value={selectedTestCase.tags.join(", ")}
                            onChange={(e) => {
                              const tags = e.target.value
                                .split(",")
                                .map((tag) => tag.trim())
                                .filter((tag) => tag !== "")
                              const updatedCase = { ...selectedTestCase, tags }
                              setSelectedTestCase(updatedCase)
                              setTestSuites(
                                testSuites.map((suite) => ({
                                  ...suite,
                                  testCases: suite.testCases.map((tc) => (tc.id === updatedCase.id ? updatedCase : tc)),
                                })),
                              )
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium">环境</h3>
                            <p className="text-lg font-medium">
                              {selectedTestCase.environment === "development"
                                ? "开发环境"
                                : selectedTestCase.environment === "staging"
                                  ? "测试环境"
                                  : "生产环境"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">最后运行</h3>
                            <p className="text-lg font-medium">
                              {selectedTestCase.lastRun
                                ? selectedTestCase.lastRun.toLocaleString("zh-CN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "从未运行"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">运行时间</h3>
                            <p className="text-lg font-medium">
                              {selectedTestCase.duration ? `${selectedTestCase.duration.toFixed(1)}秒` : "-"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">创建者</h3>
                            <p className="text-lg font-medium">{selectedTestCase.createdBy}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedTestCase.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">测试步骤</h3>
                          <div className="space-y-2">
                            {selectedTestCase.steps.length > 0 ? (
                              selectedTestCase.steps.map((step) => (
                                <div
                                  key={step.id}
                                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer"
                                  onClick={() => selectTestStep(step)}
                                >
                                  <div className="flex items-center">
                                    {getMethodBadge(step.method)}
                                    <span className="ml-2 font-medium">{step.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getStatusBadge(step.status)}
                                    <span className="text-sm text-muted-foreground">
                                      {step.assertions.length}个断言
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <p>没有测试步骤</p>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => createNewTestStep(selectedTestCase.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            添加测试步骤
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-muted rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">选择测试用例</h3>
                  <p className="text-muted-foreground">从左侧列表中选择一个测试用例，或创建一个新的测试用例</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test-steps">
              {selectedStep ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getMethodBadge(selectedStep.method)}
                        <CardTitle className="ml-2">{selectedStep.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(selectedStep.status)}
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {isEditing ? "完成" : "编辑"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="step-name">步骤名称</Label>
                          <Input
                            id="step-name"
                            value={selectedStep.name}
                            onChange={(e) => {
                              const updatedStep = { ...selectedStep, name: e.target.value }
                              setSelectedStep(updatedStep)
                              // 更新测试套件中的步骤
                              setTestSuites(
                                testSuites.map((suite) => ({
                                  ...suite,
                                  testCases: suite.testCases.map((tc) => ({
                                    ...tc,
                                    steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                  })),
                                })),
                              )
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="step-method">请求方法</Label>
                            <Select
                              value={selectedStep.method}
                              onValueChange={(value) => {
                                const updatedStep = { ...selectedStep, method: value as TestMethod }
                                setSelectedStep(updatedStep)
                                // 更新测试套件中的步骤
                                setTestSuites(
                                  testSuites.map((suite) => ({
                                    ...suite,
                                    testCases: suite.testCases.map((tc) => ({
                                      ...tc,
                                      steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                    })),
                                  })),
                                )
                              }}
                            >
                              <SelectTrigger id="step-method">
                                <SelectValue placeholder="选择方法" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                                <SelectItem value="PATCH">PATCH</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="step-url">URL</Label>
                            <Input
                              id="step-url"
                              value={selectedStep.url}
                              onChange={(e) => {
                                const updatedStep = { ...selectedStep, url: e.target.value }
                                setSelectedStep(updatedStep)
                                // 更新测试套件中的步骤
                                setTestSuites(
                                  testSuites.map((suite) => ({
                                    ...suite,
                                    testCases: suite.testCases.map((tc) => ({
                                      ...tc,
                                      steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                    })),
                                  })),
                                )
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="step-headers">请求头</Label>
                          <Textarea
                            id="step-headers"
                            value={JSON.stringify(selectedStep.headers, null, 2)}
                            onChange={(e) => {
                              try {
                                const headers = JSON.parse(e.target.value)
                                const updatedStep = { ...selectedStep, headers }
                                setSelectedStep(updatedStep)
                                // 更新测试套件中的步骤
                                setTestSuites(
                                  testSuites.map((suite) => ({
                                    ...suite,
                                    testCases: suite.testCases.map((tc) => ({
                                      ...tc,
                                      steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                    })),
                                  })),
                                )
                              } catch (error) {
                                // JSON解析错误，不更新
                              }
                            }}
                            className="font-mono text-sm"
                          />
                        </div>
                        {(selectedStep.method === "POST" ||
                          selectedStep.method === "PUT" ||
                          selectedStep.method === "PATCH") && (
                          <div className="space-y-2">
                            <Label htmlFor="step-body">请求体</Label>
                            <Textarea
                              id="step-body"
                              value={selectedStep.body || ""}
                              onChange={(e) => {
                                const updatedStep = { ...selectedStep, body: e.target.value }
                                setSelectedStep(updatedStep)
                                // 更新测试套件中的步骤
                                setTestSuites(
                                  testSuites.map((suite) => ({
                                    ...suite,
                                    testCases: suite.testCases.map((tc) => ({
                                      ...tc,
                                      steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                    })),
                                  })),
                                )
                              }}
                              className="font-mono text-sm"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>断言</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newAssertion: TestAssertion = {
                                  id: `assert_${generateId()}`,
                                  type: "statusCode",
                                  operator: "equals",
                                  expected: "200",
                                }
                                const updatedStep = {
                                  ...selectedStep,
                                  assertions: [...selectedStep.assertions, newAssertion],
                                }
                                setSelectedStep(updatedStep)
                                // 更新测试套件中的步骤
                                setTestSuites(
                                  testSuites.map((suite) => ({
                                    ...suite,
                                    testCases: suite.testCases.map((tc) => ({
                                      ...tc,
                                      steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                    })),
                                  })),
                                )
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              添加断言
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {selectedStep.assertions.map((assertion, index) => (
                              <div key={assertion.id} className="border rounded-md p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">断言 #{index + 1}</h4>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      const updatedStep = {
                                        ...selectedStep,
                                        assertions: selectedStep.assertions.filter((a) => a.id !== assertion.id),
                                      }
                                      setSelectedStep(updatedStep)
                                      // 更新测试套件中的步骤
                                      setTestSuites(
                                        testSuites.map((suite) => ({
                                          ...suite,
                                          testCases: suite.testCases.map((tc) => ({
                                            ...tc,
                                            steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                          })),
                                        })),
                                      )
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <Label htmlFor={`assertion-type-${assertion.id}`}>类型</Label>
                                    <Select
                                      value={assertion.type}
                                      onValueChange={(value) => {
                                        const updatedAssertion = {
                                          ...assertion,
                                          type: value as AssertionType,
                                        }
                                        const updatedStep = {
                                          ...selectedStep,
                                          assertions: selectedStep.assertions.map((a) =>
                                            a.id === updatedAssertion.id ? updatedAssertion : a,
                                          ),
                                        }
                                        setSelectedStep(updatedStep)
                                        // 更新测试套件中的步骤
                                        setTestSuites(
                                          testSuites.map((suite) => ({
                                            ...suite,
                                            testCases: suite.testCases.map((tc) => ({
                                              ...tc,
                                              steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                            })),
                                          })),
                                        )
                                      }}
                                    >
                                      <SelectTrigger id={`assertion-type-${assertion.id}`}>
                                        <SelectValue placeholder="选择类型" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="statusCode">状态码</SelectItem>
                                        <SelectItem value="jsonPath">JSON路径</SelectItem>
                                        <SelectItem value="responseTime">响应时间</SelectItem>
                                        <SelectItem value="header">响应头</SelectItem>
                                        <SelectItem value="contentType">内容类型</SelectItem>
                                        <SelectItem value="bodyContains">响应体包含</SelectItem>
                                        <SelectItem value="jsonSchema">JSON模式</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {(assertion.type === "jsonPath" || assertion.type === "header") && (
                                    <div>
                                      <Label htmlFor={`assertion-property-${assertion.id}`}>属性</Label>
                                      <Input
                                        id={`assertion-property-${assertion.id}`}
                                        value={assertion.property || ""}
                                        onChange={(e) => {
                                          const updatedAssertion = {
                                            ...assertion,
                                            property: e.target.value,
                                          }
                                          const updatedStep = {
                                            ...selectedStep,
                                            assertions: selectedStep.assertions.map((a) =>
                                              a.id === updatedAssertion.id ? updatedAssertion : a,
                                            ),
                                          }
                                          setSelectedStep(updatedStep)
                                          // 更新测试套件中的步骤
                                          setTestSuites(
                                            testSuites.map((suite) => ({
                                              ...suite,
                                              testCases: suite.testCases.map((tc) => ({
                                                ...tc,
                                                steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                              })),
                                            })),
                                          )
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <Label htmlFor={`assertion-operator-${assertion.id}`}>操作符</Label>
                                    <Select
                                      value={assertion.operator}
                                      onValueChange={(value) => {
                                        const updatedAssertion = {
                                          ...assertion,
                                          operator: value as AssertionOperator,
                                        }
                                        const updatedStep = {
                                          ...selectedStep,
                                          assertions: selectedStep.assertions.map((a) =>
                                            a.id === updatedAssertion.id ? updatedAssertion : a,
                                          ),
                                        }
                                        setSelectedStep(updatedStep)
                                        // 更新测试套件中的步骤
                                        setTestSuites(
                                          testSuites.map((suite) => ({
                                            ...suite,
                                            testCases: suite.testCases.map((tc) => ({
                                              ...tc,
                                              steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                            })),
                                          })),
                                        )
                                      }}
                                    >
                                      <SelectTrigger id={`assertion-operator-${assertion.id}`}>
                                        <SelectValue placeholder="选择操作符" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="equals">等于</SelectItem>
                                        <SelectItem value="notEquals">不等于</SelectItem>
                                        <SelectItem value="contains">包含</SelectItem>
                                        <SelectItem value="notContains">不包含</SelectItem>
                                        <SelectItem value="greaterThan">大于</SelectItem>
                                        <SelectItem value="lessThan">小于</SelectItem>
                                        <SelectItem value="exists">存在</SelectItem>
                                        <SelectItem value="notExists">不存在</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div
                                    className={
                                      assertion.type === "jsonPath" || assertion.type === "header"
                                        ? "col-span-3"
                                        : "col-span-2"
                                    }
                                  >
                                    <Label htmlFor={`assertion-expected-${assertion.id}`}>期望值</Label>
                                    <Input
                                      id={`assertion-expected-${assertion.id}`}
                                      value={assertion.expected}
                                      onChange={(e) => {
                                        const updatedAssertion = {
                                          ...assertion,
                                          expected: e.target.value,
                                        }
                                        const updatedStep = {
                                          ...selectedStep,
                                          assertions: selectedStep.assertions.map((a) =>
                                            a.id === updatedAssertion.id ? updatedAssertion : a,
                                          ),
                                        }
                                        setSelectedStep(updatedStep)
                                        // 更新测试套件中的步骤
                                        setTestSuites(
                                          testSuites.map((suite) => ({
                                            ...suite,
                                            testCases: suite.testCases.map((tc) => ({
                                              ...tc,
                                              steps: tc.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
                                            })),
                                          })),
                                        )
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-muted p-3 rounded-md font-mono text-sm">
                          <div className="flex items-center">
                            <span className="font-bold text-blue-600">{selectedStep.method}</span>
                            <span className="ml-2">{selectedStep.url}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">请求头</h3>
                          <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                            {JSON.stringify(selectedStep.headers, null, 2)}
                          </pre>
                        </div>

                        {(selectedStep.method === "POST" ||
                          selectedStep.method === "PUT" ||
                          selectedStep.method === "PATCH") &&
                          selectedStep.body && (
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium">请求体</h3>
                              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">{selectedStep.body}</pre>
                            </div>
                          )}

                        {selectedStep.response && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="text-sm font-medium">响应</h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">{selectedStep.responseTime}ms</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(selectedStep.response || "")}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  复制
                                </Button>
                              </div>
                            </div>
                            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                              {selectedStep.response}
                            </pre>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">断言</h3>
                          <div className="space-y-2">
                            {selectedStep.assertions.map((assertion) => (
                              <div
                                key={assertion.id}
                                className={`border p-3 rounded-md ${
                                  assertion.passed === undefined
                                    ? "border-gray-200"
                                    : assertion.passed
                                      ? "border-green-200 bg-green-50"
                                      : "border-red-200 bg-red-50"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    {assertion.passed !== undefined && (
                                      <span
                                        className={`flex items-center justify-center h-5 w-5 rounded-full mr-2 ${
                                          assertion.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {assertion.passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                      </span>
                                    )}
                                    <span className="font-medium">
                                      {getAssertionTypeName(assertion.type)}
                                      {assertion.property ? ` (${assertion.property})` : ""}
                                    </span>
                                  </div>
                                  <Badge variant="outline">{getAssertionOperatorName(assertion.operator)}</Badge>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">期望值:</span>{" "}
                                    <span className="font-mono">{assertion.expected}</span>
                                  </div>
                                  {assertion.actual && (
                                    <div>
                                      <span className="text-muted-foreground">实际值:</span>{" "}
                                      <span className="font-mono">{assertion.actual}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-muted rounded-lg p-8 text-center">
                  <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">选择测试步骤</h3>
                  <p className="text-muted-foreground">从测试用例中选择一个测试步骤，或创建一个新的测试步骤</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test-results">
              <Card>
                <CardHeader>
                  <CardTitle>测试结果</CardTitle>
                  <CardDescription>查看测试运行结果和历史记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">最近运行</h3>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="选择过滤条件" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有结果</SelectItem>
                          <SelectItem value="passed">仅通过</SelectItem>
                          <SelectItem value="failed">仅失败</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      {testSuites
                        .filter((suite) => suite.lastRun)
                        .sort((a, b) => (b.lastRun?.getTime() || 0) - (a.lastRun?.getTime() || 0))
                        .slice(0, 5)
                        .map((suite) => (
                          <div
                            key={suite.id}
                            className="border rounded-md p-4 hover:bg-muted cursor-pointer"
                            onClick={() => selectTestSuite(suite)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{suite.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  运行于{" "}
                                  {suite.lastRun?.toLocaleString("zh-CN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(suite.status)}
                                <span className="text-sm">
                                  {suite.duration ? `${suite.duration.toFixed(1)}秒` : ""}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {suite.testCases.filter((tc) => tc.status === "passed").length} 通过
                                </Badge>
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                  {suite.testCases.filter((tc) => tc.status === "failed").length} 失败
                                </Badge>
                                <Badge variant="outline">
                                  {
                                    suite.testCases.filter((tc) => tc.status !== "passed" && tc.status !== "failed")
                                      .length
                                  }{" "}
                                  其他
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {testSuites.filter((suite) => suite.lastRun).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>暂无测试运行记录</p>
                      </div>
                    )}

                    <Button variant="outline" className="w-full">
                      查看所有测试结果
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// 确保导出组件
export default ApiAutomatedTests
