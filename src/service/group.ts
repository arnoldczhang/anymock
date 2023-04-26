// 接口分组相关模拟请求
import { MockGroup } from '@/types/mock';
import { getStorage, setStorage } from '@/utils/storage';
import { MOCK_GROUP_KEY } from '@/const/storageKey';
import { genMockGroup } from './helper';
import cloneDeep from 'lodash/cloneDeep';
import { api } from '.';

export const DEFAULT_GROUP = {
  id: 'defaultGroup',
  name: '默认分组',
};

// 分组列表
let mockGroupList: MockGroup[];
// 从storage获取分组列表
const getMockGroupListFromStorage = async () => {
  mockGroupList = await getStorage(MOCK_GROUP_KEY, []);
  if (!mockGroupList.length) {
    // 没有分组时，添加一个【默认分组】
    mockGroupList.push(DEFAULT_GROUP);
    await updateMockGroupListToStorage();
  }
};
// 向storage更新分组列表
const updateMockGroupListToStorage = async () => {
  await setStorage(MOCK_GROUP_KEY, mockGroupList);
};

export const update = async (list: MockGroup[]) => {
  await setStorage(MOCK_GROUP_KEY, list);
};

// 添加分组
export const add = async (name: string) => {
  const newMockGroup = genMockGroup(name);
  mockGroupList.push(newMockGroup);
  await updateMockGroupListToStorage();
  return newMockGroup.id;
};
// 删除分组
export const remove = async (id: string) => {
  const index = mockGroupList.findIndex((item) => item.id === id);
  if (index > -1) {
    mockGroupList.splice(index, 1);
  }
  await updateMockGroupListToStorage();
};
// 修改分组名
export const modify = async (mockGroup: MockGroup) => {
  const index = mockGroupList.findIndex((item) => item.id === mockGroup.id);
  if (index > -1) {
    mockGroupList.splice(index, 1, mockGroup);
  }
  await updateMockGroupListToStorage();
};
// 获取分组列表
export const getList = async () => {
  await getMockGroupListFromStorage();
  return cloneDeep(mockGroupList);
};
// 复制分组及其接口列表
export const copy = async (mockGroup: MockGroup) => {
  const random = Date.now();
  const newName = `${mockGroup.name}_copy_${random}`;
  const newGroupId = await add(newName);
  // copy分组下的接口列表
  await api.mock.copyList({
    fromId: mockGroup.id,
    toId: newGroupId,
  });
  return newGroupId;
};
