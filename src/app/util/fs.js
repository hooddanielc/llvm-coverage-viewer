import fs from 'fs';

const readFileSync = fs.readFileSync || ((filepath, encoding) => {
  const script_tag = document.querySelector(`script[type="text/localfs"][data-path="${filepath}"]`);
  if (!script_tag) {
    return null;
  }
  if (filepath === '%%___highlight_worker___%%.js' || filepath === '%%___static_report___%%.json') {
    return script_tag.innerHTML;
  }
  return atob(script_tag.innerHTML);
});

const readFile = async (filepath, encoding) => {
  if (typeof fetch !== 'undefined') {
    const src = readFileSync(filepath, encoding);
    if (src) return src;
    const resp = await fetch(filepath);
    if (resp.status !== 200) return null;
    return resp.text();
  } else {
    return fs.readFileSync(filepath, encoding)
  }
};

const writeFileSync = fs.writeFileSync || (() => {});

export default {
  readFileSync,
  readFile,
  writeFileSync,
}

export {
  readFileSync,
  readFile,
  writeFileSync,
}
