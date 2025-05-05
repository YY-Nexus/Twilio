import type { Metadata } from "next"
import ApiDocsClientPage from "./ApiDocsClientPage"

// 元数据定义（在客户端组件中不会生效，但保留以便参考）
export const metadata: Metadata = {
  title: "API文档 | 言语『启智』运维管理中心",
  description: "API接口文档和使用说明",
}

export default function ApiDocsPage() {
  return <ApiDocsClientPage />
}
