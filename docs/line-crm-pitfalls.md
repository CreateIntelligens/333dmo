# line-crm 整合踩坑指南

在將333dmo監控整合到 line-crm（Laravel 12）時遇到的問題與解法。避免重蹈覆轍。

---

## 1. Fastify Plugin Scope

**問題：** 在 register 的 plugin 內用 `app.addHook('preHandler')`，hook 只作用於該 plugin 的 scope，不會攔截其他 plugin 的路由。

**解法：** 路由內聯 hook 或在 plugin 外層註冊。

---

## 2. pnpm latest 需要 Node.js 22+

**問題：** Dockerfile 用 `node:20-alpine`，`corepack prepare pnpm@latest --activate` 失敗。

**解法：** Dockerfile 改用 `node:22-alpine`。

---

## 3. EC2 Port 衝突

**問題：** 80, 3000, 8000, 8080 都被佔用。

**解法：** Dashboard 用 **8090**，API 用 **3100**。

---

## 4. Laravel dispatch() 序列化 Request/Response

**問題：** `dispatch(fn() => $this->pushLog($request, $response))` 會把 Request/Response 物件序列化進 queue，而 Laravel 的 Request 內含 PDO 連線，無法序列化。

**錯誤訊息：** `Serialization of 'Symfony\Component\HttpFoundation\InputBag' is not allowed` 或類似的 Closure 序列化錯誤。

**解法：** 不要用 `dispatch()`，直接在 middleware 中同步執行 HTTP POST。Middleware 本身已經在 response 之後執行，不會阻擋回應。

```php
// ❌ 錯誤：會序列化 Request/Response
dispatch(fn() => $this->pushLog($request, $response));

// ✅ 正確：直接執行（已是 response 後）
$this->pushLog($request, $response);
```

如果真的需要非同步，改用 `dispatch(new PushActivityLogJob(...))` 並在 Job 內只傳入必要的 scalar 值。

---

## 5. 誤刪 Import 導致 500

**問題：** 修序列化問題時不小心刪除了 `use Symfony\Component\HttpFoundation\Response`，導致所有 API 回傳 500。

**徵兆：** API 全部 500，但 `storage/logs/laravel.log` 沒有 error。

**解法：** 每次改完 middleware 後跑 `php -l app/Http/Middleware/ApiActivityLog.php` 檢查語法。

---

## 6. userId 型別不匹配

**問題：** `pushLog` 的 `$userId` 參數型別設為 `?int`，但 line-crm 回傳的是 string。

**徵兆：** log 推送失敗，監控 App 收不到資料。

**解法：** 型別改為 `?string`。

```php
// ❌ 錯誤
private function pushLog(Request $request, Response $response, ?int $userId): void

// ✅ 正確
private function pushLog(Request $request, Response $response, ?string $userId): void
```

---

## 7. AuthJWTCheck 的 User 不是 $request->user()

**問題：** line-crm 使用自訂的 `AuthJWTCheck` middleware，它把驗證後的 user 存在 `$request->input('current_user_id')`，不是 Laravel 預設的 `$request->user()`。

**徵兆：** `user_id` 欄位永遠是 null。

**解法：** 兩個來源都要檢查：

```php
$userId = $request->user()?->id
    ?? $request->input('current_user_id')
    ?? $request->input('client_user');
```

**關鍵：** 在修改任何 Laravel 專案的 middleware 前，先確認該專案的 auth middleware 實作方式。不同專案存放 user 的位置不同。

---

## 8. line-crm 部署流程

**流程：**
1. push to develop branch
2. GitLab CI 自動 build multi-arch image
3. Cloud Build deploy 到 feature.aitago.tw
4. 更新 `/srv/line-crm/.env.compose` 的 `IMAGE_TAG`
5. `docker compose --env-file .env.compose up -d --force-recreate --pull always`

**注意：** .env.compose 裡的 IMAGE_TAG 要手動更新，CI 不會改它。

---

## 9. 333dmo 部署流程

**流程：**
1. push to main branch (GitHub)
2. SSH 到 office.fanpokka.ai
3. `cd ~/333dmo && git pull && docker compose up -d --build web`

**注意：** web container rebuild 才會套用前端改動，server container 不會自動重啟。

---

## 10. Debug 技巧

```bash
# 檢查 middleware 是否正確載入
docker compose exec linebot php artisan route:list --path=api | head -20

# 檢查 monitoring config
docker compose exec linebot php artisan config:show monitoring

# 檢查 line-crm log 是否有 monitoring 錯誤
docker compose exec linebot tail -f storage/logs/laravel.log | grep monitoring

# 檢查333dmo是否收到資料
curl http://office.fanpokka.ai:3100/api/v1/logs \
  -H "X-Tenant-Id: develop" \
  -H "X-API-Key: 333dmo-secret-key-2026"

# 檢查333dmo DB 資料
docker compose exec postgres psql -U monitor -d monitor -c \
  "SELECT COUNT(*) FROM activity_logs WHERE tenant_id='develop';"
```
