const permissionLabels: Record<string, string> = {
  // Campaigns
  'campaigns.index': '群發分析',
  'campaigns.store': '建立群發',
  'campaigns.show': '群發詳情',
  'campaigns.update': '編輯群發',
  'campaigns.destroy': '刪除群發',
  'campaigns.log.index': '群發紀錄',

  // Materials
  'materials.index': '素材管理',
  'materials.show': '素材詳情',
  'materials.store': '建立素材',
  'materials.update': '編輯素材',
  'materials.destroy': '刪除素材',

  // Keywords
  'keywords.index': '關鍵字管理',
  'keywords.store': '建立關鍵字',
  'keywords.show': '關鍵字詳情',
  'keywords.update': '編輯關鍵字',
  'keywords.destroy': '刪除關鍵字',

  // Rich Menus
  'rich_menus.index': '選單管理',
  'rich_menus.show': '選單詳情',
  'rich_menus.store': '建立選單',
  'rich_menus.update': '編輯選單',
  'rich_menus.destroy': '刪除選單',

  // Senders
  'senders.index': '帳號管理',
  'senders.show': '帳號詳情',
  'senders.store': '建立帳號',
  'senders.update': '編輯帳號',
  'senders.destroy': '刪除帳號',

  // Coupons
  'coupons.index': '優惠券管理',
  'coupons.show': '優惠券詳情',
  'coupons.store': '建立優惠券',
  'coupons.update': '編輯優惠券',
  'coupons.destroy': '刪除優惠券',

  // Metrics
  'metrics.line': '成效儀表板',
  'metrics.aitago': 'Aitago 指標',
  'metrics.short_url': '短網址分析',
  'metrics.user_languages': '語言分析',
  'metrics.user_tagging': '標籤分析',

  // Marketing Scripts
  'marketing_scripts.index': '行銷腳本',
  'marketing_scripts.store': '建立腳本',
  'marketing_scripts.show': '腳本詳情',
  'marketing_scripts.update': '編輯腳本',
  'marketing_scripts.destroy': '刪除腳本',

  // Tags
  'tags.index': '標籤管理',
  'tags.store': '建立標籤',
  'tags.update': '編輯標籤',
  'tags.destroy': '刪除標籤',

  // Audiences
  'audiences.index': '受眾管理',
  'audiences.show': '受眾詳情',
  'audiences.store': '建立受眾',
  'audiences.update': '編輯受眾',

  // LIFF
  'liff_urls.index': 'LIFF 網址管理',

  // Point Activity
  'point_activity_dashboard': '集點活動',
  'point_activity_rules.index': '集點規則',

  // Short URLs
  'short_urls.index': '短網址管理',
  'short_urls.store': '建立短網址',
};

export function getPermissionLabel(permission: string | null): string {
  if (!permission) return '—';
  return permissionLabels[permission] || permission;
}

export default permissionLabels;
