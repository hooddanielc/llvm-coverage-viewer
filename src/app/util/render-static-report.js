import fs from './fs';
import path from 'path';
import btoa from 'btoa';

const render_localfs_script_tag = (path, content, replace=true) => `
  <script type="text/localfs" data-path="${path}">${
    replace ? btoa(content) : content
  }</script>
`;

// const fallback_dist = path.resolve(__dirname, '..', '..', '..', '..', '..', 'dist');

export default ({report, output, use_dist, prefix_dir}) => {
  const dist = use_dist;
  const filenames = report.filenames;
  const local_fs_tags = filenames.map((f) => {
    const filepath = path.isAbsolute(f) ? f : path.join(prefix_dir, f);
    return render_localfs_script_tag(f, fs.readFileSync(filepath, 'utf8'));
  });
  local_fs_tags.push(render_localfs_script_tag('%%___static_report___%%.json', report.report_json, false));
  const hl_worker_path = '%%___highlight_worker___%%.js';
  const hl_worker_src = fs.readFileSync(path.join(dist, 'worker/llvm-coverage-viewer-highlight-worker.js'), 'utf8');
  local_fs_tags.push(render_localfs_script_tag(hl_worker_path, hl_worker_src, false));
  const app_src = fs.readFileSync(path.join(dist, 'app/llvm-coverage-viewer-browser.js'), 'utf8');
  const app_css = fs.readFileSync(path.join(dist, 'app/assets/llvm-coverage-viewer.css'), 'utf8');

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>LLVM Coverage Viewer</title>
        <style type="text/css">
          ${app_css}
        </style>
        ${local_fs_tags.join('\n\n')}
      </head>
      <body>
        <div id="llvm-coverage-viewer-root" class="llvm-coverage-viewer-root"></div>
        <script type="text/javascript">
          ${app_src}
        </script>
      </body>
    </html>
  `;

  fs.writeFileSync(output, html);
}
