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

// 响应头配置
let responseHeaderProxy = undefined;

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
    proxyResponse(...result);
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
      case EVENT.init_res_header:
        responseHeaderProxy = data;
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
const proxyRequestHeader = (
  request,
  extraHeaders = requestHeaderProxy || []
) => {
  const { headers } = request;
  extraHeaders.forEach(([key, value]: string[]) => {
    if (!key || !value) return;
    headers[key] = value;
  });
  return request;
};

/**
 * 代理响应头
 *
 * @param response
 */
const proxyResponseHeader = (response) => {
  const { headers } = response;
  const extraHeaders = responseHeaderProxy || [];
  extraHeaders.forEach(([key, value]: string[]) => {
    if (!key || !value) return;
    headers[key] = value;
  });
  return response;
};

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
const proxyResponse = (request, callback, startTime = Date.now()) => {
  const { url, body } = request;
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

/**
 *
 * @param request
 * @param response
 * @returns
 */
const genLogData = (request, response) => {
  return {
    url: request.url,
    response,
  };
};

/**
 *
 * @param request
 * @param response
 * @returns
 */
const recordResponse = (request, response) => {
  try {
    let data;
    if (typeof response.clone === 'function') {
      response = response.clone();
      if (typeof response.text === 'string') {
        data = genLogData(request, response.text);
        return page.send({ type: EVENT.record, data });
      }
      return response.text().then((streamedResponse) => {
        data = genLogData(request, streamedResponse);
        page.send({ type: EVENT.record, data });
      });
    }
    data = genLogData(
      request,
      typeof response.text === 'string' ? response.text : ''
    );
    page.send({ type: EVENT.record, data });
  } catch (error) {
    console.log(error);
  }
};

const initXhook = () => {
  xhook.before((request, callback) => {
    // 黑名单内，直接返回
    if (inBlacklist) return callback();
    proxyRequestHeader(request);
    const ready = isReady();
    // 未准备就绪，异步执行
    if (!ready) return requestQueue.push([request, callback, Date.now()]);
    // 可以代理了
    proxyResponse(request, callback);
  });

  xhook.after((request, response) => {
    // 黑名单内，直接返回
    if (inBlacklist) return;
    proxyResponseHeader(response);
    const { url } = request;
    // 已经mock的接口就不录进去了
    if (isMocked({ url })) return;
    recordResponse(request, response);
  });
};

const init = () => {
  initListener();
  initXhook();
};

init();
