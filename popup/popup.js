const toggle = document.getElementById('toggle');

// 读取已保存的状态
chrome.storage.sync.get({ enabled: true }, ({ enabled }) => {
  toggle.checked = enabled;
});

// 切换时保存并通知 content script
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ enabled });

  // 通知所有匹配的标签页
  chrome.tabs.query({ url: ['*://twitter.com/*', '*://x.com/*'] }, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { type: 'SET_ENABLED', enabled }).catch(() => {});
    }
  });
});
