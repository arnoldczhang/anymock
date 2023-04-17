import { ElMessage as Message } from "element-plus";
import { api } from "@/service";
import { genMockInterface } from "@/utils";

export const useMockItemData = () => {
  const mockItem = ref(genMockInterface());
  const getMockItem = async (id: string) => {
    mockItem.value = await api.mock.get(id);
  };

  /**
   * 保存变更
   */
  const handleSave = async () => {
    await api.mock.modify(toRaw(mockItem.value));
    Message({
      type: 'success',
      message: '保存成功',
    });
  };

  return {
    mockItem,
    getMockItem,
    handleSave
  };
};
