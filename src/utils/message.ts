import { MessageType } from '../types/mock.d';

let tabId: number;

/**
 * 【通信】给content-script发消息
 * @param message
 * @param callback
 * @returns
 */
export const sendMessageToContentScript = (
  message: MessageType,
  callback?: Function
) => {
  if (!chrome?.tabs) {
    return console.log(message);
  }

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      tabId = tabs[0]?.id as number;
      chrome.tabs.sendMessage(tabId, message, function (response) {
        if (callback) callback(response);
      });
    }
  );
};

/**
 * 【通信】接收content-script消息
 * @param callback
 */
export const listenMessageFromContentScript = (callback: Function) => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到来自content-script的消息');
    if (callback) {
      callback(request, sendResponse);
    } else {
      sendResponse();
    }
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
