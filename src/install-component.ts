import { createApp } from 'vue';
import InputView from '@/components/input-view.vue';
import JsonEditor from '@/components/json-editor.vue';
import Icon from '@/components/icon.vue';
import TextOverflow from '@/components/text-overflow.vue';

export const registryComponents = (app: ReturnType<typeof createApp>) => {
  app.component('input-view', InputView);
  app.component('json-editor', JsonEditor);
  app.component('c-icon', Icon);
  app.component('text-overflow', TextOverflow);
};
