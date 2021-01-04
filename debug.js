const { exec } = require('child_process');

const MB = 1024 * 1024;
const ACCOUNT = '70c43e23-4d59-460d-a522-485735718ce2';
const START_DATE = '2020-12-22';
const MAX_BUFFER = 100 * MB;

function addStdErr(err, stderr) {
  err.stderr = stderr;

  return err;
}

function osascript() {
  return new Promise((resolve, reject) => {
    exec(
      `osascript -e "tell application \\"MoneyMoney\\" to export transactions from account \\"${ACCOUNT}\\" from date \\"${START_DATE}\\" as \\"plist\\""`,
      { maxBuffer: MAX_BUFFER },
      (err, stdout, stderr) => {
        if (err) {
          return reject(addStdErr(err, stderr));
        }
        if (typeof stdout !== 'string') {
          return reject(
            new Error('Unexpectedly got non-string from oascript stdout'),
          );
        }
        resolve(stdout);
      },
    );
  });
}

osascript()
  .then((data) => {
    console.log(data);
    console.log('OK');
  })
  .catch(console.error);
