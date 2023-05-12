import 'element-plus/dist/index.css';
import './ui/style.less';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import useLogStore from '@/store/log';
import useTableStore from '@/store/table';
import type { Log, MessageType } from '@/types/mock.d';
import { runtime, tab } from '@/utils/message';

import App from './App.vue';
import EVENT from './const/event';
import { registryComponents } from './install-component';
import router from './router';

/**
 * 初始化监听
 *
 * - 监听devtool消息
 * - 监听录制消息
 * - 重置录制状态
 *
 */
const initListener = () => {
  const logStore = useLogStore();
  const tableStore = useTableStore();
  tab.send({ type: EVENT.record_state, data: '' });
  runtime.listen((message: MessageType) => {
    const { type, data } = message;
    switch (type) {
      case EVENT.record:
        logStore.add(data as Log);
        break;
      case EVENT.inactive:
        logStore.refresh();
        break;
      case EVENT.active:
        tableStore.refresh();
        break;
    }
  });
};

const app = createApp(App);

const pinia = createPinia();

app.use(ElementPlus);
app.use(router);
// 注册业务组件
registryComponents(app);
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(pinia);
initListener();
app.mount('#app');
