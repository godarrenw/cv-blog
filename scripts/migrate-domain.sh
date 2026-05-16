#!/usr/bin/env bash
# migrate-domain.sh — 将 zhuyzh.cn 从旧项目迁移到 cv-blog
# 用法: export CLOUDFLARE_API_TOKEN=<token> && bash scripts/migrate-domain.sh
# Token 要求: Account > Cloudflare Pages > Edit 权限
set -euo pipefail

# ── 配置 ────────────────────────────────────────────────────────────────────
ACCOUNT_ID="890302dd848f7702b490d8a2bed9de73"
DOMAIN="zhuyzh.cn"
OLD_PROJECT="my-website"
NEW_PROJECT="cv-blog"
API="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID"

# ── 检测 token ───────────────────────────────────────────────────────────────
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "错误: 请先 export CLOUDFLARE_API_TOKEN=<your_token>"
  echo ""
  echo "Token 创建步骤:"
  echo "  1. 打开 https://dash.cloudflare.com/profile/api-tokens"
  echo "  2. Create Token → 选择 'Edit Cloudflare Workers' 模板"
  echo "  3. Account Resources 选择你的账号"
  echo "  4. Continue to summary → Create Token"
  echo ""
  echo "注意: wrangler 的 OAuth token 无法直接调用 REST API，需要单独创建 API token。"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# ── 辅助函数 ─────────────────────────────────────────────────────────────────
check_success() {
  local response="$1"
  local step="$2"
  local ok
  ok=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))" 2>/dev/null || echo "false")
  if [ "$ok" != "True" ] && [ "$ok" != "true" ]; then
    echo "失败 [$step]:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    exit 1
  fi
}

echo "==============================="
echo " cv-blog 域名迁移脚本"
echo " 域名: $DOMAIN"
echo " 源项目: $OLD_PROJECT → 目标: $NEW_PROJECT"
echo "==============================="
echo ""

# ── 1/4 验证目标项目存在 ──────────────────────────────────────────────────────
echo "1/4 验证目标项目 $NEW_PROJECT 存在..."
RESP=$(curl -fsS -H "$AUTH_HEADER" "$API/pages/projects/$NEW_PROJECT")
check_success "$RESP" "验证目标项目"
echo "    OK — $NEW_PROJECT 存在"

# ── 2/4 从旧项目移除域名 ──────────────────────────────────────────────────────
echo "2/4 从旧项目 $OLD_PROJECT 移除 $DOMAIN..."
RESP=$(curl -fsS -X DELETE -H "$AUTH_HEADER" \
  "$API/pages/projects/$OLD_PROJECT/domains/$DOMAIN")
check_success "$RESP" "移除旧域名"
echo "    OK — 已从 $OLD_PROJECT 解绑"

# ── 3/4 等待释放 ──────────────────────────────────────────────────────────────
echo "3/4 等待 5 秒让 Cloudflare 释放域名..."
sleep 5

# ── 4/4 绑定到新项目 ──────────────────────────────────────────────────────────
echo "4/4 将 $DOMAIN 添加到新项目 $NEW_PROJECT..."
RESP=$(curl -fsS -X POST -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$DOMAIN\"}" \
  "$API/pages/projects/$NEW_PROJECT/domains")
check_success "$RESP" "绑定新域名"
echo "    OK — $DOMAIN 已绑定到 $NEW_PROJECT"

echo ""
echo "完成！请等 1-2 分钟 DNS 生效后访问 https://$DOMAIN"
echo ""
echo "验证命令:"
echo "  curl -I https://$DOMAIN | grep -i 'cf-cache\\|server\\|location'"
