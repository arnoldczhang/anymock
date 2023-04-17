<template>
  <article>
    <el-table :data="searchTableData" v-bind="tableProps">
      <el-table-column prop="name" label="接口" show-overflow-tooltip>
        <template #header>
          <header class="header--name">
            <span>接口</span>
            <el-input
              class="header--name__input"
              placeholder="可搜索接口名"
              :prefix-icon="Search"
              v-model="search"
            />
          </header>
        </template>
      </el-table-column>
      <el-table-column prop="delay" label="请求延时" show-overflow-tooltip>
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
          <el-switch v-model="row.status" @change="handleSave" />
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
    <p class="footer">
      <el-button
        class="btn"
        type="danger"
        size="small"
        @click="handleDeleteAllMock"
      >
        清空所有mock
      </el-button>
      <el-button
        class="btn"
        type="danger"
        size="small"
        @click="handleClearStorage"
      >
        清空storage(仅用于调试)
      </el-button>
      <el-button
        class="btn mr8"
        type="primary"
        size="small"
        @click="handleAddMock"
      >
        新增mock
      </el-button>
    </p>
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
      height: 'calc(100vh - 95px)',
      size: 'small',
    } as any)
);

const {
  search,
  getTableData,
  searchTableData,
  handleAddMock,
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
article {
  flex: 1;
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
  display: flex;
  justify-content: end;
  padding: 10px 0;
}
</style>
