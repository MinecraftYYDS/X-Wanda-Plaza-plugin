# Firefox 扩展版本（计划中）

## 概述

Firefox 扩展版本将基于主分支（Chrome Manifest V3）代码，经过最小化修改以适配 Firefox。

## 状态

- [ ] 创建 Firefox 项目分支
- [ ] 测试 Manifest V3 兼容性
- [ ] 打包为 XPI 格式
- [ ] 提交到 Mozilla Add-ons 商店

## 安装方式

### 开发版本（未来）
1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击"加载临时附加组件"
3. 选择 Firefox 分支的 `manifest.json`

### 正式发布版本（计划中）
从 Mozilla Add-ons 商店安装

## 差异说明

Firefox Manifest V3 支持与 Chrome 基本一致，主要差异：
- 某些 API 的行为微调（如权限提示）
- Content Script 的上下文隔离处理

详细 API 兼容性参考：https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/

## 联系与反馈

如果你是 Firefox 用户，欢迎在 GitHub Issues 中提出需求。
