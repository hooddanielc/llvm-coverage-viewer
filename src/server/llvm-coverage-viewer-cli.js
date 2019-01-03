import path from 'path';
import process from 'process';
import program from 'commander';
import pkg from '../../package.json';
import fs from 'fs';
import {Report} from '../app/models';
import render_static_report from '../app/util/render-static-report';

program
  .version(pkg.version)
  .option('-j, --json <file>', 'Convert llvm code coverage json to html')
  .option('-o, --output <file>', 'Path to save html report to')
  .parse(process.argv);

if (!program.json || !program.output) {
  throw new Error('--output and --json required');
}

if (!fs.existsSync(program.json)) {
  throw new Error('report does not exist');
}

let report_json = null;

try {
  report_json = JSON.parse(fs.readFileSync(program.json, 'utf8'));
} catch (e) {
  console.log('Error: Unable to read JSON file');
  throw e;
}

const report = new Report({report: report_json});

render_static_report({
  use_dist: __dirname,
  report: {
    filenames: report.get_filenames(),
    report_json: report.report_json,
  },
  output: program.output,
});
