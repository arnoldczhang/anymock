import { ReqHeaderList } from '@/types/mock';
import { RES_HEADER_KEY } from '@/const/storageKey';
import { getStorage, setStorage } from '@/utils/storage';
import EVENT from '@/const/event';
import { tab } from '@/utils/message';

export const update = async (list: ReqHeaderList) => {
  await setStorage(RES_HEADER_KEY, list);
  tab.send({ type: EVENT.update });
};

export const getList = (defaultValue = []) =>
  getStorage(RES_HEADER_KEY, defaultValue);
