<template>
  <article class="table">
    <el-table :data="searchTableData" v-bind="tableProps">
      <el-table-column prop="name" label="接口" show-overflow-tooltip>
        <template #header>
          <header class="header--name">
            <span>接口</span>
            <el-input
              class="header--name__input"
              placeholder="可搜索接口名"
              :prefix-icon="Search"
              size="small"
              v-model="search"
            />
          </header>
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
          <el-button type="success" size="small" @click="handleGoDetail(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDeleteMock(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <footer class="footer">
      <el-button
        class="btn"
        type="danger"
        size="small"
        @click="handleDeleteAllMock"
      >
        清空mock
      </el-button>
      <!-- <el-button
        class="btn"
        type="danger"
        size="small"
        @click="handleClearStorage"
      >
        清空storage(仅用于调试)
      </el-button> -->
      <el-button
        class="btn mr8"
        type="primary"
        size="small"
        @click="handleAddMock"
      >
        +新增mock
      </el-button>
    </footer>
  </article>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { MockItem } from '@/types/mock';
import { clearStorage } from '@/utils/storage';
import { ElMessage as Message } from 'element-plus';
import { useTabActiveListener } from './useTabActiveListener';
import { useTableData } from './useTableData';

const props = withDefaults(
  defineProps<{
    groupId: string;
  }>(),
  {
    groupId: '',
  }
);

const router = useRouter();
const tableProps = computed(
  () =>
    ({
      'header-row-class-name': 'table__header',
      height: 'calc(100vh - 143px)',
      class: 'table__content',
      size: 'small',
    } as any)
);

const {
  search,
  getTableData,
  searchTableData,
  handleAddMock,
  handleStateChange,
  handleDeleteMock,
  handleDeleteAllMock,
  handleSave,
} = useTableData(computed(() => props.groupId));

const handleGoDetail = (data: MockItem) => {
  const { id } = data;
  router.push({ name: 'detail', params: { id } });
};

useTabActiveListener(getTableData);

const handleClearStorage = async () => {
  await clearStorage();
  Message({
    type: 'success',
    message: '清空成功',
  });
  location.reload();
};
</script>
<style scoped lang="less">
.table {
  flex: 1;
  &:extend(.border-box);
  :deep(.table__header) {
    height: 48px;
  }
  &__content {
    border-radius: 4px 4px 0 0;
  }
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
