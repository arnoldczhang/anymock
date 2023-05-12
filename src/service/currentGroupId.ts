// 当期接口分组相关模拟请求
import { CURRENT_GROUP_ID_KEY } from '@/const/storageKey';
import { getStorage, setStorage } from '@/utils/storage';

import { api } from '.';

// 从storage获取当期分组id
export const get = async () => {
  return await getStorage(CURRENT_GROUP_ID_KEY, '');
};
// 向storage更新当前分组id
export const update = async (currentGroupId: string) => {
  await setStorage(CURRENT_GROUP_ID_KEY, currentGroupId);
  await api.currentMockList.update();
};
