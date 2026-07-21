# 333dmo — B2B 使用狀況監控平台

追蹤 B2B 客戶在管理後台的操作行為：登入、功能使用頻率、操作路徑、使用趨勢。

## 架構

```
┌─────────────────────────────────────────────────────────┐
│  line-crm (Laravel)                                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ApiActivityLog Middleware                        │  │
│  │                                                   │  │
│  │  API Request → 擷取 user_id, permission, endpoint │  │
│  │             → HTTP POST 到監控 App                 │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │  POST /api/v1/logs
                         ▼
┌─────────────────────────────────────────────────────────┐
│  333dmo — 監控 App (Node.js + Fastify)                  │
│                                                         │
│  ┌──────────────┐                                       │
│  │  API Layer   │  POST /api/v1/logs    ← 接收 log     │
│  │  (Fastify)   │  GET  /api/v1/stats   ← 查詢統計     │
│  └──────┬───────┘                                       │
│         │                                               │
│  ┌──────▼───────┐  ┌──────────────────┐                │
│  │  PostgreSQL   │  │  Socket.io       │                │
│  │  (儲存 log)   │  │  (即時推播)       │                │
│  └──────────────┘  └────────┬─────────┘                │
│                             │                          │
└─────────────────────────────┼──────────────────────────┘
                              │  WebSocket
                              ▼
┌─────────────────────────────────────────────────────────┐
│  Dashboard (React + Vite)                               │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 即時     │ │ 功能     │ │ 使用者   │ │ 趨勢     │   │
│  │ 活動串流 │ │ 使用頻率 │ │ 活動分析 │ │ 分析     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 資料流

```
B2B 客戶操作管理後台
    │
    ▼
前端 SPA 呼叫 API
    │
    ▼
line-crm API（Laravel）
    │
    ├─→ 執行業務邏輯
    │
    └─→ Middleware 攔截
         │
         │  擷取：user_id, permission, endpoint, method,
         │        status_code, timestamp, metadata
         │
         │  HTTP POST（非同步，不影響原 API 回應）
         ▼
    監控 App API（Fastify）
         │
         ├─→ 寫入 PostgreSQL
         │
         └─→ Socket.io 廣播到 Dashboard
              │
              ▼
         Dashboard 即時更新
```

## 技術棧

| 層級 | 技術 | 用途 |
|------|------|------|
| Agent 端 | Laravel Middleware | line-crm 內攔截 API 請求並推送 log |
| Backend | Fastify 5 + TypeScript | 高效能 API server |
| DB | PostgreSQL | 儲存 activity logs + 統計資料 |
| 即時通訊 | Socket.io 4 | WebSocket 即時推播到 Dashboard |
| 前端 | React 19 + Vite | Dashboard SPA |
| 圖表 | Recharts + Chart.js | 視覺化 |
| UI | Tailwind CSS + shadcn/ui | 元件庫 |
| 狀態管理 | TanStack Query + Zustand | 伺服器/客戶端狀態 |
| 套件管理 | pnpm workspace | Monorepo 管理 |

## 可追蹤的問題

| 問題 | 查詢方式 |
|------|----------|
| 登入了沒 | 查詢 `token` endpoint 的呼叫紀錄 |
| 用了哪些功能 | group by `permission` 欄位 |
| 使用頻率 | count by `permission` + time range |
| 操作路徑 | 按 `user_id` + `timestamp` 排序 |
| 哪些功能很少人用 | permission count ASC |
| 哪些客戶在用 | group by `tenant_id` |
| 高峰時段 | count by `created_at` hour |

## 快速開始

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

### 安裝

```bash
# 安裝所有依賴
pnpm install

# 啟動 PostgreSQL + Redis
docker compose up -d

# 設定環境變數
cp packages/server/.env.example packages/server/.env

# 執行 migrations
cd packages/server
pnpm drizzle-kit push

