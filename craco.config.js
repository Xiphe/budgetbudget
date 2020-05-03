const { resolve } = require('path');
const { NormalModuleReplacementPlugin } = require('webpack');

const testPlugins = [
  new NormalModuleReplacementPlugin(
    /^fs$/,
    resolve(__dirname, 'src/__mocks__/fs.ts'),
  ),
  new NormalModuleReplacementPlugin(
    /^electron$/,
    resolve(__dirname, 'src/__mocks__/electron.ts'),
  ),
];

module.exports = {
  webpack: {
    plugins: process.env.REACT_APP_ENV === 'test' ? testPlugins : [],
    configure: {
      target:
        process.env.REACT_APP_ENV === 'test' ? 'web' : 'electron-renderer',
    },
  },
};
