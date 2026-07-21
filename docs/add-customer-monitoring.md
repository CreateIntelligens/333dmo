# 新增客戶 Monitoring SOP

本文件說明如何讓新的 line-crm 客戶把 API 操作紀錄送到 333dmo。

## 架構

```text
客戶 line-crm API
  -> ApiActivityLog middleware
  -> HTTP POST /api/v1/logs
  -> 333dmo PostgreSQL
  -> Dashboard tenant filter
```

333dmo 不需要，也不應該連線到客戶 line-crm 的資料庫。每個客戶只用 `X-Tenant-Id` 分流。

## Monitoring 行為

`ApiActivityLog` 會追蹤 API middleware stack 中的請求，並送出：

| 欄位 | 說明 |
|---|---|
| `tenant_id` | 由 `MONITORING_TENANT_ID` 決定 |
| `user_id` | 優先取 `$request->user()?->id`，再取 `current_user_id`、`client_user` |
| `permission` | route name 或 controller/method 推導出的功能名稱 |
| `method` | HTTP method |
| `endpoint` | API path |
| `status_code` | 原始 API response status |
| `metadata` | IP 與 User-Agent |

下列路徑會被排除：`health`、`token`、`token/refresh`、`token/revoke`、`run-migrate`、`ws-test`。

Middleware 在 Laravel response object 產生後直接 POST 到 333dmo，timeout 為 3 秒。監控服務故障不會改變原 API response，但同步 POST 可能讓請求完成時間增加最多約 3 秒。

### 暫停某客戶的 monitoring

在該客戶 runtime `.env` 清空 URL 即可暫停推送：

```env
MONITORING_API_URL=
```

修改後必須重建或重啟使用該 `.env` 的容器。不要用停止 queue worker 的方式暫停，因為目前推送不是透過 queue `dispatch()`。

## 開始前確認

先準備以下資料：

| 項目 | 範例 |
|---|---|
| line-crm branch | `new-customer` |
| 客戶主機 SSH | `ec2-user@new-customer.example.com` |
| line-crm 路徑 | `/srv/line-crm` |
| tenant id | `new-customer` |
| 對外 API domain | `line.new-customer.example.com` |

### Tenant 命名規則

- 使用穩定、全小寫、只含英數字與 `-` 的值。
- 通常與 branch 名稱相同，例如 branch `fm-mart` 使用 tenant `fm-mart`。
- 一旦有資料進入 333dmo，不要任意更改 tenant id；更改會造成資料被分到另一個客戶。

## 1. 套用 line-crm monitoring code

如果客戶 branch 尚未有 monitoring，從 `develop` cherry-pick 以下 commits：

```bash

git -C "/path/to/line-crm-<customer-branch>" cherry-pick \
  bd0323ac \
  52c638e7 \
  2857dc8a \
  85072ea5 \
  41c0ee0f \
  e962c4fe
```

這 6 個 commits 包含：

- `ApiActivityLog` middleware
- middleware 註冊到 API middleware stack
- `config/monitoring.php` 與 logging channel
- 避免序列化 Request/Response
- 支援 `current_user_id`
- `user_id` 使用 string 型別

### 解 conflict 時要保留的內容

- 保留客戶 branch 原本的 `.env.example` 區塊，再加入 monitoring 區塊。
- 保留客戶 branch 原本的 `bootstrap/app.php` 設定，再把 `ApiActivityLog::class` 加入 API middleware。
- 不要刪除既有 alias、route、第三方 middleware 或客戶專用設定。

確認以下內容存在：

```bash
grep -n "ApiActivityLog" bootstrap/app.php
grep -n "current_user_id" app/Http/Middleware/ApiActivityLog.php
grep -n "MONITORING" .env.example config/monitoring.php
```

## 2. 確認 CI 會建置與部署這個 branch

`.gitlab-ci.yml` 必須同時包含客戶 branch：

- `build:amd64` 的 `only`
- `build:arm64` 的 `only`
- `manifest` 的 `only`
- 對應客戶主機的 deploy job

Deploy job 必須指向正確的 host 與 path：

```yaml
  extends: .deploy-aws-ec2-template
  only:
    - new-customer
  variables:
    EC2_HOST: "new-customer.example.com"
    EC2_USER: "ec2-user"
    PROJECT_PATH: "/srv/line-crm/"
```

注意：有些 UAT 或 production deploy job 設為 `when: manual`。這代表 push branch 後只會建 image，不會自動部署，必須在 GitLab 手動執行 deploy job。

Push branch：

```bash
```

## 3. 設定客戶主機 env

Monitoring 設定要放在容器掛載的實際 `.env`，不要只改 repository 的 `.env.example`。

