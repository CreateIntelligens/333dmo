const permissionLabels: Record<string, string> = {
  // ── 分析報表 ──
  'metrics.line': '成效儀表板',
  'metrics.aitago': 'Aitago 指標',
  'metrics.short_url': '短網址分析',
  'metrics.user_tagging': '標籤分析',
  'metrics.user_languages': '語言分析',

  // ── 行銷工具 > 訊息管理（群發） ──
  'campaigns.index': '訊息管理',
  'campaigns.store': '建立訊息',
  'campaigns.show': '訊息詳情',
  'campaigns.update': '編輯訊息',
  'campaigns.destroy': '刪除訊息',
  'campaigns.log.index': '群發訊息分析',
  'campaigns.retry_failed_batches': '重試失敗批次',

  // ── 行銷工具 > 自動回覆 ──
  'keywords.index': '自動回覆',
  'keywords.store': '建立自動回覆',
  'keywords.show': '自動回覆詳情',
  'keywords.update': '編輯自動回覆',
  'keywords.destroy': '刪除自動回覆',
  'keywords.answer': '取得回覆',
  'keywords.exists': '檢查關鍵字',

  // ── 行銷工具 > 圖文選單 ──
  'rich_menus.index': '圖文選單',
  'rich_menus.store': '建立圖文選單',
  'rich_menus.show': '圖文選單詳情',
  'rich_menus.update': '編輯圖文選單',
  'rich_menus.destroy': '刪除圖文選單',
  'rich_menus.set_default': '設為預設選單',
  'rich_menus.assign_to_user': '指派給使用者',

  // ── 行銷工具 > 觸發器腳本 ──
  'marketing_scripts.index': '觸發器腳本',
  'marketing_scripts.store': '建立觸發器',
  'marketing_scripts.show': '觸發器詳情',
  'marketing_scripts.update': '編輯觸發器',
  'marketing_scripts.destroy': '刪除觸發器',
  'marketing_scripts.statistics': '觸發器統計',
  'marketing_scripts.send_records': '發送記錄',

  // ── 行銷工具 > 優惠碼管理 ──
  'coupons.index': '優惠碼管理',
  'coupons.store': '建立優惠碼',
  'coupons.show': '優惠碼詳情',
  'coupons.update': '編輯優惠碼',
  'coupons.destroy': '刪除優惠碼',
  'coupons.categories': '優惠券分類',
  'coupons.codes': '優惠碼列表',
  'coupon_codes.redeem': '兌換優惠碼',

  // ── 行銷工具 > 短連結產生器 ──
  'short_urls.index': '短連結產生器',
  'short_urls.store': '建立短連結',
  'short_urls.show': '短連結詳情',
  'short_urls.update': '編輯短連結',
  'short_urls.destroy': '刪除短連結',
  'short_urls.transfer': '短連結轉址',

  // ── 行銷工具 > 集點活動 ──
  'point_activities.index': '集點活動',
  'point_activities.store': '建立集點活動',
  'point_activities.show': '集點活動詳情',
  'point_activities.update': '編輯集點活動',
  'point_activities.dashboard': '集點活動統計',
  'point_activities.qr_codes.index': 'QR Code 管理',
  'point_activities.checkin_spots.index': '打卡點管理',

  // ── 會員管理 > 會員名單 ──
  'line_users.index': '會員名單',
  'line_users.show': '會員詳情',
  'line_users.update': '編輯會員',
  'line_users.export': '匯出會員',
  'line_users.tagging_tag': '標籤標記',
  'line_users.batch_tagging_tag': '批次標記',
  'line_users.get_profile': '取得 LINE Profile',
  'line_users.update_profile': '更新 Profile',
  'line_users.check_binding': '檢查綁定狀態',

  // ── 會員管理 > 受眾管理 ──
  'audiences.index': '受眾管理',
  'audiences.store': '建立受眾',
  'audiences.show': '受眾詳情',
  'audiences.update': '編輯受眾',
  'audiences.destroy': '刪除受眾',
  'audiences.save_bulk': '批次儲存受眾',
  'audiences.export_users': '匯出受眾',

  // ── 會員管理 > 標籤管理 ──
  'tags.index': '標籤管理',
  'tags.store': '建立標籤',
  'tags.show': '標籤詳情',
  'tags.destroy': '刪除標籤',
  'tags.exists': '檢查標籤',
  'tags.store_bulk': '批次建立標籤',
  'tags.admin_list': '管理標籤列表',

  // ── 訊息中心 ──
  'conversations.index': '聊天室列表',
  'conversations.messages': '聊天訊息',
  'conversations.sendMessage': '發送訊息',
  'conversations.update': '更新聊天室',
  'conversations.export': '匯出聊天記錄',
  'messages.index': '訊息記錄',
  'messages.update': '編輯訊息',
  'messages.share': '分享訊息',
  'messages.flex_snapshots.show': 'Flex Message 快照',

  // ── 帳號管理 > 帳號列表 ──
  'users.senders.index': '帳號列表',
  'users.senders.replace': '替換發送者',
  'users.senders.add': '新增發送者',
  'users.senders.delete_specific': '刪除發送者關聯',
  'users.senders.delete_all': '刪除所有發送者',

  // ── 帳號管理 > 身份管理 ──
  'senders.index': '身份管理',
  'senders.store': '建立身份',
  'senders.show': '身份詳情',
  'senders.update': '編輯身份',
  'senders.destroy': '刪除身份',

  // ── 帳號管理 > 角色權限管理 ──
  'authorization.get_permissions': '角色權限',
  'authorization.roles': '角色管理',
  'authorization.create_role': '建立角色',
  'authorization.delete_role': '刪除角色',
  'authorization.sync_permissions': '同步權限',
  'authorization.user_roles': '使用者角色',
  'authorization.assign_user_role': '指派角色',
  'authorization.assign_permission_to_role': '指派權限',

  // ── 設定 ──
  'liff.gateway.apps': 'LIFF 網址管理',
  'tenant_settings.index': '回應設置',
  'tenant_settings.update': '更新設定',
  'tenant_settings.reset': '重置設定',
  'tenant_settings.clear_cache': '清除快取',

  // ── 素材管理 ──
  'materials.index': '素材管理',
  'materials.store': '建立素材',
  'materials.show': '素材詳情',
  'materials.update': '編輯素材',
  'materials.destroy': '刪除素材',
  'materials.convert_line_message': '轉換 LINE 訊息',

  // ── 開發工具 > 模板管理 ──
  'templates.index': '模板管理',
  'templates.store': '建立模板',
  'templates.show': '模板詳情',
  'templates.update': '編輯模板',
  'templates.destroy': '刪除模板',
  'template-sync.bucket-data': '同步 GCS 資料',
  'template-sync.sync-from-gcs': '從 GCS 同步',

  // ── 其他功能 ──
  'invite.index': '會員增粉',
  'invite.store': '建立增粉活動',
  'invite.publish': '發布增粉',
  'invite.share': '分享增粉',
  'poll.index': '投票管理',
  'poll.store': '建立投票',
  'poll.publish': '發布投票',
  'playground.index': '遊樂場',
  'playground.draw': '抽獎',
  'lottery_activities.index': '抽獎活動',
  'lottery_activities.draw': '執行抽獎',
  'notes.index': '筆記',
  'images.generate': 'AI 圖片生成',
  'images.edit': 'AI 圖片編輯',
  'images.logs': 'AI 圖片紀錄',
  'images.purchases': 'AI 圖片購買',
  'avatar.generate': '頭像生成',
  'mbti.generate': 'MBTI 頭像',
  'file_upload.store': '檔案上傳',
  'locales.index': '語言列表',
};

export function getPermissionLabel(permission: string | null): string {
  if (!permission) return '—';
  return permissionLabels[permission] || permission;
}

export default permissionLabels;
