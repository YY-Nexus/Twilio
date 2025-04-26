"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard, FileText, Users, Calendar, BarChart4, Settings } from "lucide-react"

const modules = [
  {
    title: "文本分析",
    description: "智能分析文本内容，提取关键信息，支持多语言处理",
    icon: CreditCard,
    href: "/analysis",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "报表生成",
    description: "生成和导出各类分析报表，支持多种格式",
    icon: FileText,
    href: "/reports",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "语料管理",
    description: "管理语料库，包括收集、分类、标注和检索",
    icon: Users,
    href: "/corpus",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "模型训练",
    description: "训练和优化自然语言处理模型，提高分析准确性",
    icon: Calendar,
    href: "/training",
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "数据可视化",
    description: "将分析结果转化为直观图表，支持多维度交互式探索",
    icon: BarChart4,
    href: "/visualization",
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "系统设置",
    description: "配置系统参数，包括权限、工作流、API接口等",
    icon: Settings,
    href: "/settings",
    color: "bg-gray-100 text-gray-700",
  },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="content-container p-6 mb-6">
        <PageHeader
          title="系统仪表盘"
          description="欢迎使用言语「逸品」数字引擎，请选择您需要的功能模块"
          className="mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link key={module.href} href={module.href} className="block">
              <Card className="card-on-bg overflow-hidden ripple h-full">
                <CardHeader className={`${module.color} py-4 card-content-hover`}>
                  <CardTitle className="flex items-center text-xl card-title-hover">
                    <module.icon className="w-5 h-5 mr-2" />
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 card-content-hover">{module.description}</p>
                  <Button className="w-full ripple">进入模块</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
