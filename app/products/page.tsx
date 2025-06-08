"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Package, TrendingUp, AlertTriangle } from "lucide-react"
import { useNotifications } from "@/providers/app-provider"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  image: string
  description: string
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { addNotification } = useNotifications()

  // 模拟数据加载
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockProducts: Product[] = [
        {
          id: "1",
          name: "iPhone 15 Pro",
          category: "电子产品",
          price: 7999,
          stock: 25,
          status: "active",
          image: "/placeholder.svg?height=100&width=100&query=iPhone",
          description: "最新款iPhone，配备A17 Pro芯片",
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          name: "MacBook Air M3",
          category: "电子产品",
          price: 8999,
          stock: 0,
          status: "out_of_stock",
          image: "/placeholder.svg?height=100&width=100&query=MacBook",
          description: "轻薄便携的笔记本电脑",
          createdAt: "2024-01-16",
        },
        {
          id: "3",
          name: "无线蓝牙耳机",
          category: "配件",
          price: 299,
          stock: 150,
          status: "active",
          image: "/placeholder.svg?height=100&width=100&query=headphones",
          description: "高品质无线蓝牙耳机",
          createdAt: "2024-01-17",
        },
        {
          id: "4",
          name: "智能手表",
          category: "可穿戴设备",
          price: 1999,
          stock: 5,
          status: "active",
          image: "/placeholder.svg?height=100&width=100&query=smartwatch",
          description: "多功能智能手表",
          createdAt: "2024-01-18",
        },
      ]

      setProducts(mockProducts)
      setLoading(false)
    }

    loadProducts()
  }, [])

  // 获取分类列表
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  // 过滤商品
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 获取状态标签样式
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "out_of_stock":
        return "destructive"
      default:
        return "outline"
    }
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "在售"
      case "inactive":
        return "下架"
      case "out_of_stock":
        return "缺货"
      default:
        return "未知"
    }
  }

  // 计算统计数据
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.status === "active").length
  const outOfStockProducts = products.filter((p) => p.status === "out_of_stock").length
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">商品管理</h1>
            <p className="text-muted-foreground mt-2">管理商品信息和库存</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">正在加载商品数据...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">商品管理</h1>
          <p className="text-muted-foreground mt-2">管理商品信息和库存</p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加商品
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">商品总数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">+3 较上周</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在售商品</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">正常销售中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">缺货商品</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">需要补货</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">库存预警</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">库存不足10件</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
          <CardDescription>查看和管理所有商品信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索商品名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                {categories
                  .filter((cat) => cat !== "all")
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* 商品网格 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={getStatusBadgeVariant(product.status)}>{getStatusText(product.status)}</Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">¥{product.price.toLocaleString()}</span>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className={`${product.stock <= 10 ? "text-orange-600" : "text-muted-foreground"}`}>
                        库存: {product.stock}
                      </span>
                      <span className="text-muted-foreground">创建: {product.createdAt}</span>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          addNotification({
                            type: "info",
                            title: "商品详情",
                            message: `查看 ${product.name} 的详细信息`,
                          })
                        }}
                      >
                        详情
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">没有找到商品</h3>
              <p className="text-muted-foreground">尝试调整搜索条件或添加新商品</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
