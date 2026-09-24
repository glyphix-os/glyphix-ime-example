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


## Glyphix Js App 使用输入法

### 快速添加

在宿主项目根目录执行：

```bash
curl -fsSL https://raw.githubusercontent.com/glyphix-os/glyphix-ime-example/master/script/add-ime.sh | bash
```

脚本会自动生成 `glyphix-workspace.yaml` 并安装 `glyphix`、`glyphix-utils`、`ts-node`。

### 手动添加

- 在项目根目录添加 `glyphix-workspace.yaml` 文件, 内容如下

```
packages:
- git: https://github.com/glyphix-os/glyphix-ime-example.git
  commit: master
- .
```

- 安装依赖

使用 npm/yarn 安装

`npm install glyphix glyphix-utils ts-node -D`


## 运行模拟器

`gx emu`

首次运行需要从 `github` 拉取输入法应用，需要一些时间，取决于设备的网络情况