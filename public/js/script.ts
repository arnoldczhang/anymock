import xhook from 'xhook';
import type { MockItem } from '../../src/types/mock';
import { parseResponse } from '../../src/utils/mock';
import CODE from '../../src/const/code';
import EVENT from '../../src/const/event';
import { page } from '../../src/utils/message';

console.log('mock脚本植入');

// storage获取前请求暂存处
const requestQueue: [Record<string, any>, Function, number][] = [];

// 代理配置
let interceptor: MockItem[] | undefined = undefined;

// 请求头配置
let requestHeaderProxy = undefined;

// 当前页面是否在黑名单内
let inBlacklist = undefined;

/**
 * 检测所有依赖准备就绪
 *
 * @returns
 */
const isReady = () =>
  [interceptor, requestHeaderProxy, inBlacklist].every(
    (value) => value !== undefined
  );

/**
 * 当前请求是否需要mock
 *
 * @param xhr
 * @returns
 */
const isMocked = (xhr: { url: string }) => {
  const { url = '' } = xhr;
  const matched = (interceptor || []).find(
    ({ name }) => (url || '').indexOf(name) > -1
  );
  if (!matched) return false;
  const matchedTag = matched.tags.find(({ status }) => status);
  if (!matchedTag) return false;
  return {
    config: matched,
    data: matchedTag.data,
    originData: matchedTag.originData,
  };
};

/**
 * 执行异步队列
 *
 * @returns
 */
const refreshRequestQueue = () => {
  if (!isReady()) return;
  while (requestQueue.length) {
    const result = requestQueue.shift();
    if (result === undefined) continue;
    proxy(...result);
  }
};

/**
 * 整体通信
 */
const initListener = () => {
  // 【通信】接收来自content-script的消息
  page.listen((e) => {
    const { type, data } = e.data?.data || {};
    switch (type) {
      case EVENT.init_data:
        interceptor = data;
        break;
      case EVENT.init_req_header:
        requestHeaderProxy = data;
        break;
      case EVENT.init_blacklist:
        inBlacklist = data;
        break;
      default:
        break;
    }
    refreshRequestQueue();
  });
};

/**
 * 代理请求头
 *
 * @param request
 * @returns
 */
const proxyRequestHeader = (request) => {
  const { xhr, headers } = request;
  const extraHeaders = requestHeaderProxy || [];
  if (xhr) {
    return extraHeaders.reduce((res, [key, value]: string[]) => {
      if (!key || !value) return res;
      res[key] = value;
      return res;
    }, headers);
  }
  // fetch
  extraHeaders.forEach(([key, value]: string[]) => {
    if (!key || !value) return;
    headers.set(key, value);
  });
  return headers;
};

/**
 * 代理响应头
 *
 * @param response
 */
const proxyResponseHeader = (response) => {};

/**
 * 整体代理
 *
 * - 代理请求头
 * - 代理返回值
 * - 代理响应头
 *
 * @param request
 * @param callback
 * @param startTime
 * @returns
 */
const proxy = (request, callback, startTime = Date.now()) => {
  const { url, body } = request;
  const headers = proxyRequestHeader(request);
  const mock = isMocked({ url });
  if (!mock) return callback();
  try {
    const { data, config, originData } = mock;
    const { delay, delayMills } = config || {};

    const result = parseResponse(data, config, {
      request: body ? JSON.parse(body) : {},
      response: null,
      originData,
      url,
    });

    const response = {
      text: JSON.stringify(result),
      status: CODE.SUCCESS,
      headers,
      type: 'json',
    };

    console.log(`拦截了：${url}`, result);

    if (delay && typeof delayMills === 'number') {
      // 精确计算延时
      const timeout = Math.max(0, delayMills - (Date.now() - startTime));
      return setTimeout(() => callback(response), timeout);
    }
    return callback(response);
  } catch (err) {
    console.log('mock失败', err);
    return callback();
  }
};

// const replaceResponseText = (xhr, fakeXhr) => {
//   const { responseText } = xhr;
//   const responseURL = xhr.responseURL || fakeXhr.responseURL;
//   const mock = isMocked({ url: responseURL });
//   if (!mock) return responseText;
//   try {
//     const result = parseResponse(mock.data, mock.config, {
//       url: responseURL,
//       request: fakeXhr.requestParams,
//       response: responseText,
//       originData: mock.originData,
//     });
//     console.log(`拦截了：${responseURL}`, result);
//     return JSON.stringify(result);
//   } catch (err) {
//     console.log('mock失败', err);
//     return responseText;
//   }
// };

// const proxyXMLHttpRequest = () => {
//   const oldXMLHttpRequest = window.XMLHttpRequest;

//   (window as any).XMLHttpRequest = function XMLHttpRequest() {
//     const actual = new oldXMLHttpRequest();
//     const self = this;

//     self.onreadystatechange = null;

//     function onLoadStart() {}

//     function onLoadEnd() {}

//     function onError() {}

