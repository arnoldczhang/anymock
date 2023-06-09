import { ElMessage as Message, ElMessageBox as MessageBox } from 'element-plus';
import { ComputedRef } from 'vue';

import { STATUS } from '@/const';
import { api } from '@/service';
import { MockItem, Tag } from '@/types/mock';
import { genMockInterface, genTag, transfromJson2TreeData } from '@/utils';

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

  /**
   * 基于给定url和json生成mock
   *
   * @param name
   * @param originData
   */
  const handleAddMockFromLog = async (
    name: string,
    originData: Record<string, any>
  ) => {
    const data = transfromJson2TreeData(originData);
    const mock = genMockInterface(groupId.value, name);
    mock.tags = [genTag(originData, data)];
    tableData.value.push(mock);
    await handlePureSave();
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

  const handlePureSave = async () => {
    await api.mock.updateList(toRaw(tableData.value), groupId.value);
  };

  const handleSave = async () => {
    await handlePureSave();
    Message.success('保存成功');
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
      Message.success('清空成功');
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
    handleAddMockFromLog,
    handleDeleteMock,
    handleDeleteAllMock,
    handleSave,
    getTableData,
  };
};
