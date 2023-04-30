import { v4 as uuid } from 'uuid';

import { STATUS } from '@/const/index';
import {
  Json,
  MockItem,
  ReqHeaderItem,
  Tag,
  Tree,
  TreeData,
  Type,
} from '@/types/mock.d';

/**
 * 判断类型
 * @param val
 * @returns
 */
export const getType = (val: unknown) => {
  if (Array.isArray(val)) return 'array';
  if (isObj(val)) return 'object';
  if (val === null) return 'null';
  return typeof val;
};

// 非null对象
export const isObj = (val: unknown) => val && typeof val === 'object';

export const isNum = (val: unknown) => typeof val === 'number';

export const genCaseName = (random = Date.now()) => `case_${random}`;

export const genCaseNameCn = (random = Date.now()) => `案例_${random}`;

/**
 * 生成Tree默认结构
 * @returns
 */
export const genDefaultTreeData = (): Tree => ({
  id: uuid(),
  label: '',
  type: 'null' as Type,
  value: null,
});

/**
 * 生成请求头默认结构
 * @returns
 */
export const genDefaultReqHeader = (): ReqHeaderItem => ({
  id: uuid(),
  name: `请求头-${Date.now()}`,
  selected: false,
  params: [],
});

/**
 * 生成响应头默认结构
 * @returns
 */
export const genDefaultResHeader = (): ReqHeaderItem => ({
  id: uuid(),
  name: `响应头-${Date.now()}`,
  selected: false,
  params: [],
});

/**
 * 填充数组中的默认元素
 * @returns
 */
export const genArrayDefaultData = () => ({
  id: uuid(),
  label: 'col',
  value: 'hello world',
  type: 'string' as Type,
});

/**
 * 生成各种类型的初始数据
 */
export const genAllData: Record<string, Function> = {
  boolean: () => ({ id: uuid(), value: true }),
  number: () => ({ id: uuid(), value: 0 }),
  string: () => ({ id: uuid(), value: '' }),
  null: () => ({ id: uuid(), value: null }),
  array: (data: TreeData) => {
    let { length = 0 } = data;
    length = Math.max(length, 1);
    return {
      id: uuid(),
      value: Array.from({ length }).map(() => ({
        col: uuid(),
      })),
      length: length,
      children: [genArrayDefaultData()],
    };
  },
  object: () => ({
    id: uuid(),
    value: {},
    children: [],
  }),
};

/**
 * 生成mock数据结构
 * @returns
 */
export const genTreeData = (): TreeData => {
  return {
    id: uuid(),
    label: 'data',
    value: null,
    type: 'null',
    children: [],
  };
};

/**
 * 生成单个案例通用结构
 * @returns
 */
export const genTag = (originData?: Json, data?: TreeData[]): Tag => {
  const random = Date.now();
  return {
    id: uuid(),
    name: genCaseName(random),
    nameCn: genCaseNameCn(random),
    description: '这是一个案例',
    status: STATUS.enable,
    originData: originData || { data: null },
    data: data || [genTreeData()],
  };
};

/**
 * 生成单个代理通用结构
 * @returns
 */
export const genMockInterface = (groupId = '', name = ''): MockItem => {
  const random = Date.now();
  return {
    id: uuid(),
    groupId,
    name: name || `/api/list_${random}`,
    nameCn: name || `列表_${random}`,
    status: STATUS.enable,
    delay: false,
    tags: [genTag()],
  };
};

/**
 * 处理复杂数组和简单数组
 *
 * @param key
 * @param value
 * @returns
 */
export const transArrayValue = (key: string | null, value: any): TreeData => {
  const [first] = value;
  return {
    id: uuid(),
    label: key,
    value,
    type: 'array',
    length: value.length,
    children: isObj(first)
      ? transfromJson2TreeData(first)
      : [transBasicValue(null, first)],
  };
};

/**
 * 处理纯对象
 * @param key
 * @param value
 * @returns
 */
export const transObjectValue = (key: string, value: any): TreeData => {
  return {
    id: uuid(),
    label: key,
    value,
    type: 'object',
    children: transfromJson2TreeData(value),
  };
};

/**
 * 处理五大基础类型
 * @param key
 * @param value
 * @returns
 */
export const transBasicValue = (key: string | null, value: any): TreeData => {
  return {
    id: uuid(),
    label: key,
    value,
    type: typeof value,
    mock: '',
  };
};

export const transKeyValue = (key: string, value: any): TreeData => {
  if (isObj(value)) {
    if (Array.isArray(value)) {
      return transArrayValue(key, value);
    }
    return transObjectValue(key, value);
  }
  return transBasicValue(key, value);
};

/**
 * 原始json转mock结构
 * @param json
 * @returns
 */
export const transfromJson2TreeData = (
  json: Record<any, any> | any[]
): TreeData[] => {
  const keyArray = Object.keys(json);
  if (Array.isArray(json)) {
    return [transArrayValue(null, json)];
  }
  return keyArray.map((key) => transKeyValue(key, json[key]));
};

export const genBlackListItem = (url: string) => ({
  key: uuid(),
  url: url || 'https://www.baidu.com',
});

/**
 * 复制到剪贴板
 * @param value
 * @returns
 */
export const copy = (value: string) => {
  const copyHandler = (evt: Event) => {
    (evt as any).clipboardData.setData('text/plain', value);
    evt.preventDefault();
  };
  document.addEventListener('copy', copyHandler);
  const result = document.execCommand('Copy');
  document.removeEventListener('copy', copyHandler);
  return !!result;
};

/**
 * 校验tag正确性
 *
 * - 先简单校验一波，后面再看
 *
 * @param tag
 * @param others
 */
export const validateTag = (tag: Tag, others?: Tag[]) => {
  const keys = ['id', 'name', 'nameCn', 'description', 'status', 'data'];

  keys.forEach((key) => {
    if (!(key in tag)) {
      throw new Error(`缺少key：${key}`);
    }
  });

  if (Array.isArray(others)) {
    const ids = others.map((tag) => tag.id);
    if (ids.includes(tag.id)) {
      throw new Error(`id：${tag.id} 重复了，手动改下吧`);
    }
  }
};

/**
 * 获取 location.pathname
 *
 * @param url
 * @returns
 */
export const getPathName = (url: string) => {
  try {
    const { pathname } = new URL(url);
    return pathname;
  } catch (err) {
    return url;
  }
};
