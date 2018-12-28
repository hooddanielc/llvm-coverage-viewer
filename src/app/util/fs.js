import fs from 'fs';

const readFileSync = fs.readFileSync || ((filepath, encoding) => {
  // if fs implementation does not exist,
  // try querying script tag for file
  const script_tag = document.querySelector(`script[type="text/localfs"][data-path="${filepath}"]`);
  if (!script_tag) {
    throw new Error('file does not exist: ' + filepath);
  }
  if (filepath === '%%___highlight_worker___%%.js' || filepath === '%%___static_report___%%.json') {
    return script_tag.innerHTML;
  }
  return atob(script_tag.innerHTML);
});

const writeFileSync = fs.writeFileSync || null;

export default {
  readFileSync,
  writeFileSync,
}

export {
  readFileSync,
  writeFileSync,
}
