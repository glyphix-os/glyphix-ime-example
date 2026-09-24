#!/usr/bin/env bash
#
# add-ime.sh —— 为 Glyphix Js App 接入输入法（Glyphix Board）
#
# 用法（在宿主项目根目录执行，不需要任何参数）：
#   curl -fsSL https://raw.githubusercontent.com/glyphix-os/glyphix-ime-example/master/script/add-ime.sh | bash
#
# 脚本只做两件事：
#   1. 在当前目录生成 glyphix-workspace.yaml
#   2. 安装 glyphix / glyphix-utils / ts-node
#
set -e

IME_GIT_URL='https://github.com/glyphix-os/glyphix-ime-example.git'
WORKSPACE_FILE='glyphix-workspace.yaml'

if [ ! -f package.json ]; then
  echo '[ime] 当前目录没有 package.json，请在项目根目录执行' >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo '[ime] 未检测到 node / npm，请先安装 Node.js' >&2
  exit 1
fi

if [ -f "$WORKSPACE_FILE" ]; then
  echo "[ime] $WORKSPACE_FILE 已存在，跳过"
else
  printf 'packages:\n- git: %s\n  commit: master\n- .\n' "$IME_GIT_URL" >"$WORKSPACE_FILE"
  echo "[ime] 已生成 $WORKSPACE_FILE"
fi

echo '[ime] 安装依赖 glyphix glyphix-utils ts-node ...'
npm install --save-dev glyphix glyphix-utils ts-node </dev/null

echo '[ime] 完成'
