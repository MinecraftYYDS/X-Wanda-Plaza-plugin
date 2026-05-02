# Tampermonkey 油猴脚本版本（计划中）

## 概述

Tampermonkey 油猴脚本版本将允许用户在不使用浏览器扩展的情况下，通过脚本管理器（如 Tampermonkey、Violentmonkey 等）使用本插件的功能。

## 优势

- ✅ 无需安装扩展，直接在脚本管理器中运行
- ✅ 支持更多浏览器（Firefox、Safari、Opera 等）
- ✅ 更轻量级，占用资源更少
- ✅ 与其他脚本更兼容（使用 GM_* API）

## 状态

- [ ] 创建 `userscript.js` 并包装为 Userscript 格式
- [ ] 在 Greasy Fork 上发布
- [ ] 支持 Violentmonkey
- [ ] 添加脚本配置菜单（可选）

## 安装方式

### 步骤 1：安装脚本管理器

选择以下之一：
- **Tampermonkey** - 支持 Chrome、Firefox、Edge、Safari 等
  https://www.tampermonkey.net/
- **Violentmonkey** - 开源替代方案
  https://violentmonkey.github.io/

### 步骤 2：安装脚本

#### 方式 A：从 Greasy Fork（未来）
访问脚本页面并点击"安装此脚本"

#### 方式 B：从本项目手动安装
1. 打开脚本管理器的仪表板
2. 创建新脚本
3. 粘贴 `src/userscript.js` 的内容
4. 保存并刷新推特页面

## 脚本信息

```javascript
// @name           推特隐藏回复快捷插件
// @namespace      https://github.com/your-username/X-Wanda-Plaza-plugin
// @version        0.1.0
// @description    在推特评论区添加隐藏回复快捷按钮
// @author         Plugin Author
// @match          *://twitter.com/*
// @match          *://x.com/*
// @grant          none
// @icon           https://abs.twimg.com/favicons/twitter.3.ico
// @license        MIT
```

## 核心代码复用

油猴脚本版本将直接复用 `src/content.js` 中的核心逻辑，只需在外层包装 Userscript 的 `@grant` 和 `@match` 声明。

由于此插件不依赖扩展专有 API（如 `chrome.* API`），所以代码迁移工作最小。

## 注意事项

- 某些安全沙盒可能限制 DOM 操作
- 脚本执行时机可能与扩展有差异

## 贡献

欢迎 Tampermonkey 用户提出反馈和改进建议！
