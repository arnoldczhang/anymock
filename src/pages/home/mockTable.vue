<template>
  <article class="table">
    <el-table ref="table" :data="searchTableData" v-bind="tableProps">
      <el-table-column
        prop="name"
        label="接口"
        width="320"
        show-overflow-tooltip
      >
        <template #header>
          <header class="header--name">
            <span>接口</span>
            <el-input
              v-model="search"
              class="header--name__input"
              placeholder="可搜索接口名"
              :prefix-icon="Search"
              size="small"
            />
          </header>
        </template>
        <template #default="{ row }">
          <input
            v-model="row.name"
            class="input--simple column--name"
            spellcheck="false"
            @blur="handleSave"
          />
        </template>
      </el-table-column>
      <el-table-column prop="delay" label="请求延时" width="420">
        <template #default="{ row }">
          <el-radio-group v-model="row.delay" @change="handleSave">
            <el-radio :label="false">关闭</el-radio>
            <el-radio :label="true">
              <el-input-number
                v-model="row.delayMills"
                :disabled="!row.delay"
                :controls="false"
                @change="handleSave"
              />
              <label class="ml4">毫秒</label>
            </el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-switch v-model="row.status" @change="handleStateChange(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="operation" label="操作">
        <template #default="{ row }">
          <el-button
            type="success"
            size="small"
            :tabindex="-1"
            @click="handleGoDetail(row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            :tabindex="-1"
            @click="handleDeleteMock(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </article>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { ElTable } from 'element-plus';

import { useTabActiveListener } from '@/hooks/useTabActiveListener';
import useTableStore from '@/store/table';
import type { MockItem } from '@/types/mock';
import { scrollTo } from '@/utils/dom';

import { useTableData } from './useTableData';

const props = withDefaults(
  defineProps<{
    groupId: string;
  }>(),
  {
    groupId: '',
  }
);

const { state } = storeToRefs(useTableStore());
const table = ref<InstanceType<typeof ElTable>>();
const router = useRouter();
const tableProps = computed(
  () =>
    ({
      'header-row-class-name': 'table__header',
      height: 'calc(100vh - 83px)',
      size: 'small',
    } as any)
);

const {
  search,
  getTableData,
  searchTableData,
  handleAddMock: handleAdd,
  handleStateChange,
  handleDeleteMock,
  handleDeleteAllMock,
  handleSave,
} = useTableData(computed(() => props.groupId));

const handleAddMock = () => {
  handleAdd();
  // 自动滚到新增位置
  nextTick(() => {
    const rows = table.value?.$el.querySelectorAll('.el-table__row') || [];
    if (rows.length) {
      scrollTo(rows[rows.length - 1]);
    }
  });
};

const handleGoDetail = (data: MockItem) => {
  const { id } = data;
  router.push({ name: 'detail', params: { id } });
};

useTabActiveListener(() => {
  getTableData();
  table.value?.doLayout();
});

/**
 * 修复切换Mock tab时，table布局错乱问题
 */
watch(
  () => state.value,
  () => table.value?.doLayout()
);

defineExpose({
  handleDeleteAllMock,
  handleAddMock,
});
</script>
<style scoped lang="less">
.table {
  flex: 1;
  :deep(.table__header) {
    height: 48px;
  }
}
.column--name {
  width: 300px;
  color: var(--el-text-color-primary);
}
.header--name {
  display: flex;
  align-items: center;
  &__input {
    width: 150px;
    margin-left: 8px;
  }
}

.row {
  &--delay {
    display: flex;
    align-items: center;
  }
}
.footer {
  margin-top: 8px;
  display: flex;
  justify-content: end;
  padding: 10px 0;
}
</style>
