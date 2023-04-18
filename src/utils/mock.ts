import * as Mock from 'mockjs';
import cloneDeep from 'lodash/cloneDeep';
import {
  Tree,
  RequestInfo,
  TreeData,
  MockType,
  MockItem,
  MockParam,
  Json,
} from '@/types/mock.d';
import { isObj, isNum, getType, genDefaultTreeData } from './index';
import { mockKey, mockKeyMap } from '../const/selection';

const noop = <T = unknown>(v: T) => v;

/**
 * 判断 mock 结构中的数组
 *
 * - 特征是该层级只有一个元素，且 label === null
 *
 * @param list
 * @returns
 */
const isArrayItem = (list: any[]) =>
  list.length === 1 && list[0]?.label === null;

/**
 * 高亮的mock文案
 * @param mock
 * @returns
 */
export const getMockText = (mock: MockType) => {
  if (Array.isArray(mock)) {
    const [fnName, ...args] = mock;
    return `${mockKeyMap[fnName]}（${args}）`;
  }
  return mockKeyMap[mock];
};

export const getLengthMockText = (range = []) =>
  `随机长度(${range[0]}, ${range[1]})`;

export const getLength = (
  mock?: [string, [number, number]],
  defaultValue = 0
) => {
  if (typeof mock === 'undefined') return defaultValue;
  const [on, range = []] = mock;
  if (on) {
    return toMock([on, ...range]);
  }
  return defaultValue;
};

/**
 * 根据路径语法获取值
 *
 * 比如：
 * - col
 * - ../col
 * - ../../arr[0]
 * - ../obj.ids[$index]
 *
 * @param expression
 * @param param
 */