//     actual.onreadystatechange = function onreadystatechange() {
//       if (this.readyState == oldXMLHttpRequest.OPENED) {
//         onLoadStart.call(this);
//       } else if (this.readyState == oldXMLHttpRequest.DONE) {
//         if (this.status === 200) {
//           onLoadEnd.call(this);
//         } else {
//           onError.call(this);
//         }
//       }
//       if (self.onreadystatechange) {
//         return self.onreadystatechange();
//       }
//     };

//     // 替换接口返回值
//     Object.defineProperty(self, 'responseText', {
//       get() {
//         return replaceResponseText(actual, self);
//       },
//     });

//     // 自定义接口状态码
//     Object.defineProperty(self, 'status', {
//       get() {
//         // 除了登录重定向401，别的请求都强制200
//         return actual.status === CODE.LOGIN ? CODE.LOGIN : CODE.SUCCESS;
//       },
//     });

//     // 这些属性，纯代理完事了
//     const proxyList = [
//       'statusText',
//       'responseType',
//       'response',
//       'responseXML',
//       'upload',
//       'ontimeout',
//       'timeout',
//       'withCredentials',
//       'onload',
//       'onerror',
//       'onprogress',
//       'onabort',
//       'onloadstart',
//     ];

//     const defineProxy = (url: string) => {
//       const mock = isMocked({ url });

//       // 如果加了延时代理
//       if (
//         mock &&
//         mock.config.delay &&
//         typeof mock.config.delayMills === 'number'
//       ) {
//         // 手动加 onloadend（axios会判断这个key）
//         self.onloadend = null;
//         // 手动加 responseURL（防止延时低于正常 responseURL 赋值时间）
//         self.responseURL = url;
//         const maxCode = oldXMLHttpRequest.LOADING;
//         let ready = false;

//         setTimeout(() => (ready = true), mock.config.delayMills);

//         // 自定义接口响应状态
//         Object.defineProperty(self, 'readyState', {
//           get() {
//             // 在设定的延时触发前，最大的 readyState 也只能是 XMLHttpRequest.LOADING
//             const result = ready
//               ? oldXMLHttpRequest.DONE
//               : Math.min(actual.readyState, maxCode);
//             return result;
//           },
//         });

//         // 轮询 readyState（暂定50毫秒）触发回调
//         const interval = setInterval(() => {
//           if (self.readyState === oldXMLHttpRequest.DONE) {
//             clearInterval(interval);
//             if (self.onreadystatechange) self.onreadystatechange();
//             if (self.onloadend) self.onloadend();
//           }
//         }, 50);

//         // 如果没有设置延时，onloadend 和 readyState 还是取原 XMLHttpRequest
//       } else {
//         proxyList.push('onloadend');
//         Object.defineProperty(self, 'readyState', {
//           get() {
//             return actual.readyState;
//           },
//         });
//       }
//     };

//     // 拦截 open 方法做延时处理
//     Object.defineProperty(self, 'open', {
//       writable: true,
//       value(...args) {
//         const [, url] = args;
//         defineProxy(url);
//         const result = actual.open.apply(actual, args);
//         // open后才能设置请求头
//         // proxyRequestHeader(actual);
//         return result;
//       },
//     });

//     // 拦截 send 方法做请求参数处理
//     Object.defineProperty(self, 'send', {
//       writable: true,
//       value: function (...args) {
//         self.requestParams = args[0];
//         return actual.send.apply(actual, args);
//       },
//     });

//     proxyList.forEach(function (key) {
//       Object.defineProperty(self, key, {
//         get() {
//           return actual[key];
//         },
//         set(val) {
//           actual[key] = val;
//         },
//       });
//     });

//     // 这些方法，纯代理完事了
//     [
//       'addEventListener',
//       'abort',
//       'getAllResponseHeaders',
//       'getResponseHeader',
//       'overrideMimeType',
//       'setRequestHeader',
//       'removeEventListener',
//     ].forEach(function (key) {
//       Object.defineProperty(self, key, {
//         writable: true,
//         value: function (...args) {
//           return actual[key].apply(actual, args);
//         },
//       });
//     });
//   };

//   // 状态码
//   ['UNSENT', 'OPENED', 'HEADERS_RECEIVED', 'LOADING', 'DONE'].forEach(function (
//     key
//   ) {
//     Object.defineProperty(XMLHttpRequest, key, {
//       get() {
//         return oldXMLHttpRequest[key];
//       },
//     });
//   });
// };

const initXhook = () => {
  xhook.before((request, callback) => {
    // 黑名单内，直接返回
    if (inBlacklist) return callback();
    const ready = isReady();
    // 未准备就绪，异步执行
    if (!ready) return requestQueue.push([request, callback, Date.now()]);
    // 可以代理了
    proxy(request, callback);
  });
  xhook.after((request, response) => {
    // console.log(request);
    // console.log(response);
  });
};

const init = () => {
  initListener();
  // proxyXMLHttpRequest();
  initXhook();
};

init();
