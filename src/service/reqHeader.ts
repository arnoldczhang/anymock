import { ReqHeaderList } from '@/types/mock';
import { REQ_HEADER_KEY } from '@/const/storageKey';
import { getStorage, setStorage } from '@/utils/storage';
import EVENT from '@/const/event';
import { tab } from '@/utils/message';

export const update = async (list: ReqHeaderList) => {
  await setStorage(REQ_HEADER_KEY, list);
  tab.send({ type: EVENT.update });
};

export const getList = (defaultValue = []) =>
  getStorage(REQ_HEADER_KEY, defaultValue);
