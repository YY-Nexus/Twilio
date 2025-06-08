import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">数据展示面板</h1>
        <p className="text-muted-foreground mt-2">实时数据可视化和分析报告</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% 较上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">+15.3% 较上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">文件总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,678</div>
            <p className="text-xs text-muted-foreground">+8.7% 较上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统负载</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>用户增长趋势</CardTitle>
            <CardDescription>过去6个月的用户增长情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">图表组件占位符</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统性能监控</CardTitle>
            <CardDescription>实时系统性能指标</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>CPU使用率</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>内存使用率</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className="mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>磁盘使用率</span>
                  <span>32%</span>
                </div>
                <Progress value={32} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
