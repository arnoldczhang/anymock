import { MessageType } from '../types/mock.d';

let tabId: number;

/**
 * 【通信】给content-script发消息
 *
 * 两种场景：
 *
 * 场景1：开发者工具独立window
 *  > tabId: -1
 *  > 向所有active: true的window发消息
 *
 * 场景2：开发者工具在window内
 *  > 向active: true，currentWindow: true 发消息
 *
 * @param message
 * @param callback
 * @returns
 */
export const sendRuntimeMessage = (
  message: MessageType,
  callback?: Function
) => {
  if (!chrome?.tabs) {
    return console.log(message);
  }
  // console.log('发送消息到content-script');
  chrome.tabs.query(
    {
      active: true,
    },
    function (tabs) {
      // 兼容开发者工具独立窗口的场景（会存在未加载content.js的页面抛错，暂未解决）
      tabs.forEach((tab) => {
        if (!tab.id || tab.id === -1) return;
        chrome.tabs.sendMessage(tab.id, message, function (response) {
          if (callback) callback(response);
        });
      });
    }
  );
};

/**
 * 【通信】接收content-script消息
 * @param callback
 */
export const listenRuntimeMessage = (callback: Function) => {
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
    listener = (activeInfo: any) => {
      if (activeInfo.tabId === tabId) {
        if (callback) callback();
        console.log(`tab：${tabId} 激活`);
      }
    };
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
  chrome.tabs.onActivated.removeListener(listener);
};

/**
 * 获取当前url
 * @returns
 */
export const getCurrentUrl = async (): Promise<string> => {
  if (!chrome?.tabs) {
    return location.origin;
  }
  return new Promise((resolve) => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        if (!tabs[0]?.url) {
          return resolve('');
        }
        resolve(new URL(`blob:${tabs[0].url}`).origin as string);
      }
    );
  });
};

export const runtime = {
  send: sendRuntimeMessage,
  listen: listenRuntimeMessage,
};

export const page = {
  send: sendPageMessage,
  listen: listenPageMessage,
};
