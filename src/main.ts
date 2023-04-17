import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import './ui/style.less';
import router from './router';
import App from './App.vue';
import { registryComponents } from './install-component';

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
app.mount('#app');
