import type { MessageType } from '../types/mock.d';

let tabId: number;

/**
 * 【通信】给content-script发消息
 *
 * - 向所有active: true的window发消息
 *
 * @param message
 * @param callback
 * @returns
 */
export const sendTabMessage = (message: MessageType, callback?: Function) => {
  if (!chrome?.tabs) {
    return console.log(message);
  }

  // console.log('发送消息到content-script');

  // 兼容开发者工具独立窗口的场景（会存在未加载content.js的页面抛错，暂未解决）
  chrome.windows.getLastFocused((currentWindow) => {
    chrome.tabs.query(
      {
        active: true,
        windowId: currentWindow.id,
      },
      (tabs) => {
        tabs.forEach((tab) => {
          if (!tab.id || tab.id === -1) return;
          chrome.tabs.sendMessage(tab.id, message, function (response) {
            if (callback) callback(response);
          });
        });
      }
    );
  });
};

/**
 * 【通信】接收content-script消息
 * @param callback
 */
export const listenRuntimeMessage = (callback: Function) => {
  if (!chrome?.runtime) {
    return;
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // console.log('收到来自content-script的消息');
    if (callback) {
      callback(request, sendResponse);
    } else {
      sendResponse();
    }
  });
};

/**
 * 【通信】卸载接收content-script消息
 * @param callback
 */
export const unlistenRuntimeMessage = (callback: any) => {
  if (!chrome?.runtime) {
    return;
  }
  chrome.runtime.onMessage.removeListener(callback);
};

/**
 * 【通信】window.postMessage
 *
 * @param message
 * @param scope
 */
export const sendPageMessage = (message: MessageType, scope = '*') => {
  window.postMessage(
    {
      data: message,
    },
    scope
  );
};

/**
 * 【通信】window.postMessage
 *
 * @param callback
 */
export const listenPageMessage = (callback: Function) => {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    callback(event);
  });
};

/**
 *
 * @param message
 */
export const sendRuntimeMessage = (message: MessageType) => {
  if (!chrome?.runtime) {
    return;
  }
  try {
    chrome.runtime.sendMessage(message);
  } catch (err) {
    // console.log(err);
  }
};

/**
 * 监听当前tab激活态
 * @param callback
 * @returns
 */
export const listenTabActivated = (callback: Function) => {
  let listener: (p: unknown) => void;
  if (!chrome?.tabs) {
    listener = () => {
      if (!document.hidden) {
        if (callback) callback();
        console.log(`tab：${tabId} 激活`);
      }
    };
    document.addEventListener('visibilitychange', listener);
  } else {
    listener = (win: any) => {
      // tab切换
      if (win.tabId) {
        if (win.tabId === tabId) {
          if (callback) callback();
          console.log(`tab：${tabId} 激活`);
        }
        // window窗口切换
      } else {
        if (win !== chrome.windows.WINDOW_ID_NONE) {
          if (callback) callback();
        }
      }
    };
    chrome.windows.onFocusChanged.addListener(listener);
    chrome.tabs.onActivated.addListener(listener);
  }
  return listener;
};

/**
 * 取消监听当前tab激活态
 * @param listener
 * @returns
 */
export const unListenTabActivated = (listener: (p: unknown) => void) => {
  if (!chrome?.tabs) {
    document.removeEventListener('visibilitychange', listener);
    return;
  }
  chrome.windows.onFocusChanged.removeListener(listener);
  chrome.tabs.onActivated.removeListener(listener);
};

/**
 *
 * @returns
 */
export const getCurrentTab = async () => {
  if (!chrome?.tabs) {
    return;
  }

  const currentWindow = await chrome.windows.getLastFocused();
  const tabs = await chrome.tabs.query({
    active: true,
    windowId: currentWindow.id,
  });
  if (!tabs.length) return;
  return tabs[0];
};

/**
 * 获取当前url
 * @returns
 */
export const getCurrentUrl = async (): Promise<string> => {
  if (!chrome?.tabs) {
    return location.origin;
  }
  const tab = await getCurrentTab();
  if (!tab) return '';
  return new URL(`blob:${tab.url}`).origin;
};

/**
 * 刷新当前tab
 *
 * 注：不支持开发者工具独立window
 *
 * @param callback
 * @returns
 */
export const reloadCurrentTab = async (callback?: any) => {
  if (!chrome?.tabs) {
    return location.reload();
  }

  const tab = await getCurrentTab();
  if (!tab?.id || tab.id === -1) return Promise.resolve();
  return chrome.tabs.reload(tab.id, { bypassCache: true }, callback);
};

export const runtime = {
  send: sendRuntimeMessage,
  listen: listenRuntimeMessage,
  unlisten: unlistenRuntimeMessage,
};

export const page = {
  send: sendPageMessage,
  listen: listenPageMessage,
};

export const tab = {
  send: sendTabMessage,
};

// @important 【别删】同步当前tabid
getCurrentTab().then((tab) => (tabId = tab?.id || -1));
