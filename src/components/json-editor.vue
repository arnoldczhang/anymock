<template>
  <Codemirror
    v-model="json"
    :style="{ height: '100%' }"
    placeholder="请输入"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    v-bind="attrs"
  />
</template>
<script setup lang="ts">
import { json as jsonPlugin } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import { Codemirror } from 'vue-codemirror';

type Props = {
  modelValue: string;
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});
const attrs = useAttrs();

const emit = defineEmits<{
  (e: 'update:modelValue', data: string): void;
}>();

const json = computed({
  get: () => {
    return props.modelValue;
  },
  set: (value) => {
    emit('update:modelValue', value);
  },
});

const extensions = ref<any[]>([jsonPlugin(), EditorView.lineWrapping]);
</script>
