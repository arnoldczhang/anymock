export const HOME = {
  path: '/home',
  label: '接口列表',
  icon: 'HomeFilled',
  name: 'home',
};

export const REQ_HEADER = {
  path: '/header',
  label: '请求头',
  icon: 'Document',
  name: 'header',
};

export const BLACK_LIST = {
  path: '/blacklist',
  label: '黑名单',
  icon: 'List',
  name: 'blacklist',
};

export const RECORDER = {
  path: '/recorder',
  label: '请求录制',
  icon: 'VideoPlay',
  name: 'recorder',
};

export const MOCK_DETAIL = {
  path: '/detail/:id',
  label: '接口详情页',
  name: 'detail',
};

export const ROUTER = [HOME, REQ_HEADER, BLACK_LIST, MOCK_DETAIL];
