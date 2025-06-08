"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// 支持的语言
export type Language = "zh-CN" | "en-US" | "ja-JP" | "ko-KR"

// 语言上下文接口
interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 翻译数据
const translations: Record<Language, Record<string, string>> = {
  "zh-CN": {
    // 通用
    "app.title": "API文档",
    "app.description": "API接口文档和使用说明",
    "app.overview": "概述",
    "app.errorCodes": "错误代码",

    // 导航
    "nav.endpoints": "API端点",
    "nav.sandbox": "沙箱环境",
    "nav.status": "状态监控",
    "nav.changelog": "变更日志",
    "nav.export": "导出文档",
    "nav.tutorials": "使用教程",

    // 端点
    "endpoints.title": "API端点",
    "endpoints.search": "搜索API...",
    "endpoints.select": "选择API端点",
    "endpoints.select.description": "从左侧列表中选择一个API端点以查看详细文档和进行测试",
    "endpoints.params": "请求参数",
    "endpoints.response": "响应示例",

    // 参数表格
    "params.name": "参数名",
    "params.type": "类型",
    "params.required": "必填",
    "params.description": "描述",
    "params.yes": "是",
    "params.no": "否",

    // 标签页
    "tabs.docs": "文档",
    "tabs.examples": "代码示例",
    "tabs.test": "测试",

    // 沙箱
    "sandbox.title": "API沙箱环境",
    "sandbox.description": "在安全的环境中测试API，不会影响生产数据",
    "sandbox.environment": "环境：",
    "sandbox.mode": "沙箱模式",
    "sandbox.warning": "沙箱环境提示",
    "sandbox.warning.description": "沙箱环境中的所有操作都是模拟的，不会影响实际数据。响应数据仅用于测试目的。",

    // 状态监控
    "status.title": "API状态监控",
    "status.description": "实时监控API状态和性能指标",
    "status.refresh": "刷新状态",
    "status.refreshing": "刷新中...",
    "status.system": "系统状态",
    "status.responseTime": "平均响应时间",
    "status.uptime": "系统可用性",

    // 变更日志
    "changelog.title": "API变更日志",
    "changelog.changes": "项变更",

    // 导出
    "export.title": "导出API文档",
    "export.format": "选择导出格式",
    "export.content": "选择要包含的内容",
    "export.version": "选择API版本",
    "export.button": "导出文档",

    // 教程
    "tutorials.title": "API使用教程",
    "tutorials.description": "常见场景的API使用指南和最佳实践",
    "tutorials.basic": "基础教程",
    "tutorials.advanced": "高级教程",
    "tutorials.integration": "集成指南",
    "tutorials.bestPractices": "最佳实践",
    "tutorials.troubleshooting": "问题排查",

    // 基本信息
    "info.baseUrl": "基础URL:",
    "info.auth": "认证方式:",
    "info.response": "响应格式:",
  },
  "en-US": {
    // General
    "app.title": "API Documentation",
    "app.description": "API interface documentation and usage instructions",
    "app.overview": "Overview",
    "app.errorCodes": "Error Codes",

    // Navigation
    "nav.endpoints": "API Endpoints",
    "nav.sandbox": "Sandbox Environment",
    "nav.status": "Status Monitor",
    "nav.changelog": "Changelog",
    "nav.export": "Export Docs",
    "nav.tutorials": "Tutorials",

    // Endpoints
    "endpoints.title": "API Endpoints",
    "endpoints.search": "Search API...",
    "endpoints.select": "Select an API Endpoint",
    "endpoints.select.description":
      "Select an API endpoint from the list on the left to view detailed documentation and test",
    "endpoints.params": "Request Parameters",
    "endpoints.response": "Response Example",

    // Parameter table
    "params.name": "Parameter",
    "params.type": "Type",
    "params.required": "Required",
    "params.description": "Description",
    "params.yes": "Yes",
    "params.no": "No",

    // Tabs
    "tabs.docs": "Documentation",
    "tabs.examples": "Code Examples",
    "tabs.test": "Test",

    // Sandbox
    "sandbox.title": "API Sandbox Environment",
    "sandbox.description": "Test APIs in a safe environment without affecting production data",
    "sandbox.environment": "Environment:",
    "sandbox.mode": "Sandbox Mode",
    "sandbox.warning": "Sandbox Environment Notice",
    "sandbox.warning.description":
      "All operations in the sandbox environment are simulated and will not affect actual data. Response data is for testing purposes only.",

    // Status Monitor
    "status.title": "API Status Monitor",
    "status.description": "Real-time monitoring of API status and performance metrics",
    "status.refresh": "Refresh Status",
    "status.refreshing": "Refreshing...",
    "status.system": "System Status",
    "status.responseTime": "Average Response Time",
    "status.uptime": "System Uptime",

    // Changelog
    "changelog.title": "API Changelog",
    "changelog.changes": "changes",

    // Export
    "export.title": "Export API Documentation",
    "export.format": "Select Export Format",
    "export.content": "Select Content to Include",
    "export.version": "Select API Version",
    "export.button": "Export Documentation",

    // Tutorials
    "tutorials.title": "API Tutorials",
    "tutorials.description": "API usage guides and best practices for common scenarios",
    "tutorials.basic": "Basic Tutorials",
    "tutorials.advanced": "Advanced Tutorials",
    "tutorials.integration": "Integration Guides",
    "tutorials.bestPractices": "Best Practices",
    "tutorials.troubleshooting": "Troubleshooting",

    // Basic Info
    "info.baseUrl": "Base URL:",
    "info.auth": "Authentication:",
    "info.response": "Response Format:",
  },
  "ja-JP": {
    // 一般
    "app.title": "APIドキュメント",
    "app.description": "APIインターフェースのドキュメントと使用説明",
    "app.overview": "概要",
    "app.errorCodes": "エラーコード",

    // ナビゲーション
    "nav.endpoints": "APIエンドポイント",
    "nav.sandbox": "サンドボックス環境",
    "nav.status": "ステータスモニター",
    "nav.changelog": "変更履歴",
    "nav.export": "ドキュメントのエクスポート",
    "nav.tutorials": "チュートリアル",

    // エンドポイント
    "endpoints.title": "APIエンドポイント",
    "endpoints.search": "API検索...",
    "endpoints.select": "APIエンドポイントを選択",
    "endpoints.select.description":
      "左側のリストからAPIエンドポイントを選択して、詳細なドキュメントを表示してテストします",
    "endpoints.params": "リクエストパラメータ",
    "endpoints.response": "レスポンス例",

    // パラメータテーブル
    "params.name": "パラメータ名",
    "params.type": "タイプ",
    "params.required": "必須",
    "params.description": "説明",
    "params.yes": "はい",
    "params.no": "いいえ",

    // タブ
    "tabs.docs": "ドキュメント",
    "tabs.examples": "コード例",
    "tabs.test": "テスト",

    // サンドボックス
    "sandbox.title": "APIサンドボックス環境",
    "sandbox.description": "本番データに影響を与えずに安全な環境でAPIをテスト",
    "sandbox.environment": "環境：",
    "sandbox.mode": "サンドボックスモード",
    "sandbox.warning": "サンドボックス環境の注意",
    "sandbox.warning.description":
      "サンドボックス環境でのすべての操作はシミュレーションであり、実際のデータには影響しません。レスポンスデータはテスト目的のみです。",

    // ステータスモニター
    "status.title": "APIステータスモニター",
    "status.description": "APIステータスとパフォーマンス指標のリアルタイムモニタリング",
    "status.refresh": "ステータス更新",
    "status.refreshing": "更新中...",
    "status.system": "システムステータス",
    "status.responseTime": "平均応答時間",
    "status.uptime": "システム稼働率",

    // 変更履歴
    "changelog.title": "API変更履歴",
    "changelog.changes": "変更",

    // エクスポート
    "export.title": "APIドキュメントのエクスポート",
    "export.format": "エクスポート形式を選択",
    "export.content": "含めるコンテンツを選択",
    "export.version": "APIバージョンを選択",
    "export.button": "ドキュメントをエクスポート",

    // チュートリアル
    "tutorials.title": "APIチュートリアル",
    "tutorials.description": "一般的なシナリオのAPIの使用ガイドとベストプラクティス",
    "tutorials.basic": "基本チュートリアル",
    "tutorials.advanced": "高度なチュートリアル",
    "tutorials.integration": "統合ガイド",
    "tutorials.bestPractices": "ベストプラクティス",
    "tutorials.troubleshooting": "トラブルシューティング",

    // 基本情報
    "info.baseUrl": "ベースURL:",
    "info.auth": "認証方法:",
    "info.response": "レスポンス形式:",
  },
  "ko-KR": {
    // 일반
    "app.title": "API 문서",
    "app.description": "API 인터페이스 문서 및 사용 지침",
    "app.overview": "개요",
    "app.errorCodes": "오류 코드",

    // 네비게이션
    "nav.endpoints": "API 엔드포인트",
    "nav.sandbox": "샌드박스 환경",
    "nav.status": "상태 모니터",
    "nav.changelog": "변경 로그",
    "nav.export": "문서 내보내기",
    "nav.tutorials": "튜토리얼",

    // 엔드포인트
    "endpoints.title": "API 엔드포인트",
    "endpoints.search": "API 검색...",
    "endpoints.select": "API 엔드포인트 선택",
    "endpoints.select.description": "왼쪽 목록에서 API 엔드포인트를 선택하여 자세한 문서를 보고 테스트하세요",
    "endpoints.params": "요청 매개변수",
    "endpoints.response": "응답 예시",

    // 매개변수 테이블
    "params.name": "매개변수 이름",
    "params.type": "유형",
    "params.required": "필수",
    "params.description": "설명",
    "params.yes": "예",
    "params.no": "아니오",

    // 탭
    "tabs.docs": "문서",
    "tabs.examples": "코드 예시",
    "tabs.test": "테스트",

    // 샌드박스
    "sandbox.title": "API 샌드박스 환경",
    "sandbox.description": "프로덕션 데이터에 영향을 주지 않고 안전한 환경에서 API 테스트",
    "sandbox.environment": "환경:",
    "sandbox.mode": "샌드박스 모드",
    "sandbox.warning": "샌드박스 환경 알림",
    "sandbox.warning.description":
      "샌드박스 환경의 모든 작업은 시뮬레이션되며 실제 데이터에 영향을 주지 않습니다. 응답 데이터는 테스트 목적으로만 사용됩니다.",

    // 상태 모니터
    "status.title": "API 상태 모니터",
    "status.description": "API 상태 및 성능 지표 실시간 모니터링",
    "status.refresh": "상태 새로고침",
    "status.refreshing": "새로고침 중...",
    "status.system": "시스템 상태",
    "status.responseTime": "평균 응답 시간",
    "status.uptime": "시스템 가동 시간",

    // 변경 로그
    "changelog.title": "API 변경 로그",
    "changelog.changes": "변경 사항",

    // 내보내기
    "export.title": "API 문서 내보내기",
    "export.format": "내보내기 형식 선택",
    "export.content": "포함할 콘텐츠 선택",
    "export.version": "API 버전 선택",
    "export.button": "문서 내보내기",

    // 튜토리얼
    "tutorials.title": "API 튜토리얼",
    "tutorials.description": "일반적인 시나리오에 대한 API 사용 가이드 및 모범 사례",
    "tutorials.basic": "기본 튜토리얼",
    "tutorials.advanced": "고급 튜토리얼",
    "tutorials.integration": "통합 가이드",
    "tutorials.bestPractices": "모범 사례",
    "tutorials.troubleshooting": "문제 해결",

    // 기본 정보
    "info.baseUrl": "기본 URL:",
    "info.auth": "인증 방식:",
    "info.response": "응답 형식:",
  },
}

// 语言提供者组件
export function LanguageProvider({ children }: { children: ReactNode }) {
  // 默认语言为中文
  const [language, setLanguage] = useState<Language>("zh-CN")

  // 从本地存储加载语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // 尝试从浏览器语言设置中获取
      const browserLang = navigator.language
      if (browserLang.startsWith("zh")) {
        setLanguage("zh-CN")
      } else if (browserLang.startsWith("ja")) {
        setLanguage("ja-JP")
      } else if (browserLang.startsWith("ko")) {
        setLanguage("ko-KR")
      } else {
        setLanguage("en-US") // 默认英语
      }
    }
  }, [])

  // 更改语言并保存到本地存储
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  // 翻译函数
  const translate = (key: string): string => {
    const currentTranslations = translations[language]
    return currentTranslations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 使用语言上下文的钩子
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
