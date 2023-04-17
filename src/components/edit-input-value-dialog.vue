<template>
  <el-dialog width="540px" :model-value="revealed" :before-close="dialog.cancel" :title="title">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="auto" @submit.prevent>
      <el-form-item :label="`${label}：`" prop="value">
        <el-input v-model="form.value" placeholder="请输入" :maxlength="maxlength"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialog.cancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useConfirmDialog } from '@vueuse/core';
import { getRequiredRule } from '@/utils/validators';

const props = withDefaults(
  defineProps<{
    title: string;
    label: string;
    defaultValue?: string;
    maxlength?: number;
  }>(),
  {
    maxlength: 100,
    defaultValue: ''
  },
);

// 表单
const formRef = ref<any>(null);
const form = reactive({
  value: '',
});
const resetForm = () => {
  form.value = props.defaultValue;
};
const rules = {
  value: [getRequiredRule(`请输入`)],
};

// 弹窗交互
const revealed = ref(false);
const dialog = useConfirmDialog(revealed);
dialog.onReveal(resetForm);
const handleConfirm = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    dialog.confirm(form.value);
  }
};

// 外部调用方式 const { data, isCanceled } = await open();
defineExpose({
  open: dialog.reveal,
});
</script>

<style lang="less" scoped>
.el-form {
  margin-bottom: -16px;
}
</style>
