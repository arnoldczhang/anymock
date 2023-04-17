import EVENT from '../../src/const/event';
import { BLACKLIST_KEY } from '../../src/const/storageKey';

const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/script.js');

// 记录正在提示的信息
const messageSet = new Set();

/**
 * 通用提示
 * @param {*} message
 * @param {*} option
 * @returns
 */
const notify = (message = '', option = {}) => {
  const { once = false, duration } = option as {
    once?: boolean;
    duration?: number;
  };

  if (once) {
    if (messageSet.has(message)) {
      return;
    } else {
      messageSet.add(message);
    }
  }

  const frag = document.createDocumentFragment();
  const notification = document.createElement('div');

  const style = {
    zIndex: 9999,
    position: 'fixed',
    borderRadius: '8px',
    boxSizing: 'border-box',
    boxShadow:
      '0 24px 42px 4px rgb(0 0 0 / 5%), 0 12px 50px 10px rgb(0 0 0 / 2%), 0 12px 22px -13px rgb(0 0 0 / 4%)',
    top: '16px',
    right: '24px',
    padding: '24px',
    backgroundColor: '#fff',
    width: 'fit-content',
  };
  Object.entries(style).forEach(([key, value]) => {
    notification.style[key] = value;
  });
  notification.textContent = message;

  const clear = () => {
    document.body.removeChild(notification);
    messageSet.delete(message);
  };

  notification.onclick = clear;
  frag.appendChild(notification);

  if (typeof document.body !== 'undefined') {
    document.body.appendChild(frag);
  }

  if (typeof duration === 'number' && !isNaN(duration)) {
    setTimeout(clear, duration);
  }
};

const freshData = () => {
  try {
    chrome.storage.local.get(null, (data) => {
      const { currentMockList = [], reqHeader = [] } = data;
      if (Array.isArray(currentMockList)) {
        // 【通信】发送mock接口给injected-script
        window.postMessage(
          { data: { type: EVENT.init_data, data: currentMockList } },
          '*'
        );
      }

      if (Array.isArray(reqHeader)) {
        window.postMessage(
          { data: { type: EVENT.init_req_header, data: reqHeader } },
          '*'
        );
      }
    });
    notify('mock插件已开启', { once: true, duration: 1000 });
  } catch (err) {
    notify('mock插件已更新，请刷新页面', { once: true });
  }
};

const watchVisibility = () => {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      freshData();
    }
  });
};

script.onload = function () {
  (this as HTMLScriptElement).remove();
  // 植入脚本后，立刻获取mock数据
  freshData();
  watchVisibility();
};

const appendScript = () => {
  (document.head || document.documentElement).appendChild(script);
  // 【通信】接收extension发来的通知更新
  chrome.runtime.onMessage.addListener(({ type }) => {
    if (type === EVENT.update) {
      freshData();
    }
  });
};

const checkIfAppendScript = () => {
  chrome.storage.local.get([BLACKLIST_KEY], (data) => {
    const { blacklist } = data;
    const { href } = location;
    if (!Array.isArray(blacklist) || !blacklist.length) return appendScript();
    const inBlacklist = blacklist.some(
      ({ url }) => href === url || href.indexOf(url) > -1
    );
    if (inBlacklist) return;
    appendScript();
  });
};

checkIfAppendScript();
