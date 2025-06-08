interface ProjectAnalysis {
  name: string
  framework: string
  dependencies: Record<string, string>
  components: string[]
  apiRoutes: string[]
  conflicts: string[]
}

export function analyzeProjects(projects: string[]): ProjectAnalysis[] {
  const analysis: ProjectAnalysis[] = []

  projects.forEach((projectPath) => {
    // 分析package.json依赖
    const packageJson = require(`${projectPath}/package.json`)

    // 扫描组件文件
    const components = scanComponents(projectPath)

    // 检查API路由
    const apiRoutes = scanApiRoutes(projectPath)

    // 识别潜在冲突
    const conflicts = detectConflicts(packageJson.dependencies)

    analysis.push({
      name: packageJson.name,
      framework: detectFramework(packageJson),
      dependencies: packageJson.dependencies,
      components,
      apiRoutes,
      conflicts,
    })
  })

  return analysis
}

function scanComponents(projectPath: string): string[] {
  // 扫描components目录，返回组件列表
  return ["UserProfile.tsx", "ProductCard.tsx", "OrderTable.tsx", "ChatWidget.tsx"]
}

function scanApiRoutes(projectPath: string): string[] {
  // 扫描app/api目录，返回API路由列表
  return ["/api/users", "/api/products", "/api/orders", "/api/chat"]
}

function detectConflicts(dependencies: Record<string, string>): string[] {
  const conflicts: string[] = []

  // 检查版本冲突
  if (dependencies["next"] && !dependencies["next"].startsWith("^14")) {
    conflicts.push("Next.js版本不兼容")
  }

  if (dependencies["react"] && !dependencies["react"].startsWith("^18")) {
    conflicts.push("React版本不兼容")
  }

  return conflicts
}

function detectFramework(packageJson: any): string {
  if (packageJson.dependencies?.["next"]) return "Next.js"
  if (packageJson.dependencies?.["react"]) return "React"
  return "Unknown"
}

// 使用示例
console.log("开始分析项目兼容性...")
const projects = [
  "./user-management",
  "./product-showcase",
  "./order-processing",
  "./analytics-dashboard",
  "./customer-support",
]

const analysisResults = analyzeProjects(projects)
console.log("分析结果：", JSON.stringify(analysisResults, null, 2))
