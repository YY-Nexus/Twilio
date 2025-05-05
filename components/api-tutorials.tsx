"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Book, BookOpen, Copy, FileText, Lightbulb, Puzzle, Zap } from "lucide-react"

// 教程类型
type TutorialCategory = "basic" | "advanced" | "integration" | "bestPractices" | "troubleshooting"

// 教程接口
interface Tutorial {
  id: string
  title: {
    "zh-CN": string
    "en-US": string
    "ja-JP": string
    "ko-KR": string
  }
  description: {
    "zh-CN": string
    "en-US": string
    "ja-JP": string
    "ko-KR": string
  }
  category: TutorialCategory
  difficulty: "beginner" | "intermediate" | "advanced"
  content: {
    "zh-CN": React.ReactNode
    "en-US": React.ReactNode
    "ja-JP": React.ReactNode
    "ko-KR": React.ReactNode
  }
}

// 教程数据
const TUTORIALS: Tutorial[] = [
  {
    id: "auth-basic",
    title: {
      "zh-CN": "基础认证流程",
      "en-US": "Basic Authentication Flow",
      "ja-JP": "基本認証フロー",
      "ko-KR": "기본 인증 흐름",
    },
    description: {
      "zh-CN": "学习如何使用API进行用户认证和获取访问令牌",
      "en-US": "Learn how to authenticate users and obtain access tokens using the API",
      "ja-JP": "APIを使用してユーザーを認証しアクセストークンを取得する方法を学ぶ",
      "ko-KR": "API를 사용하여 사용자를 인증하고 액세스 토큰을 얻는 방법 학습",
    },
    category: "basic",
    difficulty: "beginner",
    content: {
      "zh-CN": (
        <div className="space-y-4">
          <p>本教程将指导您完成API认证的基本流程，包括用户登录、获取访问令牌和刷新令牌。</p>

          <h3 className="text-lg font-bold mt-4">1. 用户登录</h3>
          <p>首先，您需要调用登录API端点来获取访问令牌：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/auth/login</p>
            <p className="mt-2 text-sm">请求体：</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "email": "user@example.com",
  "password": "your_password"
}`}
            </pre>
          </div>

          <p className="mt-2">成功响应：</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "name": "测试用户",
      "email": "user@example.com",
      "role": "editor"
    }
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">2. 使用访问令牌</h3>
          <p>获取令牌后，在后续请求中将其添加到Authorization头中：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/users</p>
            <p className="mt-2 text-sm">请求头：</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1">
              {`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
            </pre>
          </div>

          <h3 className="text-lg font-bold mt-4">3. 刷新令牌</h3>
          <p>当访问令牌过期时，使用刷新令牌获取新的访问令牌：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/auth/refresh</p>
            <p className="mt-2 text-sm">请求体：</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
            </pre>
          </div>

          <h3 className="text-lg font-bold mt-4">最佳实践</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>安全存储令牌，避免在客户端暴露</li>
            <li>实现令牌自动刷新机制</li>
            <li>在令牌过期前主动刷新</li>
            <li>实现用户登出时清除令牌</li>
          </ul>
        </div>
      ),
      "en-US": (
        <div className="space-y-4">
          <p>
            This tutorial will guide you through the basic authentication flow, including user login, obtaining access
            tokens, and refreshing tokens.
          </p>

          <h3 className="text-lg font-bold mt-4">1. User Login</h3>
          <p>First, you need to call the login API endpoint to obtain an access token:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/auth/login</p>
            <p className="mt-2 text-sm">Request body:</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "email": "user@example.com",
  "password": "your_password"
}`}
            </pre>
          </div>

          <p className="mt-2">Successful response:</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "name": "Test User",
      "email": "user@example.com",
      "role": "editor"
    }
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">2. Using the Access Token</h3>
          <p>After obtaining the token, add it to the Authorization header in subsequent requests:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/users</p>
            <p className="mt-2 text-sm">Request headers:</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1">
              {`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
            </pre>
          </div>

          <h3 className="text-lg font-bold mt-4">3. Refreshing Tokens</h3>
          <p>When the access token expires, use the refresh token to obtain a new access token:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/auth/refresh</p>
            <p className="mt-2 text-sm">Request body:</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
            </pre>
          </div>

          <h3 className="text-lg font-bold mt-4">Best Practices</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Store tokens securely, avoid exposing them on the client side</li>
            <li>Implement automatic token refresh mechanism</li>
            <li>Proactively refresh tokens before they expire</li>
            <li>Clear tokens when users log out</li>
          </ul>
        </div>
      ),
      "ja-JP": (
        <div className="space-y-4">
          <p>
            このチュートリアルでは、ユーザーログイン、アクセストークンの取得、トークンの更新を含む基本的な認証フローについて説明します。
          </p>

          <h3 className="text-lg font-bold mt-4">1. ユーザーログイン</h3>
          <p>まず、ログインAPIエンドポイントを呼び出してアクセストークンを取得する必要があります：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/auth/login</p>
            <p className="mt-2 text-sm">リクエストボディ：</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "email": "user@example.com",
  "password": "your_password"
}`}
            </pre>
          </div>

          <p className="mt-2">成功レスポンス：</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "name": "テストユーザー",
      "email": "user@example.com",
      "role": "editor"
    }
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">2. アクセストークンの使用</h3>
          <p>トークンを取得した後、後続のリクエストでAuthorizationヘッダーに追加します：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/users</p>
            <p className="mt-2 text-sm">リクエストヘッダー：</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1">
              {`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
            </pre>
          </div>

          <h3 className="text-lg font-bold mt-4">3. トークンの更新</h3>
          <p>
            アクセストークンが期限切れになったら、リフレッシュトークンを使用して新しいアクセストークンを取得します：
          </p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/auth/refresh</p>
            <p className="mt-2 text-sm">リクエストボディ：</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
            </pre>
          </div>

          <h3 className="text-lg font-bold mt-4">ベストプラクティス</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>トークンを安全に保存し、クライアント側での露出を避ける</li>
            <li>トークン自動更新メカニズムを実装する</li>
            <li>トークンが期限切れになる前に積極的に更新する</li>
            <li>ユーザーがログアウトするときにトークンをクリアする</li>
          </ul>
        </div>
      ),
      "ko-KR": (
        <div className="space-y-4">
          <p>
            이 튜토리얼에서는 사용자 로그인, 액세스 토큰 획득 및 토큰 새로 고침을 포함한 기본 인증 흐름을 안내합니다.
          </p>

          <h3 className="text-lg font-bold mt-4">1. 사용자 로그인</h3>
          <p>먼저 로그인 API 엔드포인트를 호출하여 액세스 토큰을 얻어야 합니다:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/auth/login</p>
            <p className="mt-2 text-sm">요청 본문:</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "email": "user@example.com",
  "password": "your_password"
}`}
            </pre>
          </div>

          <p className="mt-2">성공 응답:</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "name": "테스트 사용자",
      "email": "user@example.com",
      "role": "editor"
    }
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">2. 액세스 토큰 사용</h3>
          <p>토큰을 획득한 후 후속 요청의 Authorization 헤더에 추가합니다:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/users</p>
            <p className="mt-2 text-sm">요청 헤더:</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1">
              {`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
            </pre>
          </div>

          <h3 className="text-lg font-bold mt-4">3. 토큰 새로 고침</h3>
          <p>액세스 토큰이 만료되면 새로 고침 토큰을 사용하여 새 액세스 토큰을 얻습니다:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/auth/refresh</p>
            <p className="mt-2 text-sm">요청 본문:</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
            </pre>
          </div>

          <h3 className="text-lg font-bold mt-4">모범 사례</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>토큰을 안전하게 저장하고 클라이언트 측에서 노출을 피함</li>
            <li>자동 토큰 새로 고침 메커니즘 구현</li>
            <li>토큰이 만료되기 전에 사전에 새로 고침</li>
            <li>사용자가 로그아웃할 때 토큰 지우기</li>
          </ul>
        </div>
      ),
    },
  },
  {
    id: "data-export",
    title: {
      "zh-CN": "批量数据导出",
      "en-US": "Batch Data Export",
      "ja-JP": "バッチデータエクスポート",
      "ko-KR": "배치 데이터 내보내기",
    },
    description: {
      "zh-CN": "了解如何使用API批量导出大量数据",
      "en-US": "Learn how to export large amounts of data using the API",
      "ja-JP": "APIを使用して大量のデータをエクスポートする方法を学ぶ",
      "ko-KR": "API를 사용하여 대량의 데이터를 내보내는 방법 알아보기",
    },
    category: "advanced",
    difficulty: "intermediate",
    content: {
      "zh-CN": (
        <div className="space-y-4">
          <p>本教程将指导您如何使用批量导出API来处理大量数据的导出需求。</p>

          <h3 className="text-lg font-bold mt-4">1. 创建导出批次</h3>
          <p>首先，创建一个新的导出批次：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/export/batch</p>
            <p className="mt-2 text-sm">请求体：</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "name": "用户数据导出",
  "description": "导出所有活跃用户数据",
  "format": "csv",
  "filters": {
    "status": "active",
    "registeredAfter": "2023-01-01"
  }
}`}
            </pre>
          </div>

          <p className="mt-2">成功响应：</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "batchId": "batch_12345",
    "status": "processing",
    "createdAt": "2023-05-15T08:30:00Z",
    "estimatedCompletion": "2023-05-15T08:35:00Z"
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">2. 检查导出状态</h3>
          <p>使用批次ID检查导出进度：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/export/batch/{"{batchId}"}</p>
          </div>

          <p className="mt-2">响应示例：</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "batchId": "batch_12345",
    "status": "processing",
    "progress": 45,
    "createdAt": "2023-05-15T08:30:00Z",
    "estimatedCompletion": "2023-05-15T08:35:00Z"
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">3. 下载导出文件</h3>
          <p>当状态变为"completed"时，可以下载导出文件：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/export/batch/{"{batchId}"}/download</p>
          </div>

          <h3 className="text-lg font-bold mt-4">4. 处理大型数据集</h3>
          <p>对于非常大的数据集，建议使用以下策略：</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>使用分页参数限制每批次的数据量</li>
            <li>设置适当的过滤条件减少数据量</li>
            <li>考虑使用增量导出而非全量导出</li>
            <li>对于超大数据集，使用异步通知（如Webhook）而非轮询</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
            <h4 className="font-bold text-blue-700">提示</h4>
            <p className="text-blue-700">批量导出API支持多种格式，包括CSV、Excel和JSON。根据您的需求选择合适的格式。</p>
          </div>
        </div>
      ),
      "en-US": (
        <div className="space-y-4">
          <p>This tutorial will guide you on how to use the batch export API to handle large data export needs.</p>

          <h3 className="text-lg font-bold mt-4">1. Create Export Batch</h3>
          <p>First, create a new export batch:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/export/batch</p>
            <p className="mt-2 text-sm">Request body:</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "name": "User Data Export",
  "description": "Export all active user data",
  "format": "csv",
  "filters": {
    "status": "active",
    "registeredAfter": "2023-01-01"
  }
}`}
            </pre>
          </div>

          <p className="mt-2">Successful response:</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "batchId": "batch_12345",
    "status": "processing",
    "createdAt": "2023-05-15T08:30:00Z",
    "estimatedCompletion": "2023-05-15T08:35:00Z"
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">2. Check Export Status</h3>
          <p>Check the export progress using the batch ID:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/export/batch/{"{batchId}"}</p>
          </div>

          <p className="mt-2">Response example:</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "batchId": "batch_12345",
    "status": "processing",
    "progress": 45,
    "createdAt": "2023-05-15T08:30:00Z",
    "estimatedCompletion": "2023-05-15T08:35:00Z"
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">3. Download Export File</h3>
          <p>When the status changes to "completed", you can download the export file:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/export/batch/{"{batchId}"}/download</p>
          </div>

          <h3 className="text-lg font-bold mt-4">4. Handling Large Datasets</h3>
          <p>For very large datasets, consider the following strategies:</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>Use pagination parameters to limit the amount of data per batch</li>
            <li>Set appropriate filters to reduce the data volume</li>
            <li>Consider incremental exports instead of full exports</li>
            <li>For extremely large datasets, use asynchronous notifications (like Webhooks) instead of polling</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
            <h4 className="font-bold text-blue-700">Tip</h4>
            <p className="text-blue-700">
              The batch export API supports multiple formats, including CSV, Excel, and JSON. Choose the appropriate
              format based on your needs.
            </p>
          </div>
        </div>
      ),
      "ja-JP": (
        <div className="space-y-4">
          <p>
            このチュートリアルでは、バッチエクスポートAPIを使用して大量のデータエクスポートのニーズを処理する方法を説明します。
          </p>

          <h3 className="text-lg font-bold mt-4">1. エクスポートバッチの作成</h3>
          <p>まず、新しいエクスポートバッチを作成します：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/export/batch</p>
            <p className="mt-2 text-sm">リクエストボディ：</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "name": "ユーザーデータエクスポート",
  "description": "すべてのアクティブユーザーデータをエクスポート",
  "format": "csv",
  "filters": {
    "status": "active",
    "registeredAfter": "2023-01-01"
  }
}`}
            </pre>
          </div>

          <p className="mt-2">成功レスポンス：</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "batchId": "batch_12345",
    "status": "processing",
    "createdAt": "2023-05-15T08:30:00Z",
    "estimatedCompletion": "2023-05-15T08:35:00Z"
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">2. エクスポートステータスの確認</h3>
          <p>バッチIDを使用してエクスポートの進行状況を確認します：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/export/batch/{"{batchId}"}</p>
          </div>

          <p className="mt-2">レスポンス例：</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "batchId": "batch_12345",
    "status": "processing",
    "progress": 45,
    "createdAt": "2023-05-15T08:30:00Z",
    "estimatedCompletion": "2023-05-15T08:35:00Z"
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">3. エクスポートファイルのダウンロード</h3>
          <p>ステータスが「completed」に変わったら、エクスポートファイルをダウンロードできます：</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/export/batch/{"{batchId}"}/download</p>
          </div>

          <h3 className="text-lg font-bold mt-4">4. 大規模データセットの処理</h3>
          <p>非常に大きなデータセットの場合、次の戦略を検討してください：</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>ページネーションパラメータを使用してバッチごとのデータ量を制限する</li>
            <li>適切なフィルターを設定してデータ量を減らす</li>
            <li>完全なエクスポートではなく増分エクスポートを検討する</li>
            <li>非常に大きなデータセットの場合、ポーリングではなく非同期通知（Webhookなど）を使用する</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
            <h4 className="font-bold text-blue-700">ヒント</h4>
            <p className="text-blue-700">
              バッチエクスポートAPIは、CSV、Excel、JSONなど複数の形式をサポートしています。ニーズに応じて適切な形式を選択してください。
            </p>
          </div>
        </div>
      ),
      "ko-KR": (
        <div className="space-y-4">
          <p>
            이 튜토리얼에서는 배치 내보내기 API를 사용하여 대량의 데이터 내보내기 요구 사항을 처리하는 방법을
            안내합니다.
          </p>

          <h3 className="text-lg font-bold mt-4">1. 내보내기 배치 생성</h3>
          <p>먼저 새 내보내기 배치를 생성합니다:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">POST /api/export/batch</p>
            <p className="mt-2 text-sm">요청 본문:</p>
            <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
              {`{
  "name": "사용자 데이터 내보내기",
  "description": "모든 활성 사용자 데이터 내보내기",
  "format": "csv",
  "filters": {
    "status": "active",
    "registeredAfter": "2023-01-01"
  }
}`}
            </pre>
          </div>

          <p className="mt-2">성공 응답:</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "batchId": "batch_12345",
    "status": "processing",
    "createdAt": "2023-05-15T08:30:00Z",
    "estimatedCompletion": "2023-05-15T08:35:00Z"
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">2. 내보내기 상태 확인</h3>
          <p>배치 ID를 사용하여 내보내기 진행 상황을 확인합니다:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/export/batch/{"{batchId}"}</p>
          </div>

          <p className="mt-2">응답 예시:</p>
          <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs mt-1 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "batchId": "batch_12345",
    "status": "processing",
    "progress": 45,
    "createdAt": "2023-05-15T08:30:00Z",
    "estimatedCompletion": "2023-05-15T08:35:00Z"
  }
}`}
          </pre>

          <h3 className="text-lg font-bold mt-4">3. 내보내기 파일 다운로드</h3>
          <p>상태가 "completed"로 변경되면 내보내기 파일을 다운로드할 수 있습니다:</p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">GET /api/export/batch/{"{batchId}"}/download</p>
          </div>

          <h3 className="text-lg font-bold mt-4">4. 대규모 데이터셋 처리</h3>
          <p>매우 큰 데이터셋의 경우 다음 전략을 고려하세요:</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>페이지네이션 매개변수를 사용하여 배치당 데이터 양 제한</li>
            <li>적절한 필터를 설정하여 데이터 볼륨 감소</li>
            <li>전체 내보내기 대신 증분 내보내기 고려</li>
            <li>매우 큰 데이터셋의 경우 폴링 대신 비동기 알림(Webhook 등) 사용</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
            <h4 className="font-bold text-blue-700">팁</h4>
            <p className="text-blue-700">
              배치 내보내기 API는 CSV, Excel, JSON 등 여러 형식을 지원합니다. 필요에 따라 적절한 형식을 선택하세요.
            </p>
          </div>
        </div>
      ),
    },
  },
  {
    id: "integration-guide",
    title: {
      "zh-CN": "API集成最佳实践",
      "en-US": "API Integration Best Practices",
      "ja-JP": "API統合のベストプラクティス",
      "ko-KR": "API 통합 모범 사례",
    },
    description: {
      "zh-CN": "学习如何高效、安全地集成API",
      "en-US": "Learn how to integrate APIs efficiently and securely",
      "ja-JP": "APIを効率的かつ安全に統合する方法を学ぶ",
      "ko-KR": "API를 효율적이고 안전하게 통합하는 방법 학습",
    },
    category: "bestPractices",
    difficulty: "advanced",
    content: {
      "zh-CN": (
        <div className="space-y-4">
          <p>本指南提供了API集成的最佳实践，帮助您构建高效、可靠和安全的应用程序。</p>

          <h3 className="text-lg font-bold mt-4">1. 认证与安全</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>使用HTTPS进行所有API通信</li>
            <li>安全存储API密钥和令牌，不要硬编码在源代码中</li>
            <li>实现令牌轮换机制，定期更新访问令牌</li>
            <li>使用适当的作用域限制API访问权限</li>
            <li>实现请求签名验证机制，防止请求被篡改</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">2. 错误处理</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>实现全面的错误处理机制，处理所有可能的API响应</li>
            <li>使用指数退避算法进行重试，避免过度请求</li>
            <li>记录API错误并设置监控告警</li>
            <li>为用户提供友好的错误消息，不暴露敏感信息</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">3. 性能优化</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>实现请求缓存，减少重复请求</li>
            <li>使用批量操作API，减少请求次数</li>
            <li>实现请求合并和防抖动机制</li>
            <li>使用压缩减少数据传输量</li>
            <li>优化请求频率，避免API限流</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">4. 版本管理</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>在请求中明确指定API版本</li>
            <li>监控API版本更新和废弃通知</li>
            <li>制定API版本迁移计划，避免使用即将废弃的API</li>
            <li>测试新版本API的兼容性</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <h4 className="font-bold text-yellow-700">注意</h4>
            <p className="text-yellow-700">
              API集成是一个持续的过程。定期审查您的集成代码，确保它符合最新的最佳实践和安全标准。
            </p>
          </div>
        </div>
      ),
      "en-US": (
        <div className="space-y-4">
          <p>
            This guide provides best practices for API integration to help you build efficient, reliable, and secure
            applications.
          </p>

          <h3 className="text-lg font-bold mt-4">1. Authentication and Security</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use HTTPS for all API communications</li>
            <li>Store API keys and tokens securely, never hardcode them in source code</li>
            <li>Implement token rotation mechanisms, regularly update access tokens</li>
            <li>Use appropriate scopes to limit API access permissions</li>
            <li>Implement request signature verification to prevent tampering</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">2. Error Handling</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Implement comprehensive error handling for all possible API responses</li>
            <li>Use exponential backoff for retries to avoid excessive requests</li>
            <li>Log API errors and set up monitoring alerts</li>
            <li>Provide user-friendly error messages without exposing sensitive information</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">3. Performance Optimization</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Implement request caching to reduce duplicate requests</li>
            <li>Use batch operation APIs to reduce the number of requests</li>
            <li>Implement request batching and debouncing mechanisms</li>
            <li>Use compression to reduce data transfer volume</li>
            <li>Optimize request frequency to avoid API rate limiting</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">4. Version Management</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Explicitly specify API version in requests</li>
            <li>Monitor API version updates and deprecation notices</li>
            <li>Develop API version migration plans to avoid using soon-to-be deprecated APIs</li>
            <li>Test compatibility with new API versions</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <h4 className="font-bold text-yellow-700">Note</h4>
            <p className="text-yellow-700">
              API integration is an ongoing process. Regularly review your integration code to ensure it meets the
              latest best practices and security standards.
            </p>
          </div>
        </div>
      ),
      "ja-JP": (
        <div className="space-y-4">
          <p>
            このガイドでは、効率的で信頼性が高く安全なアプリケーションを構築するためのAPI統合のベストプラクティスを提供します。
          </p>

          <h3 className="text-lg font-bold mt-4">1. 認証とセキュリティ</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>すべてのAPI通信にHTTPSを使用する</li>
            <li>APIキーとトークンを安全に保存し、ソースコードにハードコードしない</li>
            <li>トークンローテーションメカニズムを実装し、アクセストークンを定期的に更新する</li>
            <li>適切なスコープを使用してAPIアクセス権限を制限する</li>
            <li>リクエスト署名検証を実装して改ざんを防止する</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">2. エラー処理</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>すべての可能なAPIレスポンスに対する包括的なエラー処理を実装する</li>
            <li>過剰なリクエストを避けるために指数バックオフを使用する</li>
            <li>APIエラーをログに記録し、監視アラートを設定する</li>
            <li>機密情報を公開せずにユーザーフレンドリーなエラーメッセージを提供する</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">3. パフォーマンス最適化</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>重複リクエストを減らすためにリクエストキャッシングを実装する</li>
            <li>リクエスト数を減らすためにバッチ操作APIを使用する</li>
            <li>リクエストのバッチ処理とデバウンシングメカニズムを実装する</li>
            <li>データ転送量を減らすために圧縮を使用する</li>
            <li>APIレート制限を避けるためにリクエスト頻度を最適化する</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">4. バージョン管理</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>リクエストでAPIバージョンを明示的に指定する</li>
            <li>APIバージョンの更新と廃止通知を監視する</li>
            <li>間もなく廃止されるAPIの使用を避けるためのAPIバージョン移行計画を策定する</li>
            <li>新しいAPIバージョンとの互換性をテストする</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <h4 className="font-bold text-yellow-700">注意</h4>
            <p className="text-yellow-700">
              API統合は継続的なプロセスです。統合コードを定期的に見直して、最新のベストプラクティスとセキュリティ標準を満たしていることを確認してください。
            </p>
          </div>
        </div>
      ),
      "ko-KR": (
        <div className="space-y-4">
          <p>
            이 가이드는 효율적이고 안정적이며 안전한 애플리케이션을 구축하는 데 도움이 되는 API 통합 모범 사례를
            제공합니다.
          </p>

          <h3 className="text-lg font-bold mt-4">1. 인증 및 보안</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>모든 API 통신에 HTTPS 사용</li>
            <li>API 키와 토큰을 안전하게 저장하고 소스 코드에 하드코딩하지 않음</li>
            <li>토큰 교체 메커니즘을 구현하고 액세스 토큰을 정기적으로 업데이트</li>
            <li>적절한 범위를 사용하여 API 액세스 권한 제한</li>
            <li>요청 서명 확인을 구현하여 변조 방지</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">2. 오류 처리</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>모든 가능한 API 응답에 대한 포괄적인 오류 처리 구현</li>
            <li>과도한 요청을 피하기 위해 지수 백오프 사용</li>
            <li>API 오류를 기록하고 모니터링 경고 설정</li>
            <li>민감한 정보를 노출하지 않고 사용자 친화적인 오류 메시지 제공</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">3. 성능 최적화</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>중복 요청을 줄이기 위한 요청 캐싱 구현</li>
            <li>요청 수를 줄이기 위해 배치 작업 API 사용</li>
            <li>요청 배치 및 디바운싱 메커니즘 구현</li>
            <li>데이터 전송량을 줄이기 위해 압축 사용</li>
            <li>API 속도 제한을 피하기 위해 요청 빈도 최적화</li>
          </ul>

          <h3 className="text-lg font-bold mt-4">4. 버전 관리</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>요청에서 API 버전을 명시적으로 지정</li>
            <li>API 버전 업데이트 및 사용 중단 알림 모니터링</li>
            <li>곧 사용 중단될 API 사용을 피하기 위한 API 버전 마이그레이션 계획 개발</li>
            <li>새 API 버전과의 호환성 테스트</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
            <h4 className="font-bold text-yellow-700">참고</h4>
            <p className="text-yellow-700">
              API 통합은 지속적인 프로세스입니다. 통합 코드를 정기적으로 검토하여 최신 모범 사례 및 보안 표준을
              충족하는지 확인하세요.
            </p>
          </div>
        </div>
      ),
    },
  },
]

