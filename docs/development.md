# 开发者指南

## 项目架构

### 目录结构

```
X-Wanda-Plaza-plugin/
├── src/
│   ├── content.js         # 核心功能（需要修改：处理 DOM、事件监听）
│   └── styles.css         # 样式定义（需要修改：按钮外观）
├── manifest.json          # 扩展配置（一般不修改）
├── docs/
│   ├── firefox.md         # Firefox 版本说明
│   ├── tampermonkey.md    # 油猴脚本说明
│   └── development.md     # 本文件
└── assets/                # 资源文件（计划中）
```

## 核心概念

### DOM 结构识别

推特的评论结构如下（简化版）：

```html
<article data-testid="tweet">
  <!-- 评论内容 -->
  <div class="..." role="group">
    <div>
      <!-- 用户头像、名字等 -->
    </div>
    <div>
      <!-- 评论文本 -->
    </div>
  </div>
  
  <!-- 评论操作栏 -->
  <div>
    <button aria-label="Grok 操作">...</button>
    <div>
      <button data-testid="caret" aria-label="更多">...</button>
    </div>
  </div>
</article>
```

关键选择器：
- `[data-testid="caret"]` - "更多"菜单按钮
- `[aria-label="更多"]` - 更多菜单的 aria 标签
- `[role="menuitem"]` - 菜单项容器
- `[data-testid="tweet"]` - 单条推文/评论容器

### 隐藏回复菜单项

当点击"更多"按钮后，菜单会出现。隐藏回复菜单项的特征：

```html
<div role="menuitem">
  隐藏回复  <!-- 或 "Hide reply" -->
</div>
```

选择逻辑：
1. 查找所有 `[role="menuitem"]` 元素
2. 检查文本内容是否包含 "隐藏回复" 或 "hide reply"
3. 返回第一个匹配的元素

## 开发流程

### 1. 本地开发设置

```bash
# 克隆项目
git clone https://github.com/your-username/X-Wanda-Plaza-plugin.git
cd X-Wanda-Plaza-plugin

# 初始化 Git（如果还没有）
git init
git add .
git commit -m "initial commit"
```

### 2. 加载扩展进行调试

**Chrome/Edge/Brave：**
1. 打开浏览器，访问 `chrome://extensions/`
2. 启用右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目文件夹
5. 扩展会出现在列表中

**重新加载：**
- 修改代码后，在扩展列表中点击"重新加载"按钮
- 或按快捷键（通常是 F5 + Ctrl）

### 3. 调试技巧

**启用控制台日志：**

修改 `src/content.js`：
```javascript
const DEBUG = true;  // 改为 true
```

然后在推特页面打开开发者工具（F12），查看 Console 标签。

**常用日志命令：**
```javascript
log('消息', 变量);  // 会输出 [HideReply] 消息 变量
```

**检查 DOM 结构：**

在浏览器开发者工具中：
1. 打开 Inspector（F12）
2. 用鼠标选择工具（左上角图标）点击页面上的元素
3. 查看 HTML 结构

### 4. 修改 DOM 选择器

如果推特更新了 HTML 结构，你可能需要修改选择器。

**步骤：**
1. 打开推特页面，用 Inspector 检查"更多"按钮的属性
2. 更新 `src/content.js` 中的选择器逻辑，例如：

```javascript
// 原来的选择器
const moreButton = actionContainer.querySelector('[data-testid="caret"]');

// 如果不工作，尝试其他选择器
const moreButton = actionContainer.querySelector('[aria-label*="更多"]');
const moreButton = actionContainer.querySelector('button[aria-expanded]');
```

### 5. 修改按钮样式

编辑 `src/styles.css` 中的 CSS 类：

```css
.hide-reply-button {
  /* 修改大小 */
  width: 40px;
  height: 40px;
  
  /* 修改颜色 */
  color: rgb(29, 155, 240);
  
  /* 修改圆角 */
  border-radius: 50%;
}

.hide-reply-button:hover {
  /* 修改悬停效果 */
  background-color: rgba(29, 155, 240, 0.15);
}
```

## 常见问题与解决方案

### 按钮没有注入

**检查清单：**
1. 扩展是否已启用？检查 `chrome://extensions/`
2. 权限是否正确？检查 `manifest.json` 中的 `host_permissions`
3. 是否是正确的页面？只有在 Twitter.com 或 X.com 才会注入
4. 是否有 JS 错误？查看开发者工具的 Console

