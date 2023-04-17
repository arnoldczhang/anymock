<template>
  <section class="input__container">
    <span v-if="!editing" class="container--readonly">
      {{ props.text }}
      <c-icon
        class="ml8"
        icon="Edit"
        color="#409EFF"
        @click="handleEditState(true)"
      />
    </span>
    <span v-else class="container--writable">
      <label class="noshrink">{{ props.label }}</label>
      <el-input
        class="w320"
        ref="inputRef"
        v-model="innerModel"
        @keypress.enter="handleSave"
      />
      <c-icon
        :size="20"
        color="#F56C6C"
        icon="Close"
        class="ml8"
        @click="handleEditState(false)"
      />
      <c-icon
        :size="20"
        icon="Check"
        color="#67C23A"
        class="ml8"
        @click="handleSave"
      />
    </span>
  </section>
</template>
<script setup lang="ts">
import type { ElInput } from 'element-plus';

const editing = ref(false);
const innerModel = ref('');
const inputRef = ref<InstanceType<typeof ElInput>>();

const props = defineProps<{
  text?: string;
  label?: string;
  model: string;
}>();

const emit = defineEmits<{
  (e: 'confirm', data: string): void;
}>();

watch(
  () => props.model,
  (val: string) => {
    innerModel.value = val;
  },
  { immediate: true }
);

const handleSave = () => {
  emit('confirm', innerModel.value);
  handleEditState(false);
};

const handleEditState = (state: boolean) => {
  editing.value = state;
  if (state) {
    nextTick(() => {
      inputRef?.value?.select();
    });
  }
};

defineExpose({
  handleEditState,
});
</script>
<style scoped lang="less">
.container {
  &--readonly,
  &--writable {
    display: flex;
    align-items: center;
  }
}
.sys-icon-pencil {
  color: #327dff;
}
.sys-icon-close {
  color: #ff4940;
}
.sys-icon-check-line {
  color: #31bf30;
}
</style>
