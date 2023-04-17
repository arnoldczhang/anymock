// 接口列表相关模拟请求
import { MOCK_INTERFACE_KEY } from '@/const/storageKey';
import { MockItem } from '@/types/mock';
import { getStorage, setStorage } from '@/utils/storage';
import cloneDeep from 'lodash/cloneDeep';
import { v4 as uuid } from 'uuid';
import { api } from '.';
import { DEFAULT_GROUP } from './group';

// 接口列表
let mockInterfaceList: MockItem[];
// 从storage获取接口列表
const getMockInterfaceListFromStorage = async () => {
  mockInterfaceList = await getStorage(MOCK_INTERFACE_KEY, []);
  let needUpdate = false;
  // 没有groupId的旧数据放到默认分组中
  mockInterfaceList.forEach((item) => {
    if (!item.groupId) {
      item.groupId = DEFAULT_GROUP.id;
      needUpdate = true;
    }
  });
  if (needUpdate) {
    await updateInterfaceListToStorage();
  }
};
// 向storage更新接口列表
const updateInterfaceListToStorage = async () => {
  await setStorage(MOCK_INTERFACE_KEY, mockInterfaceList);
  await api.currentMockList.update();
};

// 获取接口列表
export const getList = async (groupId: string) => {
  await getMockInterfaceListFromStorage();
  const list = mockInterfaceList.filter((item) => item.groupId === groupId);
  return cloneDeep(list);
};
// 更新分组下的接口列表
export const updateList = async (newList: MockItem[], groupId: string) => {
  const otherGroupMockInterfaceList = mockInterfaceList.filter(
    (item) => item.groupId !== groupId
  );
  mockInterfaceList = [...otherGroupMockInterfaceList, ...newList];
  await updateInterfaceListToStorage();
};
// 清空分组下的接口列表
export const clearList = async (groupId: string) => {
  await updateList([], groupId);
};
// 将fromId分组中的接口列表复制到toId分组下
export const copyList = async ({
  fromId,
  toId,
}: {
  fromId: string;
  toId: string;
}) => {
  const fromList = mockInterfaceList.filter((item) => item.groupId === fromId);
  const toList = cloneDeep(fromList).map((item) => {
    // 复制的接口赋新的id和groupId
    item.id = uuid();
    item.groupId = toId;
    return item;
  });
  await updateList(toList, toId);
};

// 获取接口
export const get = async (id: string) => {
  await getMockInterfaceListFromStorage();
  const mockInterface = mockInterfaceList.find((item) => item.id === id);
  if (mockInterface) {
    return cloneDeep(mockInterface);
  } else {
    return Promise.reject();
  }
};
// 删除接口
export const remove = async (id: string) => {
  const index = mockInterfaceList.findIndex((item) => item.id === id);
  mockInterfaceList.splice(index, 1);
  await updateInterfaceListToStorage();
};
// 修改接口
export const modify = async (mockInterface: MockItem) => {
  const index = mockInterfaceList.findIndex(
    (item) => item.id === mockInterface.id
  );
  mockInterfaceList.splice(index, 1, mockInterface);
  await updateInterfaceListToStorage();
};
