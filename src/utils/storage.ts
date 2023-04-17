import { target } from './env';

const useStorage =
  typeof target.chrome !== 'undefined' &&
  typeof target.chrome.storage !== 'undefined';

let storageData: any = null;

export const initStorage = () => {
  return new Promise((resolve) => {
    if (useStorage) {
      target.chrome.storage.local.get(null, (result: any) => {
        storageData = result;
        resolve(true);
      });
    } else {
      storageData = {};
      resolve(true);
    }
  });
};

/**
 * 获取storage（考虑临时的内存缓存）
 * @param key
 * @param defaultValue
 * @returns
 */
export const getStorage = async (key: string, defaultValue: any = null) => {
  await checkStorage();
  if (useStorage) {
    return getDefaultValue(storageData[key], defaultValue);
  } else {
    try {
      return getDefaultValue(
        JSON.parse(localStorage.getItem(key) || 'null'),
        defaultValue
      );
    } catch (e) {
      // TODO
    }
  }
};

/**
 * 获取storage（强制取浏览器缓存）
 * @param key
 * @param defaultValue
 * @returns
 */
export const refreshAndGetStorage = async (
  key: string,
  defaultValue: any = null
) => {
  await initStorage();
  return getStorage(key, defaultValue);
};

export const setStorage = async (key: string, val: any) => {
  await checkStorage();
  if (useStorage) {
    storageData[key] = val;
    target.chrome.storage.local.set({ [key]: val });
  } else {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      // TODO
    }
  }
};

export const removeStorage = async (key: string) => {
  await checkStorage();
  if (useStorage) {
    delete storageData[key];
    target.chrome.storage.local.remove([key]);
  } else {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // TODO
    }
  }
};

export const clearStorage = async () => {
  await checkStorage();
  if (useStorage) {
    storageData = {};
    target.chrome.storage.local.clear();
  } else {
    try {
      localStorage.clear();
    } catch (e) {
      // TODO
    }
  }
};

/**
 * 获取当前所有配置
 * @returns
 */
export const getCurrentStorage = () => {
  if (useStorage) {
    return storageData || {};
  }
  return Object.keys(localStorage).reduce((res, key: string) => {
    res[key] = JSON.parse(localStorage.getItem(key) || '');
    return res;
  }, {} as Record<string, string | null>);
};

const checkStorage = async () => {
  if (!storageData) {
    await initStorage();
  }
};

const getDefaultValue = (value: any, defaultValue: any) => {
  if (value == null) {
    return defaultValue;
  }
  return value;
};
