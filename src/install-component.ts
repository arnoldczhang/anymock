import { createApp } from 'vue';

import InputView from '@/components/input-view.vue';
import Icon from '@/components/icon.vue';

export const registryComponents = (app: ReturnType<typeof createApp>) => {
  app.component('input-view', InputView);
  app.component('c-icon', Icon);
};
