// ==UserScript==
// @name           推特隐藏回复快捷插件
// @namespace      https://github.com/your-username/X-Wanda-Plaza-plugin
// @version        0.1.0
// @description    在推特评论区添加隐藏回复快捷按钮，一键隐藏不想看的回复
// @author         Plugin Author
// @match          *://twitter.com/*
// @match          *://x.com/*
// @grant          none
// @icon           https://abs.twimg.com/favicons/twitter.3.ico
// @license        MIT
// @homepageURL    https://github.com/your-username/X-Wanda-Plaza-plugin
// @supportURL     https://github.com/your-username/X-Wanda-Plaza-plugin/issues
// @updateURL      https://raw.githubusercontent.com/your-username/X-Wanda-Plaza-plugin/main/src/userscript.js
// @downloadURL    https://raw.githubusercontent.com/your-username/X-Wanda-Plaza-plugin/main/src/userscript.js
// ==/UserScript==

(function() {
  'use strict';

  const DEBUG = false;
  
  function log(msg, data) {
    if (DEBUG) {
      console.log(`[HideReply] ${msg}`, data || '');
    }
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    const styles = `
      .hide-reply-button-wrapper {
        display: inline-flex;
        align-items: center;
        margin: 0;
      }

      .hide-reply-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
        font-weight: 500;
        line-height: 1;
        width: 36px;
        height: 36px;
        margin-right: 4px;
        border-radius: 50%;
        color: rgb(83, 100, 113);
        transition: all 0.2s ease-in-out;
        outline: none;
      }

      .hide-reply-button:hover {
        background-color: rgba(29, 155, 240, 0.1);
        color: rgb(29, 155, 240);
      }

      .hide-reply-button:active {
        background-color: rgba(29, 155, 240, 0.2);
      }

      .hide-reply-button:focus-visible {
        background-color: rgba(29, 155, 240, 0.1);
        outline: 2px solid rgba(29, 155, 240, 0.3);
        outline-offset: -2px;
      }

      .hide-reply-button-inner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .hide-reply-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        line-height: 1;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      @media (max-width: 500px) {
        .hide-reply-button {
          width: 32px;
          height: 32px;
        }
      }

      @media (prefers-color-scheme: dark) {
        .hide-reply-button {
          color: rgb(139, 152, 165);
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    log('样式已注入');
  }

  /**
   * 在指定容器前面插入隐藏回复快捷按钮
   */
  function injectHideReplyButton(actionContainer) {
    if (actionContainer.querySelector('[data-hide-reply-injected]')) {
      return;
    }

    try {
      const moreButton = actionContainer.querySelector('[data-testid="caret"]') ||
                        actionContainer.querySelector('[aria-label*="更多"]') ||
                        actionContainer.querySelector('button[aria-expanded]');
      
      if (!moreButton) {
        log('未找到"更多"按钮');
        return;
      }

      const buttonWrapper = document.createElement('div');
      buttonWrapper.setAttribute('data-hide-reply-injected', 'true');
      buttonWrapper.className = 'hide-reply-button-wrapper';

      const hideReplyButton = document.createElement('button');
      hideReplyButton.type = 'button';
      hideReplyButton.className = 'hide-reply-button';
      hideReplyButton.setAttribute('aria-label', '隐藏回复');
      hideReplyButton.setAttribute('title', '隐藏这条回复');
      hideReplyButton.setAttribute('data-hide-reply-action', 'true');

      const buttonInner = document.createElement('div');
      buttonInner.className = 'hide-reply-button-inner';
      
      const iconSpan = document.createElement('span');
      iconSpan.className = 'hide-reply-icon';
      iconSpan.textContent = '隐';
      
      buttonInner.appendChild(iconSpan);
      hideReplyButton.appendChild(buttonInner);

      hideReplyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHideReply(moreButton);
      });

      moreButton.parentElement.insertBefore(buttonWrapper, moreButton);
      buttonWrapper.appendChild(hideReplyButton);

      log('已注入隐藏回复按钮', actionContainer);
    } catch (err) {
      log('注入按钮时出错', err);
    }
  }

  /**
   * 触发隐藏回复功能
   */
  function triggerHideReply(moreButton) {
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
   */
  function findHideReplyMenuItem() {
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    
    for (const item of menuItems) {
      const text = item.textContent.trim();
      if (text.includes('隐藏回复') || 
          text.includes('Hide reply') ||
          (text.includes('hide') && text.toLowerCase().includes('reply'))) {
        return item;
      }

      const ariaLabel = item.getAttribute('aria-label') || '';
      if (ariaLabel.includes('隐藏回复') || ariaLabel.includes('Hide reply')) {
        return item;
      }

      const testId = item.getAttribute('data-testid') || '';
      if (testId.includes('hide') && testId.includes('reply')) {
        return item;
      }
    }

    return null;
  }

  /**
   * 检查是否应该在此评论上注入按钮
   */
  function shouldInjectButton(container) {
    const hasMoreButton = container.querySelector('[data-testid="caret"]') ||
                         container.querySelector('button[aria-expanded]');
    
    return !!hasMoreButton;
  }

  /**
   * 处理 DOM 中的评论容器
   */
  function processComments() {
    try {
      const actionContainers = document.querySelectorAll('div:has(> button[data-testid="caret"])');
      
      for (const container of actionContainers) {
        if (shouldInjectButton(container)) {
          injectHideReplyButton(container);
        }
      }

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
   * 初始化 MutationObserver
   */
  function initMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
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
        clearTimeout(initMutationObserver.debounceTimer);
        initMutationObserver.debounceTimer = setTimeout(() => {
          processComments();
        }, 300);
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
    injectStyles();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        processComments();
        initMutationObserver();
      });
    } else {
      processComments();
      initMutationObserver();
    }

    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(() => {
        processComments();
      }, 500);
    };

    log('油猴脚本已初始化');
  }

  // 启动插件
  init();
})();
