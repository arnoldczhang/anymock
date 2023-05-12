import EVENT from '../../src/const/event';
import { runtime, tab } from '../../src/utils/message';

chrome.devtools.panels.create(
  'Mock',
  'icons/16-enabled.png',
  'index.html',
  function (panel) {
    panel.onHidden.addListener(() => {
      tab.send({ type: EVENT.record_state, data: '' });
      runtime.send({ type: EVENT.inactive });
      console.log('Mock面板隐藏了');
    });
    panel.onShown.addListener(() => {
      runtime.send({ type: EVENT.active });
      console.log('Mock面板显示了');
    });
    console.log('自定义面板创建成功！'); // 注意这个log一般看不到
  }
);
