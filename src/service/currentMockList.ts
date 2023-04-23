// 当期接口分组下的接口列表相关模拟请求
import { CURRENT_MOCK_LIST_KEY } from '@/const/storageKey';
import EVENT from '@/const/event';
import { runtime } from '@/utils/message';
import { setStorage } from '@/utils/storage';
import { api } from '.';

// 向storage更新当前使用的接口列表(当前选中分组id变化或者接口列表变化之后调用)
export const update = async () => {
  const groupId = await api.currentGroupId.get();
  const currentMockInterfaceList = await api.mock.getList(groupId);
  await setStorage(CURRENT_MOCK_LIST_KEY, currentMockInterfaceList);
  // 【通信】通知脚本更新
  runtime.send({ type: EVENT.update });
};
