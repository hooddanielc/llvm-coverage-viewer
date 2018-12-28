import child_process from 'child_process';

export default (cmd, args=[], opts={}) => {
  return new Promise((resolve, reject) => {
    const child = child_process.spawn(cmd, args, opts);
    let stderr = '';
    let stdout = '';
    child.stderr.on('data', (data) => stderr += data.toString());
    child.stdout.on('data', (data) => stdout += data.toString());
    child.on('exit', (code) => {
      const result = {stderr, stdout, code}
      if (code === 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  });
}
