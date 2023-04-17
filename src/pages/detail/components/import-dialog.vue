<template>
  <el-dialog
    v-model="visible"
    :title="title || '导入json'"
    width="800px"
    destroy-on-close
  >
    <template #footer>
      <footer class="dialog__footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleImport">确定</el-button>
      </footer>
    </template>
    <article>
      <el-input
        type="textarea"
        :rows="10"
        placeholder="请输入内容"
        resize="none"
        v-model="json"
      />
    </article>
  </el-dialog>
</template>
<script setup lang="ts">
import { ElMessage as Message } from 'element-plus';

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: '',
  }
);

const visible = ref(false);
const json = ref('');

const emit = defineEmits<{
  (e: 'import-json', json: string): void;
}>();

const handleResetDialog = () => {
  json.value = '';
};
const handleOpen = () => {
  visible.value = true;
};
const handleClose = () => {
  visible.value = false;
};
const handleImport = () => {
  try {
    JSON.parse(json.value);
    emit('import-json', json.value);
    handleResetDialog();
    handleClose();
  } catch (err) {
    Message({
      type: 'error',
      message: 'JSON.parse失败，请检查输入',
    });
  }
};
defineExpose({ handleOpen, handleClose });
</script>
<style scoped lang="less"></style>
