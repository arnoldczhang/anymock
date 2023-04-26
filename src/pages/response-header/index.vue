<template>
  <RequestHeader
    :saveHandler="handleSave"
    :genHandler="genDefaultResHeader"
    :getHandler="api.resHeader.getList"
  />
</template>
<script lang="ts" setup>
import { ElMessage as Message } from 'element-plus';
import RequestHeader from '../request-header/index.vue';
import { ReqHeaderList } from '@/types/mock.d';
import { genDefaultResHeader } from '@/utils';
import useCommonStore from '@/store/common';
import { api } from '@/service';

const store = useCommonStore();

const handleSave = async (list: ReqHeaderList) => {
  try {
    await api.resHeader.update(list);
    store.updateResHeader();
    Message.success('保存成功');
  } catch (err: any) {
    Message.error(`保存失败，原因：${err.message}`);
  }
};
</script>
