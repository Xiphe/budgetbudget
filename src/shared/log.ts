if (process.env.REACT_APP_ENV !== 'test') {
  const { functions } = require('electron-log');
  Object.assign(console, functions);
}

export default null;
