const EVENT = {
  update: 'update',
  // 初始化mock数据
  init_data: 'init-data',
  // 初始化请求头数据
  init_req_header: 'init-req-header',
  // 初始化响应头数据
  init_res_header: 'init-res-header',
  // 初始化黑名单数据
  init_blacklist: 'init-blacklist',
  // page端录制
  record: 'record',
  // 录制状态变更
  record_state: 'record-state',
  // mock面板关闭/隐藏时
  inactive: 'inactive',
  // 纯打印日志
  log: 'log',
};

export default EVENT;
