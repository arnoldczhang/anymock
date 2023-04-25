import * as mock from './mock';
import * as group from './group';
import * as currentMockList from './currentMockList';
import * as currentGroupId from './currentGroupId';
import * as reqHeader from './reqHeader';
import * as recorder from './recorder';
import * as blacklist from './blacklist';

export const api = {
  mock,
  group,
  currentGroupId,
  currentMockList,
  reqHeader,
  recorder,
  blacklist,
};

export default api;
