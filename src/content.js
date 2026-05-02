/**
 * 推特隐藏回复快捷插件
 * 在推特评论区添加隐藏回复快捷按钮
 */

(function() {
  'use strict';

  const DEBUG = false;

  // 当前是否启用（默认开）
  let pluginEnabled = true;

  function log(msg, data) {
    if (DEBUG) {
      console.log(`[HideReply] ${msg}`, data || '');
    }
  }

  /** 显示或隐藏所有已注入的快捷按钮 */
  function applyVisibility(enabled) {
    document.querySelectorAll('.hide-reply-button-wrapper').forEach(el => {
      el.style.display = enabled ? '' : 'none';
    });
  }

  /**
   * 从 caret 按钮出发，向上寻找同时包含 Grok 按钮的行容器
   * 返回 { actionRow, grokWrapper } 或 null
   */
  function findActionRow(moreButton) {
    let el = moreButton.parentElement;
    while (el && el !== document.body) {
      const grokButton = el.querySelector('button[aria-label="Grok 操作"], button[aria-label*="Grok"]');
      if (grokButton) {
        // 找到 grokButton 在 el 下的直接子元素包装层
        let grokWrapper = grokButton;
        while (grokWrapper.parentElement !== el) {
          grokWrapper = grokWrapper.parentElement;
          if (!grokWrapper) return null;
        }
        return { actionRow: el, grokWrapper };
      }
      el = el.parentElement;
    }
    return null;
  }

  /**
   * 在 Grok 操作按钮前面注入隐藏回复快捷按钮
   * @param {HTMLElement} moreButton - data-testid="caret" 按钮
   */
  function injectHideReplyButton(moreButton) {
    try {
      const result = findActionRow(moreButton);
      if (!result) {
        log('未找到包含 Grok 按钮的行容器');
        return;
      }
      const { actionRow, grokWrapper } = result;

      // 防止重复注入（标记在 actionRow 上，防止同一行多个 caret 按钮重复插入）
      if (actionRow.dataset.hideReplyInjected) return;
      actionRow.dataset.hideReplyInjected = 'true';

      // 创建隐藏回复快捷按钮容器
      const buttonWrapper = document.createElement('div');
      buttonWrapper.className = 'hide-reply-button-wrapper';

      const hideReplyButton = document.createElement('button');
      hideReplyButton.type = 'button';
      hideReplyButton.className = 'hide-reply-button';
      hideReplyButton.setAttribute('aria-label', '隐藏回复');
      hideReplyButton.setAttribute('title', '隐藏这条回复');
      hideReplyButton.setAttribute('data-hide-reply-action', 'true');

      const buttonInner = document.createElement('div');
      buttonInner.className = 'hide-reply-button-inner';

      // 使用传入的 SVG 图标
      buttonInner.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px;fill:currentColor;"><g><path d="M19 14h2v3h-2v-3zM3 14H1v3h2v-3zm.5 7c-.276 0-.5-.225-.5-.5V19H1v1.5C1 21.879 2.122 23 3.5 23H5v-2H3.5zM10 5V3H7v2h3zm-7 .5c0-.275.224-.5.5-.5H5V3H3.5C2.122 3 1 4.121 1 5.5V7h2V5.5zM12 21v2h3v-2h-3zm-5 0v2h3v-2H7zm12-.5c0 .275-.224.5-.5.5H17v2h1.5c1.378 0 2.5-1.121 2.5-2.5V19h-2v1.5zM3 9H1v3h2V9zm3 9h5v-2H6v2zM18-.1c3.364 0 6.1 2.736 6.1 6.1s-2.736 6.1-6.1 6.1-6.1-2.736-6.1-6.1S14.636-.1 18-.1zm0 2c-2.261 0-4.1 1.839-4.1 4.1s1.839 4.1 4.1 4.1 4.1-1.839 4.1-4.1-1.839-4.1-4.1-4.1zm.5 3.1H15v2h6V5h-2.5zM6 10h4V8H6v2zm0 4h7v-2H6v2z"/></g></svg>`;

      hideReplyButton.appendChild(buttonInner);

      hideReplyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        triggerHideReply(moreButton, hideReplyButton);
      });

      buttonWrapper.appendChild(hideReplyButton);
      // 插入到 Grok 按钮包装层之前
      actionRow.insertBefore(buttonWrapper, grokWrapper);

      log('已注入隐藏回复按钮');
    } catch (err) {
      log('注入按钮时出错', err);
    }
  }

  /**
   * 触发隐藏回复功能
   * 首次点击时打开菜单检查是否有"隐藏回复"选项：
   *   - 有：点击执行
   *   - 无：关闭菜单，隐藏快捷按钮（此推文不支持隐藏回复）
   * @param {HTMLElement} moreButton - 更多菜单按钮
   * @param {HTMLElement} ourButton  - 我们注入的快捷按钮
   */
  function triggerHideReply(moreButton, ourButton) {
    try {
      moreButton.click();
      log('已点击"更多"按钮');

      requestAnimationFrame(() => {
        setTimeout(() => {
          const hideReplyMenuItem = findHideReplyMenuItem();

          if (hideReplyMenuItem) {
            log('找到隐藏回复菜单项，准备点击');
            hideReplyMenuItem.click();
          } else {
            log('未找到隐藏回复菜单项，关闭菜单并移除快捷按钮');
            // 关闭菜单（按 Escape）
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            // 从 DOM 中移除我们注入的按钮容器
            const wrapper = ourButton.closest('.hide-reply-button-wrapper');
            if (wrapper) wrapper.remove();
            // 同时清除行容器上的标记，避免该行被认为已注入
            if (moreButton) {
              const result = findActionRow(moreButton);
              if (result) delete result.actionRow.dataset.hideReplyInjected;
            }
          }
        }, 200);
      });
    } catch (err) {
      log('触发隐藏回复时出错', err);
    }
  }

  /**
   * 查找隐藏回复菜单项
   * @returns {HTMLElement|null}
   */
  function findHideReplyMenuItem() {
    // 菜单项通常具有 role="menuitem"
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    
    for (const item of menuItems) {
      // 检查多个可能的文本表示
      const text = item.textContent.trim();
      if (text.includes('隐藏回复') || 
          text.includes('Hide reply') ||
          text.includes('hide') && text.toLowerCase().includes('reply')) {
        return item;
      }

      // 检查是否有 aria-label
      const ariaLabel = item.getAttribute('aria-label') || '';
      if (ariaLabel.includes('隐藏回复') || ariaLabel.includes('Hide reply')) {
        return item;
      }

      // 检查是否有 data-testid
      const testId = item.getAttribute('data-testid') || '';
      if (testId.includes('hide') && testId.includes('reply')) {
        return item;
      }
    }

    return null;
  }

  /**
   * 处理 DOM 中的所有 caret 按钮，逐一注入快捷按钮
   */
  function processComments() {
    try {
      const moreButtons = document.querySelectorAll('button[data-testid="caret"]');
      for (const btn of moreButtons) {
        injectHideReplyButton(btn);
      }
      // 注入后根据当前开关状态更新可见性
      applyVisibility(pluginEnabled);
      log(`处理了 ${moreButtons.length} 个评论`);
    } catch (err) {
      log('处理评论时出错', err);
    }
  }

  /**
   * 初始化 MutationObserver，监听 DOM 变化
   * 当新的评论加载时自动注入按钮
   */
  function initMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            // 节点本身是 caret 按钮，或者节点内部包含 caret 按钮
            const isCaret = node.matches && node.matches('button[data-testid="caret"]');
            const hasCaret = node.querySelector && node.querySelector('button[data-testid="caret"]');
            if (isCaret || hasCaret) {
              shouldProcess = true;
              break;
            }
          }
        }
        if (shouldProcess) break;
      }

      if (shouldProcess) {
        clearTimeout(initMutationObserver.debounceTimer);
        initMutationObserver.debounceTimer = setTimeout(processComments, 300);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });

    log('MutationObserver 已初始化');
  }

  /**
   * 主初始化函数
   */
  function init() {
    // 读取已保存的开关状态
    chrome.storage.sync.get({ enabled: true }, ({ enabled }) => {
      pluginEnabled = enabled;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          processComments();
          initMutationObserver();
        });
      } else {
        processComments();
        initMutationObserver();
      }
    });

    // 监听来自 popup 的开关消息
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'SET_ENABLED') {
        pluginEnabled = msg.enabled;
        applyVisibility(pluginEnabled);
      }
    });

    // 监听 SPA 路由变化（pushState 和 popstate）
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(processComments, 800);
    };
    window.addEventListener('popstate', () => setTimeout(processComments, 800));

    log('插件已初始化');
  }

  // 启动插件
  init();
})();
