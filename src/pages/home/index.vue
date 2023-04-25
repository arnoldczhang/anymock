<template>
  <main class="container__body">
    <header class="container__header">
      <span class="container__header--left">
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
        <el-dropdown
          split-button
          size="small"
          type="primary"
          @click="openEditGroupNameDialog"
        >
          +添加分组
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openModifyGroupNameDialog">
                <el-link type="success" :underline="false">修改</el-link>
              </el-dropdown-item>
              <el-dropdown-item
                v-if="mockGroupList.length > 1"
                @click="removeMockGroup"
              >
                <el-link type="danger" :underline="false">删除</el-link>
              </el-dropdown-item>
              <el-dropdown-item @click="copyGroup">
                <el-link type="primary" :underline="false">拷贝</el-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </span>
      <span class="container__header--right">
        <el-button
          class="btn"
          type="danger"
          size="small"
          @click="mockTableRef?.handleDeleteAllMock?.()"
        >
          清空mock
        </el-button>
        <el-button
          class="btn mr8"
          type="primary"
          size="small"
          @click="mockTableRef?.handleAddMock?.()"
        >
          +新增mock
        </el-button>
      </span>
    </header>
    <mock-table ref="mockTableRef" :groupId="currentMockGroup?.id" />
  </main>
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
import EditInputValueDialog from '@/components/edit-input-value-dialog.vue';
import { useTabActiveListener } from '@/hooks/useTabActiveListener';
import { useMockGroup } from './useMockGroup';

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

const mockTableRef = ref<InstanceType<typeof MockTable>>();

// 添加分组
const addGroupDialog = ref<InstanceType<typeof EditInputValueDialog>>();
const openEditGroupNameDialog = async () => {
  if (typeof addGroupDialog.value === 'undefined') return;
  const { data: groupName, isCanceled } = await addGroupDialog.value.open();
  if (!isCanceled) {
    await addMockGroup(groupName);
  }
};

// 修改分组名称
const modifyGroupNameDialog = ref<InstanceType<typeof EditInputValueDialog>>();
const openModifyGroupNameDialog = async () => {
  if (typeof modifyGroupNameDialog.value === 'undefined') return;
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
    width: calc(100vw - 232px);
    border-bottom: none !important;
    &:extend(.border-box);
  }
  &__header {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 12px;
    height: 50px;
    border-bottom: 1px solid @border;
    .mock-group {
      font-size: 14px;
      margin-right: 12px;
    }
  }
}
</style>
