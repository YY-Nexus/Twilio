"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

// 支持的编程语言
const LANGUAGES = [
  { id: "javascript", name: "JavaScript", icon: "JS" },
  { id: "python", name: "Python", icon: "PY" },
  { id: "java", name: "Java", icon: "JV" },
  { id: "csharp", name: "C#", icon: "C#" },
  { id: "php", name: "PHP", icon: "PHP" },
  { id: "curl", name: "cURL", icon: "cURL" },
]

// 代码示例生成器
function generateCode(language: string, endpoint: any) {
  const { method, path, params = [] } = endpoint
  const baseUrl = "https://api.example.com"
  const fullUrl = `${baseUrl}${path}`

  // 构建请求体示例
  const requestBody = params
    .filter((p: any) => p.required && ["POST", "PUT", "PATCH"].includes(method))
    .reduce((acc: any, param: any) => {
      if (param.type === "string") {
        acc[param.name] = "示例值"
      } else if (param.type === "number") {
        acc[param.name] = 123
      } else if (param.type === "boolean") {
        acc[param.name] = true
      } else if (param.type === "object") {
        acc[param.name] = { key: "value" }
      } else if (param.type === "array") {
        acc[param.name] = ["item1", "item2"]
      }
      return acc
    }, {})

  // 构建查询参数示例
  const queryParams = params
    .filter((p: any) => p.required && method === "GET")
    .reduce((acc: any, param: any, index: number) => {
      const prefix = index === 0 ? "?" : "&"
      if (param.type === "string") {
        acc += `${prefix}${param.name}=示例值`
      } else if (param.type === "number") {
        acc += `${prefix}${param.name}=123`
      } else if (param.type === "boolean") {
        acc += `${prefix}${param.name}=true`
      }
      return acc
    }, "")

  const urlWithParams = `${fullUrl}${queryParams}`

  // 根据不同语言生成代码
  switch (language) {
    case "javascript":
      return `// 使用 fetch API
async function call${method}Api() {
  const url = "${urlWithParams}"
  const options = {
    method: "${method}",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_TOKEN_HERE"
    }${
      ["POST", "PUT", "PATCH"].includes(method)
        ? `,
    body: JSON.stringify(${JSON.stringify(requestBody, null, 2)})`
        : ""
    }
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data)
    return data
  } catch (error) {
    console.error("API调用出错:", error)
    throw error
  }
}

// 调用函数
call${method}Api()`

    case "python":
      return `# 使用 requests 库
import requests
import json

def call_${method.toLowerCase()}_api():
    url = "${urlWithParams}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
    ${
      ["POST", "PUT", "PATCH"].includes(method)
        ? `payload = ${JSON.stringify(requestBody, null, 4).replace(/"/g, "'")}`
        : ""
    }
    
    try:
        ${
          ["POST", "PUT", "PATCH"].includes(method)
            ? `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)`
            : `response = requests.${method.toLowerCase()}(url, headers=headers)`
        }
        response.raise_for_status()  # 检查请求是否成功
        data = response.json()
        print(data)
        return data
    except requests.exceptions.RequestException as e:
        print(f"API调用出错: {e}")
        raise

# 调用函数
if __name__ == "__main__":
    call_${method.toLowerCase()}_api()`

    case "java":
      return `// 使用 Java 11+ HttpClient
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
${["POST", "PUT", "PATCH"].includes(method) ? `import java.nio.charset.StandardCharsets;` : ""}

public class ApiClient {
    public static void main(String[] args) {
        try {
            call${method}Api();
        } catch (Exception e) {
            System.err.println("API调用出错: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static void call${method}Api() throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();
            
        ${
          ["POST", "PUT", "PATCH"].includes(method)
            ? `String requestBody = ${JSON.stringify(JSON.stringify(requestBody))};
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${fullUrl}"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer YOUR_TOKEN_HERE")
            .${method.toLowerCase()}(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();`
            : `HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${urlWithParams}"))
            .header("Authorization", "Bearer YOUR_TOKEN_HERE")
            .GET()
            .build();`
        }
        
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
            
        System.out.println("状态码: " + response.statusCode());
        System.out.println("响应体: " + response.body());
    }
}`

    case "csharp":
      return `// 使用 .NET HttpClient
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

class Program
{
    static async Task Main()
    {
        try
        {
            await Call${method}ApiAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"API调用出错: {ex.Message}");
        }
    }
    
    static async Task Call${method}ApiAsync()
    {
        using (HttpClient client = new HttpClient())
        {
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", "YOUR_TOKEN_HERE");
                
            ${
              ["POST", "PUT", "PATCH"].includes(method)
                ? `var requestData = ${JSON.stringify(requestBody, null, 12)};
            var content = new StringContent(
                JsonSerializer.Serialize(requestData),
                Encoding.UTF8, 
                "application/json");
                
            HttpResponseMessage response = await client.${method}Async("${fullUrl}", content);`
                : `HttpResponseMessage response = await client.GetAsync("${urlWithParams}");`
            }
            
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            
            Console.WriteLine(responseBody);
        }
    }
}`

    case "php":
      return `<?php
// 使用 cURL
function call${method}Api() {
    $url = "${urlWithParams}";
    
    $curl = curl_init();
    
    $options = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "${method}",
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer YOUR_TOKEN_HERE"
        ],
    ];
    
    ${
      ["POST", "PUT", "PATCH"].includes(method)
        ? `$requestBody = ${JSON.stringify(JSON.stringify(requestBody, null, 2))};
    $options[CURLOPT_POSTFIELDS] = $requestBody;`
        : ""
    }
    
    curl_setopt_array($curl, $options);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    curl_close($curl);
    
    if ($err) {
        echo "API调用出错: " . $err;
    } else {
        echo $response;
    }
}

// 调用函数
call${method}Api();
?>`

    case "curl":
      return `# 使用 cURL 命令行
curl -X ${method} \\
  "${urlWithParams}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ${
    ["POST", "PUT", "PATCH"].includes(method)
      ? `\\
  -d '${JSON.stringify(requestBody, null, 2)}'`
      : ""
  }`

    default:
      return "// 暂不支持该编程语言的代码示例"
  }
}

export function CodeExamples({ endpoint }: { endpoint: any }) {
  const [activeLanguage, setActiveLanguage] = useState(LANGUAGES[0].id)
  const [copied, setCopied] = useState(false)

  // 复制代码到剪贴板
  const copyCode = () => {
    const code = generateCode(activeLanguage, endpoint)
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">代码示例</h3>
        <Button variant="outline" size="sm" onClick={copyCode}>
          <Copy className="h-4 w-4 mr-2" />
          {copied ? "已复制" : "复制代码"}
        </Button>
      </div>

      <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
        <TabsList className="mb-4">
          {LANGUAGES.map((lang) => (
            <TabsTrigger key={lang.id} value={lang.id}>
              {lang.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {LANGUAGES.map((lang) => (
          <TabsContent key={lang.id} value={lang.id}>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              <code>{generateCode(lang.id, endpoint)}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
