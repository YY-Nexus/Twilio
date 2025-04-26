"use client"

import { ReportGenerator } from "@/components/report-generator"
import { PageHeader } from "@/components/page-header"

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="content-container p-6">
        <PageHeader title="分析报表" description="生成、预览和导出各类文本分析报表" className="mb-6" />
        <ReportGenerator />
      </div>
    </div>
  )
}
