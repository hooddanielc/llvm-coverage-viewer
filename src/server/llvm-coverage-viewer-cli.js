import process from 'process';
import {program} from 'commander';
import pkg from '../../package.json';
import fs from 'fs';
import path from 'path';
import render_static_report from '/@/app/util/render-static-report';

program
  .version(pkg.version)
  .option('-j, --json <file>', 'Convert llvm code coverage json to html')
  .option('-o, --output <file>', 'Path to save html report to')
  .option('-d, --dir <dir>', 'dir profix');
program.parse();

const options = program.opts();

console.log(options)
if (!options.json || !options.output) {
  throw new Error('--output and --json required');
}

if (!fs.existsSync(options.json)) {
  throw new Error('report does not exist');
}

let report_json = null;
let report_origin_json = null;
const current_dir = path.resolve('.').replaceAll('\\', '/');
const prefix_dir = path.resolve((options.dir || current_dir)).replaceAll('\\', '/');

try {
  report_origin_json = fs.readFileSync(options.json, 'utf8');
  report_json = JSON.parse(report_origin_json);
} catch (e) {
  console.log('Error: Unable to read JSON file');
  throw e;
}

function normalize_filename(filename) {
  filename = filename.replaceAll('\\', '/');
  if (!path.isAbsolute(filename)) filename = path.join(current_dir, filename);
  if (filename.startsWith(prefix_dir)) {
    filename = filename.substring(prefix_dir.length+1);
  }
  return filename;
}

for (const data of report_json.data) {
  for (const file of data.files) {
    file.filename = normalize_filename(file.filename);
  }
  for (const fun of data.functions) {
    fun.filenames = fun.filenames.map(normalize_filename);
  }
}

render_static_report({
  use_dist: path.join(__dirname, '..'),
  report: {
    filenames: report_json.data[0].files.map(({filename}) => filename),
    report_json: JSON.stringify(report_json),
  },
  output: options.output,
  prefix_dir: prefix_dir,
});
