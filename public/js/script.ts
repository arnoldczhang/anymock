/* eslint-disable */
import xhook from "xhook";
import { parseResponse } from '../../src/utils/mock';
import CODE from '../../src/const/code';
import EVENT from '../../src/const/event';

console.log('mock脚本植入');

// 代理配置
let interceptor = [];

// 请求头配置
let requestHeaderProxy = [];

const initListener = () => {
  // 【通信】接收来自content-script的消息
  window.addEventListener('message', (e) => {
    const { type, data } = e.data?.data || {};
    switch (type) {
      case EVENT.init_data:
        interceptor = data.filter(({ status }) => status);
        break;
      case EVENT.init_req_header:
        requestHeaderProxy = data.find(({ selected }) => selected)?.params || [];
        break;
      default:
        break;
    }
  });
};

const isMocked = (xhr: { responseURL: string }) => {
  const { responseURL = '' } = xhr;
  const matched = interceptor.find(({ name }) => (responseURL || '').indexOf(name) > -1) as any;
  if (!matched) return false;
  const matchedTag = matched.tags.find(({ status }) => status);
  if (!matchedTag) return false;
  return {
    config: matched,
    data: matchedTag.data,
    originData: matchedTag.originData,
  };
};

const replaceResponseText = (xhr, fakeXhr) => {
  const { responseText } = xhr;
  const responseURL = xhr.responseURL || fakeXhr.responseURL;
  const mock = isMocked({ responseURL });
  if (!mock) return responseText;
  try {
    const result = parseResponse(mock.data, mock.config, {
      url: responseURL,
      request: fakeXhr.requestParams,
      response: responseText,
      originData: mock.originData,
    });
    console.log(`拦截了：${responseURL}`, result);
    return JSON.stringify(result);
  } catch(err) {
    console.log('mock失败', err);
    return responseText;
  }
};

const proxyXMLHttpRequest = () => {
  const oldXMLHttpRequest = window.XMLHttpRequest;

  (window as any).XMLHttpRequest = function XMLHttpRequest () {
    const actual = new oldXMLHttpRequest();
    const self = this;

    self.onreadystatechange = null;

    function onLoadStart() {}

    function onLoadEnd() {}

    function onError() {}

    actual.onreadystatechange = function onreadystatechange () {
      if (this.readyState == oldXMLHttpRequest.OPENED) {
        onLoadStart.call(this);
      } else if (this.readyState == oldXMLHttpRequest.DONE) {
        if (this.status === 200) {
          onLoadEnd.call(this);
        } else {
          onError.call(this);
        }
      }
      if (self.onreadystatechange) {
        return self.onreadystatechange();
      }
    };

    // 替换接口返回值
    Object.defineProperty(self, 'responseText', {
      get() {
        return replaceResponseText(actual, self);
      },
    });

    // 自定义接口状态码
    Object.defineProperty(self, 'status', {
      get() {
        // 除了登录重定向401，别的请求都强制200
        return actual.status === CODE.LOGIN ? CODE.LOGIN : CODE.SUCCESS;
      }
    });

    // 这些属性，纯代理完事了
    const proxyList = [
      "statusText",
      "responseType",
      "response",
      "responseXML",
      "upload",
      "ontimeout",
      "timeout",
      "withCredentials",
      "onload",
      "onerror",
      "onprogress",
      "onabort",
      "onloadstart",
    ];

    const defineProxy = (url: string) => {
      const mock = isMocked({ responseURL: url });

      // 如果加了延时代理
      if (mock
        && mock.config.delay
        && typeof mock.config.delayMills === 'number'
      ) {
        // 手动加 onloadend（axios会判断这个key）
        self.onloadend = null;
        // 手动加 responseURL（防止延时低于正常 responseURL 赋值时间）
        self.responseURL = url;
        let maxCode = oldXMLHttpRequest.LOADING;
        let ready = false;

        setTimeout(() => ready = true, mock.config.delayMills);

        // 自定义接口响应状态
        Object.defineProperty(self, 'readyState', {
          get() {
            // 在设定的延时触发前，最大的 readyState 也只能是 XMLHttpRequest.LOADING
            const result = ready ? oldXMLHttpRequest.DONE : Math.min(actual.readyState, maxCode);
            return result;
          }
        });

        // 轮询 readyState（暂定50毫秒）触发回调
        const interval = setInterval(() => {
          if (self.readyState === oldXMLHttpRequest.DONE) {
            clearInterval(interval);
            if (self.onreadystatechange) self.onreadystatechange();
            if (self.onloadend) self.onloadend();
          }
        }, 50);

      // 如果没有设置延时，onloadend 和 readyState 还是取原 XMLHttpRequest
      } else {
        proxyList.push('onloadend');
        Object.defineProperty(self, 'readyState', {
          get() {
            return actual.readyState;
          }
        });
      }
    };

    const proxyRequestHeader = (xhr) => {
      requestHeaderProxy.forEach(([key, value]: string[]) => {
        if (!key || !value) return;
        xhr.setRequestHeader(key, value);
      });
    };

    // 拦截 open 方法做延时处理
    Object.defineProperty(self, 'open', {
      writable: true,
      value(...args) {
        const [, url] = args;
        defineProxy(url);
        const result = actual.open.apply(actual, args);
        // open后才能设置请求头
        proxyRequestHeader(actual);
        return result;
      }
    });

    // 拦截 send 方法做请求参数处理
    Object.defineProperty(self, 'send', {
      writable: true,
      value: function (...args) {
        self.requestParams = args[0];
        return actual.send.apply(actual, args);
      }
    });

    proxyList.forEach(function (key) {
      Object.defineProperty(self, key, {
        get() {
          return actual[key];
        },
        set(val) {
          actual[key] = val;
        }
      });
    });

    // 这些方法，纯代理完事了
    [
      "addEventListener",
      "abort",
      "getAllResponseHeaders",
      "getResponseHeader",
      "overrideMimeType",
      "setRequestHeader",
      "removeEventListener",
    ].forEach(function (key) {
      Object.defineProperty(self, key, {
        writable: true,
        value: function (...args) {
          return actual[key].apply(actual, args);
        }
      });
    });
  };

  // 状态码
  [
    'UNSENT',
    'OPENED',
    'HEADERS_RECEIVED',
    'LOADING',
    'DONE',
  ].forEach(function (key) {
    Object.defineProperty(XMLHttpRequest, key, {
      get() {
        return oldXMLHttpRequest[key];
      }
    });
  });
};

const initXhook = () => {
  // xhook.before((request, callback) => {
  //   console.log(request);
  //   callback();
  // });
  xhook.after((request, response) => {
    console.log(request);
    console.log(response);
  });
};

const init = () => {
  initListener();
  proxyXMLHttpRequest();
  // initXhook();
};

init();
