# Glyphix Board · 手表输入法

基于 **Glyphix UX 单文件组件 + TypeScript** 实现的智能手表输入法（IME）应用：多语言键盘布局、候选词联想、词库管理与语言切换。

## 快速开始

前置要求：Node.js、包管理器（npm / yarn / pnpm，**避免使用 cnpm**）、Glyphix 工具链。
VS Code 需安装 **glyphix** 插件，并**卸载 Vue 插件**（两者配置冲突）。

```bash
yarn install

# 模拟器运行
gx emu
# 指定设备运行 / 打包（产物位于 .glyphix-work/dist/<device>/<package>/）
gx emu -d <device>
gx build -d <device>
gx list device          # 查看可用设备
```

环境变量（`.env` / `.env.development` / `.env.production`，由工具链在构建时读取）：

| 变量 | 作用 |
| --- | --- |
| `GLYPHIX_ENV` | 构建环境标识（`development` / `production`） |
| `GLYPHIX_DEBUG` | 日志裁剪等级（`trace`/`debug`/`info`/`warn`/`error`）：移除低于该等级的 `console.*` 调用，未匹配则不裁剪 |
| `GLYPHIX_EMU_LAUNCHER` | 为 `true` 时，退出应用改为跳回启动器（模拟器调试用） |
