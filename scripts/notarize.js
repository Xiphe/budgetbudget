const { notarize } = require('electron-notarize');
const {
  build: { appId },
} = require('../package.json');

exports.default = async function notarizing({
  electronPlatformName,
  appOutDir,
  packager: {
    appInfo: { productFilename },
  },
}) {
  if (electronPlatformName !== 'darwin') {
    return;
  }

  console.log('notarizing...');
  await notarize({
    appBundleId: appId,
    appPath: `${appOutDir}/${productFilename}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });
  console.log('OK');
};
