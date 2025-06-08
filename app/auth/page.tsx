import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">用户认证系统</h1>
        <p className="text-muted-foreground mt-2">管理用户注册、登录和权限控制</p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">用户登录</TabsTrigger>
          <TabsTrigger value="register">用户注册</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>用户登录</CardTitle>
              <CardDescription>输入您的账号信息进行登录</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址</Label>
                <Input id="email" type="email" placeholder="请输入邮箱地址" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="请输入密码" />
              </div>
              <Button className="w-full">登录</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>用户注册</CardTitle>
              <CardDescription>创建新的用户账号</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" placeholder="请输入用户名" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">邮箱地址</Label>
                <Input id="reg-email" type="email" placeholder="请输入邮箱地址" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">密码</Label>
                <Input id="reg-password" type="password" placeholder="请输入密码" />
              </div>
              <Button className="w-full">注册</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