export const findFieldValue = (expression: string, param: MockParam) => {
  const { key, chain } = param;
  const tempChain = [...chain];
  const backRE = /\.\.\//g;
  const currentRE = /\.{1,}\//g;
  const keyRE = /(?:\.|\[['"]?|['"]?\])/g;
  while (backRE.exec(expression)) tempChain.pop();
  const keyArray = expression.replace(currentRE, '').split(keyRE).filter(noop);

  try {
    let result = tempChain[tempChain.length - 1];
    while (keyArray.length) {
      let iterateKey: string | number = keyArray.shift() as string;
      iterateKey = iterateKey === '$index' ? key : iterateKey;
      result = result[iterateKey];
    }
    return result;
  } catch (err: any) {
    alert(`指定字段：${expression}获取失败`);
    throw new Error(err);
  }
};

/**
 * 【通用】处理mock字段
 *
 * 几种情况
 *
 * - 通用mock，比如 '@word(5, 10)'、'@integer(10, 100)'
 * - 自定义mock，比如 ['custom', '@xxxx']
 * - 指定字段，比如 ['field, 'experimentName']、['field', '../../feature.name']
 * - 指定随机值，比如 ['@pick', 'a', 'b', 'c', ...]
 *
 * @param mock
 * @param param
 * @returns
 */
export const toMock = (mock: MockType, param?: MockParam) => {
  // 给定的通用mock
  if (!Array.isArray(mock)) return Mock.mock(mock);

  const [fnName, ...args] = mock;

  switch (true) {
    // 自定义
    case fnName === mockKey.custom:
      return Mock.mock(args[0]);
    // 指定字段
    case !!(fnName === mockKey.field && param):
      return findFieldValue(args[0] as string, param as MockParam);
    // 指定随机值
    default:
      return Mock.mock(`${fnName}(${args})`);
  }
};

/**
 * 解析纯对象
 * @param rules
 * @param data
 * @param result
 * @param useValue
 */
export const parseObject = (
  rules: TreeData[],
  data: Record<string, any> | null | undefined,
  result: unknown[],
  useValue = true
) => {
  if (data === null || typeof data === 'undefined') {
    return;
  }

  // 指定字段mock需要放最后
  rules
    .sort((pre, next) => {
      if (Array.isArray(next?.mock) && next.mock[0] === mockKey.field) {
        return -1;
      }
      return 1;
    })
    .forEach((rule) => {
      const { label, value, mock, children = [] } = rule;
      // 如果是基础类型，且不是数组生成，更新value字段
      const basic = !isObj(value);
      if (label === null) return;
      const newKey = !(label in data);
      const newValue = useValue || newKey;
      /**
       * 1. 优先更新mock字段
       * 2. 基础类型
       *  - 使用值or值的key不在对象上，则赋值
       * 3. 对象类型
       *  - 值的key不在对象上，则赋值
       *  - 重新处理对象（数组or真对象）
       */
      if (mock) {
        data[label] = toMock(mock, {
          key: label,
          chain: result,
        });
      } else if (basic) {
        if (newValue) data[label] = value;
      } else if (children?.length) {
        if (newKey) data[label] = value;
        if (Array.isArray(data[label])) {
          parseArray(children, data[label], rule, result);
        } else {
          parseObject(children, data[label], result.concat(data[label]));
        }
      }
    });
};

/**
 * 解析数组
 * @param rules
 * @param data
 * @param current
 * @param result
 * @returns
 */
export const parseArray = (
  rules: TreeData[],
  data: any[],
  current: TreeData,
  result: unknown[]
) => {
  const { length = 0, lengthMock, value = [] } = current || {};
  const finalLength = getLength(lengthMock, length);

  // 超出原始数据长度，默认填充第一个数据
  if (finalLength > data.length) {
    let remain = finalLength - data.length;
    while (remain--) {
      data.push(cloneDeep(value[0]));
    }
  } else {
    data.length = finalLength;
  }
  const [firstRule] = rules;
  const isBasicArray = isArrayItem(rules);
  // 基本类型（非嵌套数组）
  const isBasic = isBasicArray && firstRule.type !== 'array';
  // 嵌套数组
  const isNestArray = isBasicArray && firstRule.type === 'array';
  // 基础类型
  if (isBasic) {
    const { mock } = firstRule;
    data.forEach((val, index, array) => {
      if (mock) {
        array[index] = toMock(mock, {
          key: index,
          chain: result.concat(val),
        });
      }
    });
    return data;
  }

  // 嵌套数组
  if (isNestArray) {
    const { children = [] } = firstRule;
    data.forEach((val, index, array) => {
      if (!Array.isArray(val)) array[index] = [];
      parseArray(children, array[index], firstRule, result.concat(val));
    });
    return data;
  }

  // 纯对象
  data.forEach((val, index) => {
    parseObject(rules, val, result.concat(val), !index);
  });
};

/**
 * 获取原始json数据
 *
 * - 默认从 Tag.originData 读原始数据
 * - 如果没有该字段，从 mock 结构解析原始数据
 *
 * @param rules
 * @param origin
 */
export const parseOriginData = (
  rules: TreeData[],
  originData?: Json,
  result: Record<string, unknown> = {}
) => {
  if (originData) return originData;
  rules.forEach(({ label, value }) => {
    if (label === null) {
      return;
    }
    result[label] = cloneDeep(value);
  });
  return result;
};

/**
 * 响应值通用入口
 *
 * @param rules
 * @param config
 * @param requestInfo
 * @param result
 * @returns
 */
export const parseResponse = (
  rules: TreeData[],
  config: MockItem,
  requestInfo?: RequestInfo,
  result: Record<string, unknown> = {}
) => {
  const { onlyProxy } = config;

  // 支持纯代理模式
  if (onlyProxy) {
    return parseOriginData(rules, requestInfo?.originData, result);
  }

  rules.forEach((rule) => {
    const { label, value, mock, type, children = [] } = rule;

    if (label === null) {
      return;
    }

    const newValue = cloneDeep(mock ? toMock(mock) : value);
    result[label] = newValue;

    const dataChain = [result].concat(newValue);

    if (type === 'object' && children.length) {
      parseObject(children, newValue, dataChain);
    } else if (type === 'array') {
      parseArray(children, newValue, rule, dataChain);
    }
  });
  return result;
};

/**
 * 将json转为el-tree需要结构
 *
 * - 如果是数组，label取数字类型index
 * - 如果是对象，取key
 *
 * @param json
 */
export const transJson2Tree = (json: Json, result: Tree[] = []): Tree[] => {
  const array = Array.isArray(json);
  return Object.entries(json).reduce((res: Tree[], [key, value]) => {
    const node = genDefaultTreeData();
    node.value = cloneDeep(toRaw(value));
    const type = getType(value);
    node.type = type;
    // 如果是数组，label取数字类型index；如果是对象取key
    node.label = array ? Number(key) : key;

    if (type === 'object' || type === 'array') {
      node.children = transJson2Tree(value as Json);
    }

    res.push(node);
    return res;
  }, result);
};

/**
 * 将 el-tree 结构转为 json
 * @param tree
 * @returns
 */
export const transTree2Json = (tree: Tree[] = [], result: Json = {}): Json => {
  // 基本类型
  if (!tree.length) return result;
  // 判定当前结构是数组（见 transJson2Tree 对 label 的解释）
  const arrayType = tree.every(({ label }) => isNum(label));

  // 初始化是对象，所以重置为[]
  if (arrayType && !Array.isArray(result)) {
    result = [];
  }

  tree.forEach(({ label, value, type, children = [] }) => {
    let newValue: unknown;

    switch (true) {
      case Boolean(children?.length):
        newValue = transTree2Json(children);
        break;
      case type === 'object':
        newValue = {};
        break;
      case type === 'array':
        newValue = [];
        break;
      default:
        newValue = value;
        break;
    }

    if (Array.isArray(result)) {
      result.push(newValue);
    } else {
      result[label] = newValue;
    }
  });
  return result;
};
