import { TYPE } from './index';

export const mockKey = {
  string510: '@word(5, 10)',
  ctitle510: '@ctitle(5, 10)',
  integer10100: '@integer(10, 100)',
  randomOne: '@pick',
  guid: '@guid()',
  custom: 'custom',
  field: 'field',
};

export const mockName = {
  [mockKey.string510]: '随机5~10位英文字母',
  [mockKey.ctitle510]: '随机5~10位中文',
  [mockKey.integer10100]: '随机10~100的数字',
  [mockKey.guid]: '随机uuid',
  [mockKey.randomOne]: '随机指定值',
  [mockKey.custom]: '自定义mock',
  [mockKey.field]: '指定字段',
};

export const mockKeyMap: Record<string, string> = {
  [mockKey.string510]: mockName[mockKey.string510],
  [mockKey.ctitle510]: mockName[mockKey.ctitle510],
  [mockKey.integer10100]: mockName[mockKey.integer10100],
  [mockKey.randomOne]: mockName[mockKey.randomOne],
  [mockKey.guid]: mockName[mockKey.guid],
  [mockKey.custom]: mockName[mockKey.custom],
  [mockKey.field]: mockName[mockKey.field],
};

export const mockSelection = [
  {
    value: '',
    label: '不使用mock',
  },
  ...Object.entries(mockKeyMap).map(([value, label]) => ({
    value,
    label,
  })),
];

export const mockLengthSelection = [
  {
    value: '',
    label: '不使用mock',
  },
  {
    value: '@integer',
    label: '随机长度',
  },
];

export const typeSelection = Object.entries(TYPE).map(([value, label]) => ({
  value,
  label,
}));

export const mockFn = [
  { name: '字符串', mock: '@string()' },
  { name: '自然数', mock: '@natural()' },
  { name: '浮点数', mock: '@float()' },
  { name: '字符', mock: '@character()' },
  { name: '布尔', mock: '@boolean()' },
  { name: 'url', mock: '@url()' },
  { name: '域名', mock: '@domain()' },
  { name: 'ip地址', mock: '@ip()' },
  { name: 'id', mock: '@id()' },
  { name: 'guid', mock: '@guid()' },
  { name: '当前时间', mock: '@now()' },
  { name: '时间戳', mock: '@timestamp()' },
  { name: '日期', mock: '@date()' },
  { name: '时间', mock: '@time()' },
  { name: '日期时间', mock: '@datetime()' },
  { name: '图片连接', mock: '@image()' },
  { name: '图片data', mock: '@imageData()' },
  { name: '颜色', mock: '@color()' },
  { name: '颜色hex', mock: '@hex()' },
  { name: '颜色rgba', mock: '@rgba()' },
  { name: '颜色rgb', mock: '@rgb()' },
  { name: '颜色hsl', mock: '@hsl()' },
  { name: '整数', mock: '@integer()' },
  { name: 'email', mock: '@email()' },
  { name: '大段文本', mock: '@paragraph()' },
  { name: '句子', mock: '@sentence()' },
  { name: '单词', mock: '@word()' },
  { name: '大段中文文本', mock: '@cparagraph()' },
  { name: '中文标题', mock: '@ctitle()' },
  { name: '标题', mock: '@title()' },
  { name: '姓名', mock: '@name()' },
  { name: '中文姓名', mock: '@cname()' },
  { name: '中文姓', mock: '@cfirst()' },
  { name: '中文名', mock: '@clast()' },
  { name: '英文姓', mock: '@first()' },
  { name: '英文名', mock: '@last()' },
  { name: '中文句子', mock: '@csentence()' },
  { name: '中文词组', mock: '@cword()' },
  { name: '地址', mock: '@region()' },
  { name: '省份', mock: '@province()' },
  { name: '城市', mock: '@city()' },
  { name: '地区', mock: '@county()' },
  { name: '转换为大写', mock: '@upper()' },
  { name: '转换为小写', mock: '@lower()' },
  { name: '挑选（枚举）', mock: '@pick()' },
  { name: '打乱数组', mock: '@shuffle()' },
  { name: '协议', mock: '@protocol()' },
];

export const mockFnSelection = mockFn.map(({ name, mock }) => ({
  value: mock,
  label: mock,
  description: name,
}));