**调试步骤：**
```javascript
// 在 content.js 中添加临时日志
console.log('DEBUG: 页面加载，开始初始化');
console.log('DEBUG: 当前 URL:', window.location.href);

// 检查选择器是否有效
const test = document.querySelector('[data-testid="caret"]');
console.log('DEBUG: 找到的"更多"按钮数:', test ? 1 : 0);
```

### 点击按钮没有反应

**可能原因：**
1. "隐藏回复"菜单项不存在（可能是用户自己的评论）
2. 菜单渲染有延迟，setTimeout 时间不够
3. 菜单项的选择器改变了

**修复方法：**
```javascript
// 增加等待时间
setTimeout(() => {
  const hideReplyMenuItem = findHideReplyMenuItem();
  // ...
}, 500);  // 从 100ms 改为 500ms

// 或尝试使用 MutationObserver 监听菜单
```

### 与其他脚本冲突

**预防措施：**
1. 使用命名空间避免全局变量污染
2. 使用 IIFE（立即执行函数表达式）包装代码
3. 避免覆盖原生 DOM 方法

## 性能优化建议

### 1. 防抖处理

当大量评论加载时，避免频繁处理：

```javascript
let debounceTimer;
function processComments() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // 处理评论
  }, 300);
}
```

### 2. 选择器优化

使用更精确的选择器，避免遍历整个 DOM：

```javascript
// 不好：扫描所有 div
const buttons = document.querySelectorAll('div');

// 好：使用特定的 data-testid
const buttons = document.querySelectorAll('[data-testid="caret"]');
```

### 3. 事件委托

使用事件冒泡，避免为每个按钮都添加监听器：

```javascript
// 在根元素添加一个监听器
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-hide-reply-action]')) {
    handleHideReply();
  }
}, true);
```

## 测试清单

在提交代码前，运行以下测试：

- [ ] 在新评论加载时，快捷按钮自动出现
- [ ] 点击快捷按钮，评论被隐藏
- [ ] 多个评论上都能正常工作
- [ ] 滚动评论区时，新加载的评论也有快捷按钮
- [ ] 在亮色和暗色主题下，按钮样式正确
- [ ] 在移动设备上能正常工作
- [ ] 在 Twitter.com 和 X.com 都能正常工作
- [ ] 控制台没有 JS 错误

## 代码风格

### JavaScript

- 使用 `'use strict'` 启用严格模式
- 使用 const/let，避免 var
- 函数名使用 camelCase
- 添加 JSDoc 注释

```javascript
/**
 * 简要说明
 * @param {类型} 参数名 - 参数说明
 * @returns {类型} 返回值说明
 */
function myFunction(param) {
  // ...
}
```

### CSS

- 使用 BEM 命名规范
- 使用 kebab-case 命名 class
- 添加注释说明复杂的样式

```css
/* 主容器 */
.hide-reply-button-wrapper {
  /* ... */
}

/* 按钮元素 */
.hide-reply-button {
  /* ... */
}

/* 按钮内部 */
.hide-reply-button-inner {
  /* ... */
}
```

## 提交 Pull Request

如果你想贡献代码：

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 进阶主题

### 处理虚拟 DOM 更新

推特使用 React，DOM 可能被频繁重新渲染。使用 MutationObserver 而不是简单的 setTimeout 来处理：

```javascript
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
```

### 多国语言支持

菜单项的文本可能因语言而异。使用正则表达式匹配多种语言：

```javascript
const patterns = [
  /隐藏回复/i,        // 中文
  /hide reply/i,      // 英文
  /masquer réponse/i, // 法文
];

for (const pattern of patterns) {
  if (pattern.test(item.textContent)) {
    return item;
  }
}
```

### 与其他扩展通信

使用 `window.postMessage` 在不同上下文间通信：

```javascript
// 发送消息
window.postMessage({
  type: 'HIDE_REPLY',
  reply_id: '123'
}, '*');

// 接收消息
window.addEventListener('message', (e) => {
  if (e.data.type === 'HIDE_REPLY') {
    // 处理隐藏操作
  }
});
```

---

有问题？在 GitHub Issues 中提出或联系维护者。
