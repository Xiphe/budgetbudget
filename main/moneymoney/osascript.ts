import { exec } from 'child_process';
const MB = 1024 * 1024;

type ErrWithStdErr = Error & {
  stderr?: string;
};

function addStdErr(err: Error, stderr?: string): ErrWithStdErr {
  (err as ErrWithStdErr).stderr = stderr;

  return err;
}

export default function osascript(scriptFile: string, ...args: string[]) {
  return new Promise<string>((resolve, reject) => {
    exec(
      `osascript ${scriptFile} ${args
        .map((arg) => `"${arg.replace(/"/g, '\\"')}"`)
        .join(' ')}`,
      { maxBuffer: 100 * MB },
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
