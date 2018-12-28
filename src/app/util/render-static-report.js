import fs from './fs';
import path from 'path';
import btoa from 'btoa';

const ll = '<';
const rr = '>';

const render_localfs_script_tag = (path, content, replace=true) => `
  ${ll}script type="text/localfs" data-path="${path}"${rr}${
    replace ? btoa(content) : content
  }${ll}/script${rr}
`;

const fallback_dist = path.resolve(__dirname, '..', '..', '..', 'dist');

export default ({report, output, use_dist}) => {
  const dist = use_dist || fallback_dist;
  const filenames = report.filenames;
  const local_fs_tags = filenames.map((f) => render_localfs_script_tag(f, fs.readFileSync(f, 'utf8')));
  local_fs_tags.push(render_localfs_script_tag('%%___static_report___%%.json', report.report_json, false));
  const hl_worker_path = '%%___highlight_worker___%%.js';
  const hl_worker_src = fs.readFileSync(path.join(dist, 'llvm-coverage-viewer-highlight-worker.js'), 'utf8');
  local_fs_tags.push(render_localfs_script_tag(hl_worker_path, hl_worker_src, false));
  const app_src = fs.readFileSync(path.join(dist, 'llvm-coverage-viewer-browser.js'), 'utf8');

  const html = `
    ${ll}!doctype html${rr}
    ${ll}html${rr}
      ${ll}head${rr}
        ${ll}meta charset="UTF-8"${rr}
        ${ll}title${rr}LLVM Coverage Viewer${ll}/title${rr}
      ${ll}/head${rr}
      ${ll}body${rr}
        ${local_fs_tags.join('\n\n')}
        ${ll}script type="text/javascript"${rr}

          ${app_src}

        ${ll}/script${rr}
      ${ll}/body${rr}
    ${ll}/html${rr}
  `;

  fs.writeFileSync(output, html);
}
