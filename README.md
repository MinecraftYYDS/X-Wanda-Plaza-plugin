# 推特隐藏回复快捷插件

在推特/X 的评论区添加一个快捷按钮，点击即可快速隐藏不想看的评论回复。

## 功能

- 🔘 在评论操作区添加"隐藏回复"快捷按钮
- ⚡ 一键隐藏他人的评论回复，无需打开"更多"菜单
- 🎨 完美继承推特的 UI 设计风格
- 📱 支持 PC 和移动端
- 🌐 支持 Twitter.com 和 X.com
- 🔄 动态加载的评论自动获得快捷按钮

## 支持的浏览器

### Chrome 扩展（主分支）
- Google Chrome 90+
- Microsoft Edge 90+
- Brave Browser
- Vivaldi
- Opera

### 其他版本（计划中）
- Firefox 扩展分支
- Tampermonkey 油猴脚本
- Violentmonkey 脚本

## 安装

### 方法 1：从源代码加载（开发模式）

1. **克隆或下载项目**
   ```bash
   git clone https://github.com/your-username/X-Wanda-Plaza-plugin.git
   cd X-Wanda-Plaza-plugin
   ```

2. **在 Chrome 中加载扩展**
   - 打开 Chrome，访问 `chrome://extensions/`
   - 启用右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目文件夹（`X-Wanda-Plaza-plugin`）

3. **验证安装**
   - 访问 [Twitter.com](https://twitter.com) 或 [X.com](https://x.com)
   - 打开任何帖子的评论区
   - 在"更多"菜单按钮前应该看到一个"隐"字按钮

### 方法 2：从 Chrome Web Store（发布后）
- 敬请期待 😊

## 使用方法

1. **查看评论**：在推特帖子下方的评论区中查看他人的回复
2. **点击快捷按钮**：在评论右侧找到"隐"字按钮（在"更多"菜单按钮之前）
3. **确认隐藏**：系统会自动隐藏该评论

**提示**：
- 该按钮仅在他人的评论上显示
- 用户自己的评论上不会显示该按钮
- 隐藏的评论可以通过推特/X 的"显示隐藏的回复"选项恢复查看

## 项目结构

```
X-Wanda-Plaza-plugin/
├── manifest.json           # Manifest V3 配置文件
├── src/
│   ├── content.js         # 核心功能脚本（DOM 注入、事件处理）
│   └── styles.css         # 按钮样式
├── docs/
│   ├── firefox.md         # Firefox 扩展安装说明（计划中）
│   ├── tampermonkey.md    # 油猴脚本安装说明（计划中）
│   └── development.md     # 开发者指南（计划中）
├── assets/                # 图标和资源（计划中）
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md             # 本文件
```

## 工作原理

1. **DOM 监控**：使用 `MutationObserver` 监听推特页面中新加载的评论
2. **按钮注入**：在每条他人的评论操作区前面自动插入"隐藏回复"快捷按钮
3. **事件处理**：点击快捷按钮时，自动模拟：
   - 点击"更多"菜单按钮
   - 等待菜单渲染
   - 查找并点击"隐藏回复"菜单项
4. **样式继承**：按钮自动继承推特的主题色和交互风格

## 开发

### 调试模式

在 `src/content.js` 中修改：
```javascript
const DEBUG = true; // 改为 true 启用控制台日志
```

然后打开浏览器的开发者工具（F12）查看日志。

### 主要函数

- `processComments()` - 扫描页面中的评论并注入按钮
- `injectHideReplyButton(container)` - 在指定容器中注入按钮
- `triggerHideReply(moreButton)` - 执行隐藏回复操作
- `findHideReplyMenuItem()` - 查找隐藏回复菜单项

### 修改样式

编辑 `src/styles.css` 修改按钮的外观：
- 大小、颜色、间距
- 悬停和点击效果
- 主题适配（亮色/暗色）

## 常见问题

### Q: 为什么有些评论上没有"隐"字按钮？
A: 该按钮仅在推特允许隐藏的评论上显示。用户自己的评论和某些置顶评论可能不支持隐藏。

### Q: 隐藏后可以恢复吗？
A: 可以。在推特的菜单中选择"显示隐藏的回复"即可恢复查看。此插件只是提供了快捷方式，隐藏设置仍由推特服务器管理。

### Q: 支持油猴脚本吗？
A: 正在规划中。详见项目的 `docs/tampermonkey.md`。

### Q: 可以自定义按钮样式吗？
A: 可以。修改 `src/styles.css` 中的 CSS 类即可。

## 故障排查

### 按钮没有出现
1. 确保扩展已启用：访问 `chrome://extensions/` 检查
2. 刷新推特页面：`Ctrl+F5` 或 `Cmd+Shift+R`
3. 检查浏览器控制台是否有错误：`F12` → Console

### 点击按钮没有反应
1. 打开开发者工具查看日志：修改 `content.js` 中 `DEBUG = true`
2. 确保当前登录了推特账户
3. 确保评论菜单中确实有"隐藏回复"选项

### 与其他扩展冲突
- 尝试禁用其他与推特相关的扩展
- 查看浏览器控制台的报错信息

## 隐私和安全

- ✅ 本扩展**不收集**任何个人数据
- ✅ 所有操作都在浏览器本地进行
- ✅ **不与任何外部服务器通信**
- ✅ 代码完全开源，可审查

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 LICENSE 文件

## 更新日志

### v0.1.0 (2026-05-03)
- ✨ 初始版本发布
- 🎉 Chrome 扩展版本完成
- 📋 多分支支持规划（Firefox、油猴脚本）

---

**有问题或建议？** 请在 GitHub Issues 中提出！
