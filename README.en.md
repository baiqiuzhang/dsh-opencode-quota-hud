# dsh-opencode-quota-hud

**[中文](README.md) | English**

> **Fork notice**: this is a derivative of [`dsh-opencode-usage-settings`](https://www.npmjs.com/package/dsh-opencode-usage-settings) (by 锈者之家, MIT), baseline **1.2.0**. Upstream npm is 1.4.1 (holiday/official-price comparison); **those changes are not merged here**. The host half keeps the 1.2.0 implementation plus account-pool reading; the browser half is rewritten. Do **not** install it together with the upstream plugin.

Instead of a settings sub-page, this fork shows the OpenCode Go quota (5 h / week / month) as a **pill left of the composer model picker**, rendered only while the selected model is `opencode*`.

## Install

```
dsh plugin --profile desktop add https://github.com/baiqiuzhang/dsh-opencode-quota-hud/releases/download/v0.1.0/dsh-opencode-quota-hud-0.1.0.tgz
```

Restart DSH. Quota data comes from the official usage endpoint and needs `OPENCODE_GO_API_KEY` configured (same key as upstream).

## Differences from upstream

- Settings sub-page removed; pill lives in `conversation.input.right` (order 100).
- Renders only for `opencode*` providers.
- Optional: reads the `dsh-opencode-quota-router` account-pool state file; degrades to a single account when absent.

## Limits

- Host half is based on 1.2.0 and does not include 1.4.1 model-list/price changes.
- Installing both this fork and upstream duplicates the composer area.

## License

MIT — original copyright (c) 2026 锈者之家 preserved in `LICENSE`; modifications (c) 2026 baiqiuzhang.
