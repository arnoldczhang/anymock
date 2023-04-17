<template>
  <div class="container__body">
    <div class="container__body__header">
      <span class="mock-group">
        接口分组：
        <el-select
          size="small"
          :model-value="currentMockGroup?.id"
          @update:model-value="setCurrentMockGroup"
        >
          <el-option
            v-for="item in mockGroupList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </span>
      <el-button type="primary" size="small" @click="openEditGroupNameDialog">
        添加分组
      </el-button>
      <el-button type="primary" size="small" @click="openModifyGroupNameDialog">
        修改分组名称
      </el-button>
      <el-button
        v-if="mockGroupList.length > 1"
        type="danger"
        size="small"
        @click="removeMockGroup"
      >
        删除当前分组
      </el-button>
      <el-button type="primary" size="small" @click="copyGroup">
        复制分组
      </el-button>
    </div>
    <mock-table :groupId="currentMockGroup?.id" />
  </div>
  <edit-input-value-dialog
    title="添加接口分组"
    label="接口分组名称"
    ref="addGroupDialog"
  />
  <edit-input-value-dialog
    title="修改接口分组名称"
    label="接口分组名称"
    :default-value="currentMockGroup?.name"
    ref="modifyGroupNameDialog"
  />
</template>

<script lang="ts" setup>
import MockTable from './mockTable.vue';
import { useMockGroup } from './useMockGroup';
import EditInputValueDialog from '@/components/edit-input-value-dialog.vue';
import { useTabActiveListener } from './useTabActiveListener';

const {
  currentMockGroup,
  mockGroupList,
  setCurrentMockGroup,
  getMockGroupList,
  addMockGroup,
  removeMockGroup,
  modifyMockGroupName,
  copyGroup,
  getCurrentGroupId,
} = useMockGroup();

// 添加分组
const addGroupDialog = ref<any>(null);
const openEditGroupNameDialog = async () => {
  const { data: groupName, isCanceled } = await addGroupDialog.value.open();
  if (!isCanceled) {
    await addMockGroup(groupName);
  }
};

// 修改分组名称
const modifyGroupNameDialog = ref<any>(null);
const openModifyGroupNameDialog = async () => {
  const { data: name, isCanceled } = await modifyGroupNameDialog.value.open();
  if (!isCanceled) {
    await modifyMockGroupName({
      id: currentMockGroup.value?.id as string,
      name,
    });
  }
};

const init = async () => {
  const groupId = await getCurrentGroupId();
  await getMockGroupList(!groupId);
  if (groupId) {
    setCurrentMockGroup(groupId);
  }
};

onMounted(init);

useTabActiveListener(init);
</script>

<style lang="less" scoped>
.container {
  &__body {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: calc(100vw - 200px);
    &__header {
      padding: 12px;
      .mock-group {
        font-size: 14px;
        margin-right: 12px;
      }
    }
  }
}
</style>
