import { RECORDER_STATE_KEY } from '@/const/storageKey';

export const updateState = (state?: boolean | string) => {
  window.sessionStorage.setItem(RECORDER_STATE_KEY, String(state || ''));
};

export const getState = () => window.sessionStorage.getItem(RECORDER_STATE_KEY);
