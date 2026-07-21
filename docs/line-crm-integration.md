# line-crm 串接 333dmo 監控 App 指導文件

本文檔說明如何在 line-crm（Laravel）中加入 API 活動追蹤，將 B2B 客戶的操作行為推送到 333dmo 監控平台。

## 改動摘要

### 新增檔案

| 檔案 | 用途 |
|------|------|
| `app/Http/Middleware/ApiActivityLog.php` | Middleware，攔截 API 請求並推送到監控 App |
| `config/monitoring.php` | 監控 App 連線設定 |

### 修改檔案

| 檔案 | 改動 |
|------|------|
| `bootstrap/app.php` | 加入 ApiActivityLog middleware 註冊 |
| `config/logging.php` | 加入 monitoring log channel |
| `.env.example` | 加入 MONITORING_* 環境變數 |

## 設定步驟

### Step 1: 設定環境變數

在 `.env` 中加入：

```env
# 監控 App（333dmo）設定
MONITORING_API_URL=http://你的監控App位址:3100
MONITORING_API_KEY=your-secret-api-key-here
MONITORING_TENANT_ID=family
```

**注意：** 每個 B2B 客戶的 `MONITORING_TENANT_ID` 要不同：

| 客戶 | TENANT_ID |
|------|-----------|
| 全家 | `family` |
| 大同 | `tatung` |
| SGS | `sgs` |

### Step 2: Middleware 已自動註冊

`bootstrap/app.php` 已加入：

```php
$middleware->api(
    append: [
        \App\Http\Middleware\RequestBooleanFieldsConverter::class,
        \App\Http\Middleware\FormatJsonResponse::class,
        \App\Http\Middleware\ApiActivityLog::class,  // ← 新增這行
    ]
);
```

所有 `/api/*` 請求都會自動被攔截並推送 log。

### Step 3: 驗證

重啟 Laravel 後，呼叫任一 API，然後檢查監控 App：

```bash
# 呼叫一個 API
curl http://localhost:8000/api/metrics/aitago

# 檢查監控 App 是否有收到
curl http://localhost:3100/api/v1/logs?limit=10 \
  -H "X-Tenant-Id: family" \
  -H "X-API-Key: your-secret-api-key-here"
```

## 運作原理

```
前端 SPA 呼叫 API
    │
    ▼
line-crm API（Laravel）
    │
    ├─→ 執行業務邏輯，回應前端
    │
    └─→ ApiActivityLog Middleware
         │
         │  dispatch() 非同步執行
         │  timeout: 3 秒
         │
         ▼
    POST http://監控App:3100/api/v1/logs
         │
         ▼
    監控 App 存入 PostgreSQL + WebSocket 廣播
```

## 追蹤的資料

每次 API 呼叫會推送以下欄位：

| 欄位 | 說明 | 範例 |
|------|------|------|
| `tenant_id` | 客戶識別碼 | `family` |
| `user_id` | 操作者 ID | `admin_001` |
| `permission` | API 權限/功能名稱 | `campaign_manage` |
| `method` | HTTP 方法 | `GET`, `POST`, `PUT`, `DELETE` |
| `endpoint` | API 路徑 | `api/campaigns` |
| `status_code` | HTTP 回應碼 | `200`, `401`, `500` |
| `metadata` | 補充資訊（IP, User-Agent） | JSON |

## 哪些 API 會被追蹤？

**會追蹤：** 所有 `/api/*` 請求（需要 JWT 驗證的）

**不會追蹤：**
- `POST /api/token` — 取得 token
- `POST /api/token/refresh` — 刷新 token
- `POST /api/token/revoke` — 銷毀 token
- `GET /up` — 健康檢查
- `GET /ws-test` — WebSocket 測試

## 如何暫停追蹤？

有三種方式：

### 方式一：清空 URL（推薦）
```env
MONITORING_API_URL=
```
Middleware 偵測到 URL 為空，就會跳過推送。

### 方式二：移除 middleware
在 `bootstrap/app.php` 移除 `\App\Http\Middleware\ApiActivityLog::class`

### 方式三：關閉 Laravel queue worker
如果 queue worker 關閉，dispatch 的 job 不會執行（但不建議用这种方式）

## 常見問題

### Q: 會影響 API 效能嗎？
**A:** 幾乎不會。Middleware 用 `dispatch()` 非同步執行，HTTP timeout 設定 3 秒。即使監控 App 掛了，原 API 不會受影響。

### Q: 監控 App 掛了怎麼辦？
**A:** 沒關係。推送到監控 App 失敗時，只會寫入 `storage/logs/monitoring.log`，不影響主業務。

### Q: 可以只追蹤特定 API 嗎？
**A:** 可以。修改 `ApiActivityLog.php` 的 `shouldTrack()` 方法，加入判斷邏輯。

### Q: 要怎麼在其他 B2B 客戶部署？
**A:** 只需修改 `.env` 的 `MONITORING_TENANT_ID`，其他設定都一樣。

### Q: middleware 放在哪個位置？
**A:** 放在 API middleware stack 的最後面，確保在 response 之後才推送。

## 檔案完整內容

### app/Http/Middleware/ApiActivityLog.php

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiActivityLog
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$this->shouldTrack($request)) {
            return $response;
        }

        dispatch(fn() => $this->pushLog($request, $response));

        return $response;
    }

    private function shouldTrack(Request $request): bool
    {
        $path = $request->path();
        $skipPatterns = ['health', 'token', 'token/refresh', 'token/revoke', 'run-migrate', 'ws-test'];

        foreach ($skipPatterns as $pattern) {
            if (str_starts_with($path, $pattern)) {
                return false;
            }
        }

        return true;
    }

    private function pushLog(Request $request, Response $response): void
    {
        try {
            $monitoringUrl = config('monitoring.api_url');

            if (empty($monitoringUrl)) {
                return;
            }

            Http::withoutVerifying()
                ->timeout(3)
                ->withHeaders([
                    'X-API-Key' => config('monitoring.api_key', ''),
                    'X-Tenant-Id' => config('monitoring.tenant_id', 'default'),
                    'Content-Type' => 'application/json',
                ])
                ->post($monitoringUrl . '/api/v1/logs', [
                    'user_id' => $request->user()?->id ?? $request->input('client_user'),
                    'permission' => $this->extractPermission($request),
                    'method' => $request->method(),
                    'endpoint' => $request->path(),
                    'status_code' => $response->getStatusCode(),
                    'metadata' => [
                        'ip' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ],
                ]);
        } catch (\Throwable $e) {
            Log::channel('monitoring')->error('Failed to push activity log', [
                'error' => $e->getMessage(),
                'endpoint' => $request->path(),
            ]);
        }
    }

    private function extractPermission(Request $request): ?string
    {
        $route = $request->route();

        if ($route) {
            $action = $route->getAction();
            if (isset($action['as'])) {
                return $action['as'];
            }
        }

        $controller = $request->route()?->getController();
        $method = $request->route()?->getActionMethod();

        if ($controller && $method) {
            $controllerClass = class_basename($controller);
            return strtolower(str_replace('Controller', '', $controllerClass) . '.' . $method);
        }

        return $request->path();
    }
}
```

### config/monitoring.php

```php
<?php

return [
    'api_url' => env('MONITORING_API_URL', 'http://localhost:3100'),
    'api_key' => env('MONITORING_API_KEY', ''),
    'tenant_id' => env('MONITORING_TENANT_ID', 'default'),
];
```
