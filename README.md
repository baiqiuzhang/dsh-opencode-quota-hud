# dsh-opencode-quota-hud

> **衍生版声明**：本项目是 [`dsh-opencode-usage-settings`](https://www.npmjs.com/package/dsh-opencode-usage-settings)（作者锈者之家，MIT）的派生版本，基线 **1.2.0**。
> 上游 npm 已到 1.4.1（新增节假日/官方价格对比），**本分支未合并**；宿主半边（`index.js`）保留了 1.2.0 的实现并加了账号池读取，浏览器半边（`client.js`）为重写。
> 修改部分版权归 baiqiuzhang，原版权与许可完整保留在 `LICENSE`。与上游插件**不要同时安装**（两者都会占用 composer 区域）。

本 fork 把 OpenCode Go 的 5h / 本周 / 本月额度做成**输入栏左侧的药丸**，只在当前模型是 `opencode*` 时出现；上游则放在「设置 → OpenCode 用量」子页里。

## 安装

```
dsh plugin --profile desktop add https://github.com/baiqiuzhang/dsh-opencode-quota-hud/releases/download/v0.1.0/dsh-opencode-quota-hud-0.1.0.tgz
```

装完重启 DSH。额度数据来自上游官方 usage 端点，需要在设置里配置 `OPENCODE_GO_API_KEY`（与上游相同的键）。

## 与上游的差异

- 删掉设置子页面，改为 composer 旁药丸（`conversation.input.right`，order 100）；
- 只在选中 `opencode*` provider 时渲染；
- 宿主侧读取 `dsh-opencode-quota-router` 的账号池状态文件（**可选**，未装时降级为单账号）。

## 已知限制

- 宿主半边基于上游 1.2.0，未合并 1.4.1 的模型列表/价格对比改动；
- 与上游同装会重复占用位置，请只装一个。

## 为什么 fork

上游把额度数据塞进「设置 → OpenCode 用量」子页面：占用设置页的一个插槽，
必须打开设置页才看得到，不直观。本 fork 删掉设置子页面，把 5h / 本周 / 本月
三个百分比做成对话框输入栏里的小药丸，位置紧贴模型选择下拉栏的左侧，
并且只在当前会话选中的 provider 是 `opencode*` 时出现。

## 结构

- `index.js` —— 宿主半边，原样保留上游：官方 usage 拉取
  （`https://opencode.ai/inference/go/v1/usage`）、会话日志统计、
  `GET /opencode-usage.json`（仅回环，无鉴权）。
- `client.js` —— 浏览器半边，重写：注册 `conversation.input.right`
  （list 槽，order 100 → 渲染在模型座位之前），读 `modelSelection`
  projection 判断 provider，每 60s 拉一次 `/opencode-usage.json`。
- `cordis.patch.yml` —— bundle 插入 `id: opencode-usage`，配置里
  `apiKeyRef: OPENCODE_GO_API_KEY` 是本机凭据名（上游默认 `OPENCODE_API_KEY`）。

## 安装方式

`~/.dsh/profiles/desktop/package.json` 里以 file: 依赖引用本目录：

```json
"dsh-opencode-quota-hud": "file:C:/Users/10424/.dsh/plugin-src/dsh-opencode-quota-hud"
```

并列入 `dsh.profile.bundles`；`cordis.patch.yml` 里同名 loader 块负责 config 覆盖。

## 回滚

恢复 profile 目录下的 `package.json.bak-hud-*`、`cordis.patch.yml.bak-hud-*`、
`pnpm-workspace.yaml.bak-hud-*`，再 `pnpm install`，然后重启桌面应用。
