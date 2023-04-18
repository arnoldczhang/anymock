import { MockItem, Tag } from '@/types/mock';
import { genMockInterface } from '@/utils';
import { ElMessage as Message, ElMessageBox as MessageBox } from 'element-plus';
import { ComputedRef } from 'vue';
import { api } from '@/service';
import { STATUS } from '@/const';

export const useTableData = (groupId: ComputedRef<string>) => {
  // 当前使用的接口列表
  const tableData = ref<MockItem[]>([]);

  const search = ref('');

  const searchTableData = computed(() =>
    search.value
      ? tableData.value.filter(({ name }) => name.indexOf(search.value) > -1)
      : tableData.value
  );

  const handleAddMock = async () => {
    const defaultInterface = genMockInterface(groupId.value);
    tableData.value.push(defaultInterface);
    await handleSave();
  };

  const handleStateChange = async (data: MockItem) => {
    const allDisabled =
      data.tags.length &&
      data.tags.every((tag: Tag) => tag.status === STATUS.disable);

    if (allDisabled) {
      data.tags[0].status = STATUS.enable;
    }
    await handleSave();
  };

  const handleDeleteMock = async (data: MockItem) => {
    const index = tableData.value.findIndex((item) => item.id === data.id);
    tableData.value.splice(index, 1);
    await handleSave();
  };

  const handleSave = async () => {
    await api.mock.updateList(toRaw(tableData.value), groupId.value);
    Message({
      type: 'success',
      message: '保存成功',
    });
  };

  const handleDeleteAllMock = async () => {
    try {
      await MessageBox.confirm('确认清空？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await api.mock.clearList(groupId.value);
      await getTableData();
      Message({
        type: 'success',
        message: '清空成功',
      });
    } catch (err) {
      // 取消时暂不处理
    }
  };

  const getTableData = async () => {
    if (!groupId.value) return;
    tableData.value = await api.mock.getList(groupId.value);
  };

  watch(groupId, getTableData, { immediate: true });

  return {
    search,
    tableData,
    searchTableData,
    handleStateChange,
    handleAddMock,
    handleDeleteMock,
    handleDeleteAllMock,
    handleSave,
    getTableData,
  };
};
