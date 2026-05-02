/**
 * 推特隐藏回复快捷插件
 * 在推特评论区添加隐藏回复快捷按钮
 */

(function() {
  'use strict';

  const DEBUG = false;
  
  function log(msg, data) {
    if (DEBUG) {
      console.log(`[HideReply] ${msg}`, data || '');
    }
  }

  /**
   * 在指定容器前面插入隐藏回复快捷按钮
   * @param {HTMLElement} actionContainer - 包含 Grok 操作和更多菜单的容器
   */
  function injectHideReplyButton(actionContainer) {
    // 检查是否已经注入过
    if (actionContainer.querySelector('[data-hide-reply-injected]')) {
      return;
    }

    try {
      // 查找"更多"菜单按钮
      const moreButton = actionContainer.querySelector('[data-testid="caret"]') ||
                        actionContainer.querySelector('[aria-label*="更多"]') ||
                        actionContainer.querySelector('button[aria-expanded]');
      
      if (!moreButton) {
        log('未找到"更多"按钮');
        return;
      }

      // 创建隐藏回复快捷按钮容器
      const buttonWrapper = document.createElement('div');
      buttonWrapper.setAttribute('data-hide-reply-injected', 'true');
      buttonWrapper.className = 'hide-reply-button-wrapper';

      // 创建按钮 (复制"更多"按钮的结构，保持一致性)
      const hideReplyButton = document.createElement('button');
      hideReplyButton.type = 'button';
      hideReplyButton.className = 'hide-reply-button';
      hideReplyButton.setAttribute('aria-label', '隐藏回复');
      hideReplyButton.setAttribute('title', '隐藏这条回复');
      hideReplyButton.setAttribute('data-hide-reply-action', 'true');

      // 创建按钮内部结构（保持推特的样式一致）
      const buttonInner = document.createElement('div');
      buttonInner.className = 'hide-reply-button-inner';
      
      // 添加简单的图标（使用文本"隐")
      const iconSpan = document.createElement('span');
      iconSpan.className = 'hide-reply-icon';
      iconSpan.textContent = '隐';
      
      buttonInner.appendChild(iconSpan);
      hideReplyButton.appendChild(buttonInner);

      // 点击事件处理
      hideReplyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHideReply(moreButton);
      });

      // 插入到"更多"按钮之前
      moreButton.parentElement.insertBefore(buttonWrapper, moreButton);
      buttonWrapper.appendChild(hideReplyButton);

      log('已注入隐藏回复按钮', actionContainer);
    } catch (err) {
      log('注入按钮时出错', err);
    }
  }

  /**
   * 触发隐藏回复功能
   * @param {HTMLElement} moreButton - 更多菜单按钮
   */
  function triggerHideReply(moreButton) {
    try {
      // 1. 点击"更多"按钮打开菜单
      moreButton.click();
      log('已点击"更多"按钮');

      // 2. 等待菜单渲染后查找隐藏回复选项
      // 使用 requestAnimationFrame 而不是 setTimeout 以适应 React 更新
      requestAnimationFrame(() => {
        setTimeout(() => {
          const hideReplyMenuItem = findHideReplyMenuItem();
          
          if (hideReplyMenuItem) {
            log('找到隐藏回复菜单项，准备点击');
            hideReplyMenuItem.click();
          } else {
            log('未找到隐藏回复菜单项');
          }
        }, 100);
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
   * 检查是否应该在此评论上注入按钮
   * 排除用户自己的评论
   * @param {HTMLElement} container - 评论容器
   * @returns {boolean}
   */
  function shouldInjectButton(container) {
    // 检查容器是否包含 Grok 操作和更多菜单（这表示是他人的评论）
    const hasMoreButton = container.querySelector('[data-testid="caret"]') ||
                         container.querySelector('button[aria-expanded]');
    
    if (!hasMoreButton) {
      return false;
    }

    // 检查是否有隐藏回复选项
    // 只有非自己的评论才会在菜单中显示隐藏回复选项
    // 这里我们先注入，然后在点击时验证
    
    return true;
  }

  /**
   * 处理 DOM 中的评论容器
   * 查找所有可能的评论操作区域并注入按钮
   */
  function processComments() {
    try {
      // 查找所有包含"更多"操作按钮的容器
      // 推特的评论区通常有这样的结构：
      // <div data-testid="tweet"> ... <div>...<button data-testid="caret">...</button></div>...</div>
      
      const actionContainers = document.querySelectorAll('div:has(> button[data-testid="caret"])');
      
      for (const container of actionContainers) {
        if (shouldInjectButton(container)) {
          injectHideReplyButton(container);
        }
      }

      // 备选方案：直接查找所有"更多"按钮
      if (actionContainers.length === 0) {
        const moreButtons = document.querySelectorAll('button[data-testid="caret"]');
        for (const button of moreButtons) {
          const actionContainer = button.parentElement;
          if (actionContainer && shouldInjectButton(actionContainer)) {
            injectHideReplyButton(actionContainer);
          }
        }
      }

      log(`处理了 ${actionContainers.length} 个评论容器`);
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
        // 检查是否有新的节点被添加
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element node
              // 检查是否是评论容器或包含"更多"按钮
              if (node.querySelector && (node.querySelector('[data-testid="caret"]') ||
                  (node.tagName === 'BUTTON' && node.getAttribute('data-testid') === 'caret'))) {
                shouldProcess = true;
                break;
              }
            }
          }
        }

        if (shouldProcess) break;
      }

      if (shouldProcess) {
        // 使用防抖，避免频繁处理
        clearTimeout(initMutationObserver.debounceTimer);
        initMutationObserver.debounceTimer = setTimeout(() => {
          processComments();
        }, 300);
      }
    });

    // 配置观察器
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
    // 页面初始加载时处理已有的评论
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        processComments();
        initMutationObserver();
      });
    } else {
      processComments();
      initMutationObserver();
    }

    // 监听页面变化（SPA 路由变化）
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(() => {
        processComments();
      }, 500);
    };

    log('插件已初始化');
  }

  // 启动插件
  init();
})();
