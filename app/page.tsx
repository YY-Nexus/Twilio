import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { FileText, CreditCard, BarChart4 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo-large.png" alt="言语智能Logo" width={240} height={100} priority className="h-auto" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">言语「逸品」数字引擎</h1>
        <p className="text-lg text-white mb-8 drop-shadow-md">
          专业的言语分析与处理平台，提供文本分析、报表生成、数据可视化等全方位功能。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 ripple">
              查看所有功能模块
            </Button>
          </Link>
          <Link href="/analysis">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-white/80 text-blue-700 border-blue-300 hover:bg-white ripple"
            >
              进入分析系统
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl">
        <Link href="/analysis" className="block">
          <div className="card-on-bg p-6 rounded-lg ripple h-full">
            <h2 className="text-xl font-semibold mb-2 text-blue-600 flex items-center card-title-hover">
              <CreditCard className="w-5 h-5 mr-2" />
              文本分析处理
            </h2>
            <p className="text-gray-700 card-content-hover">
              智能分析文本内容，提取关键信息，支持多语言处理和语义理解。
            </p>
            <div className="mt-4">
              <span className="text-blue-600 font-medium card-button-hover inline-flex items-center">
                查看详情 <span className="ml-1">→</span>
              </span>
            </div>
          </div>
        </Link>

        <Link href="/visualization" className="block">
          <div className="card-on-bg p-6 rounded-lg ripple h-full">
            <h2 className="text-xl font-semibold mb-2 text-blue-600 flex items-center card-title-hover">
              <BarChart4 className="w-5 h-5 mr-2" />
              数据可视化
            </h2>
            <p className="text-gray-700 card-content-hover">将复杂数据转化为直观图表，支持多维度分析和交互式探索。</p>
            <div className="mt-4">
              <span className="text-blue-600 font-medium card-button-hover inline-flex items-center">
                查看详情 <span className="ml-1">→</span>
              </span>
            </div>
          </div>
        </Link>

        <Link href="/reports" className="block">
          <div className="card-on-bg p-6 rounded-lg ripple h-full">
            <h2 className="text-xl font-semibold mb-2 text-blue-600 flex items-center card-title-hover">
              <FileText className="w-5 h-5 mr-2" />
              报表生成导出
            </h2>
            <p className="text-gray-700 card-content-hover">生成专业分析报表，支持多种格式导出，便于数据共享和决策。</p>
            <div className="mt-4">
              <span className="text-blue-600 font-medium card-button-hover inline-flex items-center">
                查看详情 <span className="ml-1">→</span>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
