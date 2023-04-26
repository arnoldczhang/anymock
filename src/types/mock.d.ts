export type Type = 'object'
  |'array'
  |'null'
  |'string'
  |'number'
  |'boolean'
  | 'bigint'
  | 'symbol'
  | 'undefined'
  | 'function';

export type MockType = string | Array<string | number>;

export interface TreeData {
  id: string;
  // 对象 -> key || 数组 -> null
  label: string | null;
  // 对象 -> value || 数组 -> 单个元素值
  value: any;
  // 值类型
  type: Type;
  // 数组长度
  length?: number;
  // 数组长度mock（现在只有@integer）
  lengthMock?: [string, [number, number]];
  // 是否开启mock，以及mock了什么，见【mock.ts#toMock】
  mock?: MockType;
  children?: TreeData[];
}

export type Json = Record<string, any> | Array<any>;

export interface RequestInfo {
  // 请求url
  url: string;
  // 请求参数
  request: string;
  // 响应值
  response: string;
  // 案例原始数据
  originData?: Json;
}

export interface Tag {
  id: string;
  // 案例名
  name: string;
  // 案例中文名（现在没用）
  nameCn: string;
  // 案例描述（现在没用）
  description: string;
  // 启用or禁用
  status: boolean;
  // 案例原始数据
  originData: Json;
  // 案例mock结构
  data: TreeData[];
}

export interface MockItem {
  id: string;
  // 所属分组的id
  groupId: string;
  // 接口名
  name: string;
  // 接口中文名
  nameCn: string;
  // 启用or禁用
  status: boolean;
  // 是否开启延时
  delay: boolean;
  // 延时时长
  delayMills?: number;
  // 接口的各模拟案例
  tags: Tag[];
  // 纯透传原始json
  onlyProxy?: boolean;
}

/**
 * 接口分组
 */
export interface MockGroup {
  id: string;
  name: string;
}

/**
 * 通用消息传递类型
 */
export interface MessageType {
  type: string;
  [key: string]: unknown;
}

/**
 * mock指定字段结构
 */
export interface MockParam {
  key: string | number;
  chain: any[];
}

/**
 * 黑名单结构
 */
export interface Url {
  key: string;
  url: string;
}

/**
 * el-tree需要结构
 */
export interface Tree {
  id: string | number;
  label: string | number;
  type: Type;
  value: unknown;
  children?: Tree[];
}

// .vue中请使用TreeNode
export type TreeNode = Tree;

export type ReqHeaderItem = {
  id: string;
  name: string;
  selected: boolean;
  params: string[][];
};

export type ReqHeaderList = ReqHeaderItem[];

export type Log = {
  id?: string;
  url: string;
  response: string;
  // 标记是否已被添加
  used?: boolean;
};