```bash
ssh <user>@<customer-host>

sudo sh -c '
for entry in \
  "MONITORING_API_URL=http://office.fanpokka.ai:3100" \
  "MONITORING_API_KEY=<從安全的 secret 管理取得>" \
  "MONITORING_TENANT_ID=<tenant-id>"; do
  key=${entry%%=*}
  if grep -q "^${key}=" /srv/line-crm/src/.env; then
    sed -i "s#^${key}=.*#${entry}#" /srv/line-crm/src/.env
  else
    printf "%s\n" "${entry}" >> /srv/line-crm/src/.env
  fi
'
```

### 安全規則

- 不要把 `MONITORING_API_KEY` 寫進 git、`.env.example`、README 或聊天紀錄。
- 不要把客戶資料庫密碼、JWT secret 或 cloud credentials 放進本文件。
- 只有部署主機的 runtime `.env` 應該持有 API key。

## 4. 部署 image

優先使用 immutable commit tag，例如 `new-customer-a1b2c3d`，不要只依賴可變的 `new-customer-latest`。

如果 compose 透過 `${IMAGE_TAG}`，使用既有 deploy script：

```bash
sudo bash /srv/line-crm/deploy.sh new-customer-a1b2c3d
```

或：

```bash
sudo docker compose --env-file /srv/line-crm/.env.compose \
  -f /srv/line-crm/docker-compose.yaml \
  up -d --pull always
```

如果 compose 把 image tag 寫死成 `customer-latest`，CI 的 immutable tag 不會被套用。應先把 compose 改成：

```yaml
image: asia-east1-docker.pkg.dev/wonderland-nft/aitago/linebot:${IMAGE_TAG:-customer-latest}
```

### Registry 權限

主機必須能 pull Artifact Registry image。先測試：

```bash
sudo docker pull asia-east1-docker.pkg.dev/wonderland-nft/aitago/linebot:<image-tag>
```

如果出現：

```text
Unauthenticated request
```

這是 registry 權限問題，不是 line-crm 應用故障。先替主機設定正確的 Artifact Registry credential，再重跑 deploy。

## 5. 驗證部署

### 驗證容器版本

```bash
sudo docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

所有 line-crm app、Horizon、scheduler、Reverb 容器都應該使用同一個新 image tag。

### 驗證 middleware 與 env

```bash
sudo docker exec linebot sh -lc \
  'grep -n "current_user_id" app/Http/Middleware/ApiActivityLog.php; \
   grep -n "MONITORING_TENANT_ID" /var/www/html/.env'
```

### 觸發測試請求

使用客戶真正的 line-crm API domain，不要使用前端 domain：

```bash
curl -k -s -o /dev/null -w '%{http_code}' \
  https://line.<customer-host>/api/line_users
```

未登入時收到 `401` 是預期結果；這個請求仍會被 monitoring middleware 記錄。

### 在 333dmo 確認資料

```bash
curl -s 'http://office.fanpokka.ai:3100/api/v1/logs?limit=5' \
  -H 'X-Tenant-Id: <tenant-id>' \
  -H 'X-API-Key: <從安全的 secret 管理取得>'
```

回應中的 `tenantId` 必須是新客戶 tenant。確認後到 Dashboard 左側「客戶」選擇同一個 tenant。

## 常見問題

### Dashboard 有客戶，但沒有即時資料

依序檢查：

1. 客戶 host 是否真的跑新 image，而不是舊的 `*-latest`。
2. runtime `.env` 的 `MONITORING_API_URL` 是否指向 `http://office.fanpokka.ai:3100`。
3. `MONITORING_API_KEY` 是否正確。
4. `MONITORING_TENANT_ID` 是否與 Dashboard 選擇完全相同。
5. 從客戶 API domain 觸發請求，而不是前端 domain。
6. 客戶主機是否能連到 `office.fanpokka.ai:3100`。

### `user_id` 是 null

line-crm 的 `AuthJWTCheck` 會把 user id 放進 request 的 `current_user_id`，不是 Laravel 預設的 `$request->user()`。確認 middleware 是最新版本，並使用已登入請求測試。

未登入的測試請求出現 `user_id: null` 是正常的；要驗證 user id，必須使用真實登入後的 API 請求。

### CI pipeline 紅色

先分辨是 build、manifest 還是 deploy job：

- build/manifest 失敗：image 尚未產出，不能部署。
- deploy 失敗但服務仍正常：常見是 SSH、registry 權限、host/path 或 compose tag 問題。
- `when: manual` 的 job 不會因 push 自動執行。

不要只看 pipeline 紅色就判定客戶服務故障；要另外確認容器狀態與實際 API response。

## 完成條件

新增客戶只有在以下全部完成後才算完成：

- monitoring code 已進入客戶 branch。
- CI build/manifest 成功。
- 正確主機的 runtime `.env` 已設定。
- 客戶主機已使用新 image 重建。
- 測試 API 請求已在 333dmo 出現。
- Dashboard 可以切換到新 tenant 並看到資料。
