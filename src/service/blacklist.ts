import { Url } from '@/types/mock';
import { BLACKLIST_KEY } from '@/const/storageKey';
import { getStorage, setStorage } from '@/utils/storage';

export const update = async (list: Url[]) => {
  await setStorage(BLACKLIST_KEY, list);
};

export const get = (defaultValue = []) =>
  getStorage(BLACKLIST_KEY, defaultValue);
