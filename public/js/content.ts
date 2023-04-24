import EVENT from '../../src/const/event';
import {
  BLACKLIST_KEY,
  CURRENT_MOCK_LIST_KEY,
  REQ_HEADER_KEY,
} from '../../src/const/storageKey';
import { runtime, page } from '../../src/utils/message';
import { getState } from '../../src/service/recorder';

// 记录正在提示的信息
const messageSet = new Set();

// 录制工具是否接收请求录制
let recording = getState();

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

/**
 *
 */
const freshData = () => {
  try {
    chrome.storage.local.get(
      [BLACKLIST_KEY, CURRENT_MOCK_LIST_KEY, REQ_HEADER_KEY],
      (data) => {
        const {
          [CURRENT_MOCK_LIST_KEY]: currentMockList = [],
          [REQ_HEADER_KEY]: reqHeader = [],
          [BLACKLIST_KEY]: blacklist = [],
        } = data;
        // 推送当前mock列表
        page.send({
          type: EVENT.init_data,
          data: Array.isArray(currentMockList)
            ? currentMockList.filter(({ status }) => status)
            : [],
        });
        // 推送请求头
        page.send({
          type: EVENT.init_req_header,
          data: Array.isArray(reqHeader)
            ? reqHeader.find(({ selected }) => selected)?.params || []
            : [],
        });
        const { href } = location;
        const inBlacklist = Array.isArray(blacklist)
          ? blacklist
              .map(({ url }) => url)
              .some((url) => href === url || href.indexOf(url) > -1)
          : false;
        // 推送是否在黑名单内
        page.send({
          type: EVENT.init_blacklist,
          data: inBlacklist,
        });

        if (!inBlacklist) {
          notify('mock插件已开启', { once: true, duration: 1000 });
        }
      }
    );
  } catch (err) {
    notify('mock插件已更新，请刷新页面', { once: true });
  }
};

/**
 *
 */
const watchVisibility = () => {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      freshData();
    }
  });
};

/**
 *
 */
const initListener = () => {
  // 【通信】接收extension发来的通知更新
  runtime.listen(({ type, data }) => {
    switch (type) {
      case EVENT.update:
        freshData();
        break;
      case EVENT.record_state:
        recording = data;
        break;
      default:
        break;
    }
  });
  // 【通信】接收script.ts发来的通知
  page.listen((event) => {
    const { type, data } = event.data?.data || {};
    if (type === EVENT.record) {
      recording && runtime.send({ type, data });
    }
  });
};

/**
 *
 */
const appendScript = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('js/script.js');
  (document.head || document.documentElement).appendChild(script);

  script.onload = function () {
    (this as HTMLScriptElement).remove();
    // 植入脚本后，立刻获取mock数据
    freshData();
    watchVisibility();
  };
};

/**
 * 【待定】校验非黑名单内才植入script.ts
 */
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
    initListener();
  });
};

checkIfAppendScript();
