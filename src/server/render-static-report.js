import * as fsPromises from 'node:fs/promises'
import path from 'path';
import btoa from 'btoa';

const render_localfs_script_tag = (path, content, replace=true) => `
  <script type="text/localfs" data-path="${path}">\n${
    replace ? btoa(content) : content
  }\n</script>
`;

export default async ({report, output, use_dist, prefix_dir, debug}) => {
  const dist = use_dist;
  const filenames = report.filenames;
  const local_fs_tags = [];
  local_fs_tags.push(render_localfs_script_tag('%%___static_report___%%.json', report.report_json, false));
  const headers = [];
  const footers = [];
  let output_html = output;
  if (debug) {
    await fsPromises.cp(
      path.join(dist, "app/assets"),
      path.join(output, 'assets'),
      {recursive: true}
    );
    await fsPromises.cp(
      path.join(dist, "app/llvm-coverage-viewer-browser.js"),
      path.join(output, 'llvm-coverage-viewer-browser.js'),
    );
    await fsPromises.cp(
      path.join(dist, "worker/llvm-coverage-viewer-highlight-worker.js"),
      path.join(output, 'llvm-coverage-viewer-highlight-worker.js')
    );
    headers.push(`<link rel="stylesheet" href="assets/llvm-coverage-viewer.css"></link>`);
    footers.push(`<script type="text/javascript" src="llvm-coverage-viewer-browser.js"></script>`);
    for (const filename of filenames) {
      const filepath = path.isAbsolute(filename) ? filename : path.join(prefix_dir, filename);
      await fsPromises.cp(
        filepath,
        path.join(output, filename),
      );
    }
    output_html = path.join(output, 'index.html');
  } else {
    const hl_worker_path = '%%___highlight_worker___%%.js';
    const hl_worker_src = await fsPromises.readFile(path.join(dist, 'worker/llvm-coverage-viewer-highlight-worker.js'), 'utf8');
    local_fs_tags.push(render_localfs_script_tag(hl_worker_path, hl_worker_src, false));
    const app_src = await fsPromises.readFile(path.join(dist, 'app/llvm-coverage-viewer-browser.js'), 'utf8');
    const app_css = await fsPromises.readFile(path.join(dist, 'app/assets/llvm-coverage-viewer.css'), 'utf8');
    for (const filename of filenames) {
      const filepath = path.isAbsolute(filename) ? filename : path.join(prefix_dir, filename);
      const content = await fsPromises.readFile(filepath, 'utf8');
      local_fs_tags.push(render_localfs_script_tag(filename, content));
    }
    headers.push(`<style type="text/css">\n${app_css}\n</style>`);
    footers.push(`<script type="text/javascript">\n${app_src}\n</script>`);
  }
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>LLVM Coverage Viewer</title>
        ${headers.join('\n\n')}
        ${local_fs_tags.join('\n\n')}
      </head>
      <body>
        <div id="llvm-coverage-viewer-root" class="llvm-coverage-viewer-root"></div>
        ${footers.join('\n\n')}
      </body>
    </html>
  `;
  await fsPromises.writeFile(output_html, html);
}
