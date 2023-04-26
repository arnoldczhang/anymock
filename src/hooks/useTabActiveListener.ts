import { listenTabActivated, unListenTabActivated } from '@/utils/message';
import { initStorage } from '@/utils/storage';

// 监听 tab/标签页 切换
export const useTabActiveListener = (callback: Function) => {
  let listener: (p: unknown) => void;
  onBeforeMount(() => {
    listener = listenTabActivated(async () => {
      // 先从storage中那最新数据
      await initStorage();
      callback();
    });
  });
  onBeforeUnmount(() => {
    if (listener) {
      unListenTabActivated(listener);
    }
  });
};
