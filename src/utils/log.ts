import projectInfo from '../../public/manifest.json';

const log = (...args: any[]) => {
  console.log(
    `%c AnyMock %c v${projectInfo.version} %c`,
    'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
    'background:rgb(228, 108, 51) ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
    'background:transparent',
    ...args
  );
};

export default {
  log,
};