# 啟動 dev server
pnpm dev
```

### Dashboard

```bash
cd packages/web
pnpm dev
```

## API

### 接收 Log（Agent 端呼叫）

```
POST /api/v1/logs
Content-Type: application/json
X-API-Key: <api_key>

{
  "tenant_id": "family",
  "user_id": "admin_001",
  "permission": "campaign_manage",
  "method": "POST",
  "endpoint": "/api/campaigns",
  "status_code": 200,
  "metadata": {
    "ip": "1.2.3.4",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### 查詢統計

```
GET /api/v1/stats/usage?tenant_id=family&period=7d
GET /api/v1/stats/features?tenant_id=family
GET /api/v1/stats/users?tenant_id=family
GET /api/v1/logs?tenant_id=family&limit=100
```

## 部署

### Docker 部署（推薦）

```bash
# 設定環境變數
cp packages/server/.env.example packages/server/.env
vim packages/server/.env

# 建置並啟動所有服務
docker compose up -d --build

# 確認服務狀態
docker compose ps

# 查看 log
docker compose logs -f server
```

服務將在以下 port 啟動：

| 服務 | Port | 說明 |
|------|------|------|
| Web (nginx) | 8090 | Dashboard 前端 + 反向代理 API |
| Server (Fastify) | 3100 | API 後端（不對外） |
| PostgreSQL | 5432 | 資料庫 |
| Redis | 6379 | 快取 |

**存取方式**：瀏覽器開啟 `http://<host>:8090`，nginx 會自動將 `/api/*` 請求 proxy 到 Fastify (3100)。使用者只需記住一個 port 8090。

### 開發模式

```bash
# 安裝依賴
pnpm install

# 啟動 PostgreSQL + Redis
docker compose up -d postgres redis

# 啟動後端
cd packages/server
pnpm dev

# 啟動前端（另一個 terminal）
cd packages/web
pnpm dev
```

## 專案結構

```
333dmo/
├── packages/
│   ├── server/                 # Fastify backend
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config/
│   │   │   ├── db/             # Drizzle schema + migrations
│   │   │   ├── routes/
│   │   │   ├── plugins/
│   │   │   └── jobs/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                    # React + Vite frontend
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── stores/
│       │   └── lib/
│       ├── Dockerfile
│       ├── nginx.conf
│       ├── package.json
│       └── vite.config.ts
│
├── docs/                       # 文件
│   └── line-crm-integration.md # line-crm 串接指南
├── docker-compose.yml
├── package.json                # pnpm workspace root
└── README.md
```

## Laravel Agent 端設定

在 line-crm 的 `app/Http/Kernel.php` 或 `bootstrap/app.php` 註冊 middleware：

```php
// 在 API routes 套用
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(append: [
        \App\Http\Middleware\ApiActivityLog::class,
    ]);
})
```

Middleware 內容：

```php
class ApiActivityLog
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // 非同步推送，不影響原 API 回應
        dispatch(fn() => $this->pushLog($request, $response));

        return $response;
    }

    private function pushLog(Request $request, $response): void
    {
        Http::withoutVerifying()
            ->timeout(3)
            ->post(config('monitoring.api_url') . '/api/v1/logs', [
                'tenant_id'   => $request->user()?->tenant_id,
                'user_id'     => $request->user()?->id,
                'permission'  => $this->getPermission($request),
                'method'      => $request->method(),
                'endpoint'    => $request->path(),
                'status_code' => $response->getStatusCode(),
            ]);
    }
}
```

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This means you are free to:
- Use, study, and modify this software
- Run it for any purpose (including commercial)

Under the conditions that:
- If you modify and distribute this software, you must release the source code under the same license
- If you use this software as a network service (SaaS), you must make the source code available to users interacting with it over the network
- You must include the original copyright notice and license

See [LICENSE](LICENSE) for the full license text.

For more information about AGPL-3.0, visit: https://www.gnu.org/licenses/agpl-3.0.html
