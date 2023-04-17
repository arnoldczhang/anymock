import { ReqHeaderList } from '@/types/mock';
import { REQ_HEADER_KEY } from '@/const/storageKey';
import { getStorage, setStorage } from '@/utils/storage';
import { api } from '.';

export const update = async (list: ReqHeaderList) => {
  await setStorage(REQ_HEADER_KEY, list);
  await api.currentMockList.update();
};

export const getList = (defaultValue = []) =>
  getStorage(REQ_HEADER_KEY, defaultValue);
