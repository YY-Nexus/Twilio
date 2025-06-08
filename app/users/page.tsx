"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Edit, Trash2, UserPlus } from "lucide-react"
import { useNotifications } from "@/providers/app-provider"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "user"
  status: "active" | "inactive" | "pending"
  createdAt: string
  lastLogin: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { addNotification } = useNotifications()

  // 模拟数据加载
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUsers: User[] = [
        {
          id: "1",
          name: "张三",
          email: "zhangsan@example.com",
          role: "admin",
          status: "active",
          createdAt: "2024-01-15",
          lastLogin: "2024-01-20 10:30",
        },
        {
          id: "2",
          name: "李四",
          email: "lisi@example.com",
          role: "manager",
          status: "active",
          createdAt: "2024-01-16",
          lastLogin: "2024-01-19 15:45",
        },
        {
          id: "3",
          name: "王五",
          email: "wangwu@example.com",
          role: "user",
          status: "pending",
          createdAt: "2024-01-18",
          lastLogin: "从未登录",
        },
      ]

      setUsers(mockUsers)
      setLoading(false)
    }

    loadUsers()
  }, [])

  // 过滤用户
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 获取角色标签样式
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      case "user":
        return "secondary"
      default:
        return "outline"
    }
  }

  // 获取状态标签样式
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUsers(users.filter((user) => user.id !== userId))
      addNotification({
        type: "success",
        title: "删除成功",
        message: "用户已成功删除",
      })
    } catch (error) {
      addNotification({
        type: "error",
        title: "删除失败",
        message: "删除用户时发生错误",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">用户管理</h1>
            <p className="text-muted-foreground mt-2">管理系统用户和权限</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">正在加载用户数据...</p>
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
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground mt-2">管理系统用户和权限</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              添加用户
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新用户</DialogTitle>
              <DialogDescription>创建新的系统用户账户</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">用户名</label>
                <Input placeholder="请输入用户名" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">邮箱地址</label>
                <Input type="email" placeholder="请输入邮箱地址" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">用户角色</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="user">普通用户</option>
                  <option value="manager">管理员</option>
                  <option value="admin">超级管理员</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={() => {
                    addNotification({
                      type: "success",
                      title: "用户创建成功",
                      message: "新用户已成功添加到系统",
                    })
                    setIsDialogOpen(false)
                  }}
                >
                  创建用户
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">+2 较上周</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">+1 较上周</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">需要处理</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理员</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</div>
            <p className="text-xs text-muted-foreground">系统管理员</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>查看和管理所有系统用户</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* 用户表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户信息</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role === "admin" ? "超级管理员" : user.role === "manager" ? "管理员" : "普通用户"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status === "active" ? "活跃" : user.status === "inactive" ? "非活跃" : "待审核"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