export function ApiTutorials() {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory>("basic")
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // 根据当前选择的分类和搜索查询过滤教程
  const filteredTutorials = TUTORIALS.filter((tutorial) => {
    const matchesCategory = tutorial.category === selectedCategory
    const matchesSearch = searchQuery
      ? tutorial.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description[language].toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesCategory && matchesSearch
  })

  // 获取难度标签
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return <Badge className="bg-green-100 text-green-800">{t("tutorials.difficulty.beginner")}</Badge>
      case "intermediate":
        return <Badge className="bg-blue-100 text-blue-800">{t("tutorials.difficulty.intermediate")}</Badge>
      case "advanced":
        return <Badge className="bg-purple-100 text-purple-800">{t("tutorials.difficulty.advanced")}</Badge>
      default:
        return null
    }
  }

  // 获取分类图标
  const getCategoryIcon = (category: TutorialCategory) => {
    switch (category) {
      case "basic":
        return <Book className="h-4 w-4" />
      case "advanced":
        return <Zap className="h-4 w-4" />
      case "integration":
        return <Puzzle className="h-4 w-4" />
      case "bestPractices":
        return <Lightbulb className="h-4 w-4" />
      case "troubleshooting":
        return <FileText className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("tutorials.title")}</h2>
        <p className="text-muted-foreground">{t("tutorials.description")}</p>
      </div>

      <Tabs defaultValue="basic" onValueChange={(value) => setSelectedCategory(value as TutorialCategory)}>
        <TabsList className="mb-4">
          <TabsTrigger value="basic">
            <Book className="h-4 w-4 mr-2" />
            {t("tutorials.basic")}
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Zap className="h-4 w-4 mr-2" />
            {t("tutorials.advanced")}
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Puzzle className="h-4 w-4 mr-2" />
            {t("tutorials.integration")}
          </TabsTrigger>
          <TabsTrigger value="bestPractices">
            <Lightbulb className="h-4 w-4 mr-2" />
            {t("tutorials.bestPractices")}
          </TabsTrigger>
          <TabsTrigger value="troubleshooting">
            <FileText className="h-4 w-4 mr-2" />
            {t("tutorials.troubleshooting")}
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getCategoryIcon(selectedCategory)}
                  <span className="ml-2">{t(`tutorials.${selectedCategory}` as any)}</span>
                </CardTitle>
                <CardDescription>
                  {t(`tutorials.${selectedCategory}Description` as any) || t("tutorials.selectTutorial")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTutorials.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {filteredTutorials.map((tutorial) => (
                        <AccordionItem key={tutorial.id} value={tutorial.id}>
                          <AccordionTrigger
                            onClick={() => setSelectedTutorial(tutorial)}
                            className={selectedTutorial?.id === tutorial.id ? "font-bold" : ""}
                          >
                            {tutorial.title[language]}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">{tutorial.description[language]}</p>
                              <div className="flex items-center justify-between">
                                {getDifficultyBadge(tutorial.difficulty)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedTutorial(tutorial)}
                                  className="text-xs"
                                >
                                  {t("tutorials.readMore")}
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>{t("tutorials.noTutorials")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                {selectedTutorial ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedTutorial.title[language]}</CardTitle>
                        <CardDescription>{selectedTutorial.description[language]}</CardDescription>
                      </div>
                      <Button variant="outline" size="icon" title={t("tutorials.copyCode")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {getDifficultyBadge(selectedTutorial.difficulty)}
                      <Badge variant="outline">
                        {getCategoryIcon(selectedTutorial.category)}
                        <span className="ml-1">{t(`tutorials.${selectedTutorial.category}` as any)}</span>
                      </Badge>
                    </div>
                  </>
                ) : (
                  <CardTitle>{t("tutorials.selectTutorial")}</CardTitle>
                )}
              </CardHeader>
              <CardContent>
                {selectedTutorial ? (
                  <div className="prose max-w-none dark:prose-invert">{selectedTutorial.content[language]}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-xl font-bold mb-2">{t("tutorials.selectTutorialPrompt")}</h3>
                    <p className="text-muted-foreground max-w-md">{t("tutorials.selectTutorialDescription")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
