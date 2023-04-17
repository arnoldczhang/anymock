import { ElMessage as Message, ElMessageBox as MessageBox } from 'element-plus';
import { debounce } from 'lodash';
import { api } from '@/service';
import { MockGroup } from '@/types/mock';

export const useMockGroup = () => {
  // 当前接口分组
  const currentMockGroup = ref<MockGroup>();
  // 所有接口分组
  const mockGroupList = ref<Array<MockGroup>>([]);

  const getMockGroupById = (id: string) => {
    return mockGroupList.value.find((item) => item.id === id) as MockGroup;
  };
  const getCurrentGroupId = async () => {
    return await api.currentGroupId.get();
  };
  const setCurrentMockGroup = async (id: string) => {
    if (!id) return;
    await api.currentGroupId.update(id);
    currentMockGroup.value = getMockGroupById(id);
  };

  // 增
  const addMockGroup = async (name: string) => {
    const id = await api.group.add(name);
    await getMockGroupList(false);
    // 将新增的分组设置为当前分组
    setCurrentMockGroup(id);
  };

  // 删
  const removeMockGroup = async () => {
    try {
      await MessageBox.confirm('确定删除当前接口分组？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      const id = currentMockGroup.value?.id as string;
      await api.group.remove(id);
      // 删除分组下的所有接口
      await api.mock.clearList(id);
      await getMockGroupList();
    } catch (error) {
      // TODO
    }
  };

  // 改
  const modifyMockGroupName = async (mockGroup: MockGroup) => {
    await api.group.modify(mockGroup);
    await getMockGroupList(false);
  };

  // 查
  const getMockGroupList = async (
    needSelectFirst = true // 是否需要选中第一个
  ) => {
    mockGroupList.value = await api.group.getList();
    if (needSelectFirst) {
      // 选中第一个分组
      const id = mockGroupList.value[0]?.id;
      await setCurrentMockGroup(id);
    }
  };

  // 复制分组
  const copyGroup = debounce(async () => {
    if (currentMockGroup.value) {
      const id = await api.group.copy(currentMockGroup.value);
      await getMockGroupList(false);
      // 将新增的分组设置为当前分组
      setCurrentMockGroup(id);
      Message({
        type: 'success',
        message: '复制成功',
      });
    }
  }, 500);

  return {
    currentMockGroup,
    mockGroupList,
    getCurrentGroupId,
    setCurrentMockGroup,
    getMockGroupList,
    addMockGroup,
    removeMockGroup,
    modifyMockGroupName,
    copyGroup,
  };
};
