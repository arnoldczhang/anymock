import { MockGroup } from '@/types/mock';
import { v4 as uuid } from 'uuid';

// 生成接口分组
export const genMockGroup = (name: string): MockGroup => {
  return {
    id: uuid(),
    name,
  };
};
